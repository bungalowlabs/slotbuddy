import { db } from "@/db";
import { bookings, businesses, services, users } from "@/db/schema";
import { eq, and, lt, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendBookingConfirmation, sendNewBookingNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { isBusinessBookable } from "@/lib/business-access";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const {
    businessSlug,
    serviceId,
    startTime,
    endTime,
    customerName,
    customerEmail,
    customerPhone,
    notes,
    fieldValues,
  } = await req.json();

  if (!businessSlug || !serviceId || !startTime || !endTime || !customerName?.trim() || !customerEmail?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate business
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, businessSlug))
    .limit(1);

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Block bookings if owner's trial expired and they have no active subscription
  if (!(await isBusinessBookable(business.userId))) {
    return NextResponse.json(
      { error: "This business is not currently accepting online bookings." },
      { status: 403 }
    );
  }

  // Validate service
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.businessId, business.id)))
    .limit(1);

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const rawStart = new Date(startTime);
  const rawEnd = new Date(endTime);
  const bufferBeforeMs = (service.bufferBeforeMinutes ?? 0) * 60000;
  const bufferAfterMs = (service.bufferAfterMinutes ?? 0) * 60000;
  const slotStart = new Date(rawStart.getTime() - bufferBeforeMs);
  const slotEnd = new Date(rawEnd.getTime() + bufferAfterMs);

  // Check for conflicts — confirmed + pending, with each existing booking's own buffers
  const conflictWindowStart = new Date(slotStart.getTime() - 6 * 60 * 60 * 1000);
  const conflictWindowEnd = new Date(slotEnd.getTime() + 6 * 60 * 60 * 1000);
  const nearby = await db
    .select({
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      bufferBefore: services.bufferBeforeMinutes,
      bufferAfter: services.bufferAfterMinutes,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .where(
      and(
        eq(bookings.businessId, business.id),
        lt(bookings.startTime, conflictWindowEnd),
        gt(bookings.endTime, conflictWindowStart)
      )
    );

  const hasConflict = nearby.some((b) => {
    if (b.status !== "confirmed" && b.status !== "pending") return false;
    const bStart = new Date(new Date(b.startTime).getTime() - (b.bufferBefore ?? 0) * 60000);
    const bEnd = new Date(new Date(b.endTime).getTime() + (b.bufferAfter ?? 0) * 60000);
    return slotStart < bEnd && slotEnd > bStart;
  });

  if (hasConflict) {
    return NextResponse.json(
      { error: "This time slot is no longer available. Please choose another time." },
      { status: 409 }
    );
  }

  const cancellationToken = crypto.randomBytes(32).toString("hex");
  const bookingStatus = service.requiresApproval ? "pending" : "confirmed";

  const [booking] = await db
    .insert(bookings)
    .values({
      businessId: business.id,
      serviceId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone?.trim() || null,
      startTime: rawStart,
      endTime: rawEnd,
      status: bookingStatus,
      cancellationToken,
      notes: notes?.trim() || null,
      fieldValues: fieldValues && typeof fieldValues === "object" ? fieldValues : null,
    })
    .returning();

  // Send emails (don't block the response)
  const baseUrl = req.headers.get("origin") || "https://helloslotbuddy.com";
  const dateDisplay = slotStart.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: business.timezone,
  });
  const timeDisplay = slotStart.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: business.timezone,
  });

  // Get business owner email
  const [owner] = await db
    .select()
    .from(users)
    .where(eq(users.id, business.userId))
    .limit(1);

  const emailPromises = [
    sendBookingConfirmation({
      customerEmail: customerEmail.trim(),
      customerName: customerName.trim(),
      businessName: business.name,
      serviceName: service.name,
      date: dateDisplay,
      time: timeDisplay,
      businessPhone: business.phone,
      businessAddress: business.address,
      cancellationToken,
      baseUrl,
    }),
  ];

  if (owner) {
    emailPromises.push(
      sendNewBookingNotification({
        ownerEmail: owner.email,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone?.trim(),
        businessName: business.name,
        serviceName: service.name,
        date: dateDisplay,
        time: timeDisplay,
      })
    );
  }

  // Fire and forget — don't let email failures block the booking
  Promise.all(emailPromises).catch(console.error);

  return NextResponse.json({ id: booking.id, cancellationToken, status: bookingStatus });
}
