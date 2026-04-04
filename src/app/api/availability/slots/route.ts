import { db } from "@/db";
import { businesses, services, availability, bookings, blockedTimes } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const businessSlug = url.searchParams.get("business");
  const serviceId = url.searchParams.get("service");
  const dateStr = url.searchParams.get("date"); // YYYY-MM-DD

  if (!businessSlug || !serviceId || !dateStr) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Get business
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, businessSlug))
    .limit(1);

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Get service
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.businessId, business.id)))
    .limit(1);

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Parse the date in the business's timezone
  const date = new Date(dateStr + "T00:00:00");
  const dayOfWeek = getDayOfWeekInTimezone(dateStr, business.timezone);

  // Get availability for this day of week
  const [dayAvailability] = await db
    .select()
    .from(availability)
    .where(
      and(
        eq(availability.businessId, business.id),
        eq(availability.dayOfWeek, dayOfWeek),
        eq(availability.isEnabled, true)
      )
    )
    .limit(1);

  if (!dayAvailability) {
    return NextResponse.json({ slots: [] });
  }

  // Generate slots
  const slots = generateSlots(
    dateStr,
    dayAvailability.startTime,
    dayAvailability.endTime,
    service.durationMinutes,
    business.timezone
  );

  // Get existing bookings for this day
  const dayStart = toUTC(dateStr, dayAvailability.startTime, business.timezone);
  const dayEnd = toUTC(dateStr, dayAvailability.endTime, business.timezone);

  const existingBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.businessId, business.id),
        eq(bookings.status, "confirmed"),
        gte(bookings.startTime, dayStart),
        lte(bookings.startTime, dayEnd)
      )
    );

  // Get blocked times that overlap
  const blocked = await db
    .select()
    .from(blockedTimes)
    .where(
      and(
        eq(blockedTimes.businessId, business.id),
        lte(blockedTimes.startTime, dayEnd),
        gte(blockedTimes.endTime, dayStart)
      )
    );

  // Filter out unavailable slots
  const now = new Date();
  const availableSlots = slots.filter((slot) => {
    const slotStart = new Date(slot.startUTC);
    const slotEnd = new Date(slot.endUTC);

    // Past slots
    if (slotStart <= now) return false;

    // Overlapping bookings
    for (const booking of existingBookings) {
      const bStart = new Date(booking.startTime);
      const bEnd = new Date(booking.endTime);
      if (slotStart < bEnd && slotEnd > bStart) return false;
    }

    // Overlapping blocked times
    for (const block of blocked) {
      const bStart = new Date(block.startTime);
      const bEnd = new Date(block.endTime);
      if (slotStart < bEnd && slotEnd > bStart) return false;
    }

    return true;
  });

  return NextResponse.json({
    slots: availableSlots.map((s) => ({
      time: s.displayTime,
      startUTC: s.startUTC,
      endUTC: s.endUTC,
    })),
  });
}

function getDayOfWeekInTimezone(dateStr: string, timezone: string): number {
  const d = new Date(dateStr + "T12:00:00Z");
  const formatted = d.toLocaleDateString("en-US", { timeZone: timezone, weekday: "short" });
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return dayMap[formatted] ?? 0;
}

function toUTC(dateStr: string, timeStr: string, timezone: string): Date {
  // Create a date string and parse in the business timezone
  const dtStr = `${dateStr}T${timeStr}:00`;
  const date = new Date(dtStr);

  // Get the timezone offset
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  const offset = utcDate.getTime() - tzDate.getTime();

  return new Date(date.getTime() + offset);
}

function generateSlots(
  dateStr: string,
  startTime: string,
  endTime: string,
  durationMinutes: number,
  timezone: string
) {
  const slots: { displayTime: string; startUTC: string; endUTC: string }[] = [];

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let m = startMinutes; m + durationMinutes <= endMinutes; m += durationMinutes) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    const timeStr = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
    const endM2 = m + durationMinutes;
    const endH2 = Math.floor(endM2 / 60);
    const endMin2 = endM2 % 60;
    const endTimeStr = `${endH2.toString().padStart(2, "0")}:${endMin2.toString().padStart(2, "0")}`;

    const slotStart = toUTC(dateStr, timeStr, timezone);
    const slotEnd = toUTC(dateStr, endTimeStr, timezone);

    const period = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    const displayTime = `${displayH}:${min.toString().padStart(2, "0")} ${period}`;

    slots.push({
      displayTime,
      startUTC: slotStart.toISOString(),
      endUTC: slotEnd.toISOString(),
    });
  }

  return slots;
}
