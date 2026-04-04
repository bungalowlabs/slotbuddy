import { db } from "@/db";
import { bookings, businesses, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { sendCancellationConfirmation } from "@/lib/email";

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.cancellationToken, token))
    .limit(1);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ error: "This booking has already been cancelled" }, { status: 400 });
  }

  await db
    .update(bookings)
    .set({ status: "cancelled" })
    .where(eq(bookings.id, booking.id));

  // Send cancellation email
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, booking.businessId))
    .limit(1);

  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.id, booking.serviceId))
    .limit(1);

  if (business && service) {
    const dateDisplay = new Date(booking.startTime).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: business.timezone,
    });
    const timeDisplay = new Date(booking.startTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: business.timezone,
    });

    sendCancellationConfirmation({
      customerEmail: booking.customerEmail,
      customerName: booking.customerName,
      businessName: business.name,
      serviceName: service.name,
      date: dateDisplay,
      time: timeDisplay,
    }).catch(console.error);
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const [booking] = await db
    .select({
      id: bookings.id,
      customerName: bookings.customerName,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      serviceName: services.name,
      businessName: businesses.name,
      timezone: businesses.timezone,
    })
    .from(bookings)
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .leftJoin(businesses, eq(bookings.businessId, businesses.id))
    .where(eq(bookings.cancellationToken, token))
    .limit(1);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json(booking);
}
