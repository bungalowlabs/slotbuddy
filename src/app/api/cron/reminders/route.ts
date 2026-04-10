import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, businesses, services } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sendBookingReminder } from "@/lib/email";

export async function GET(req: Request) {
  // Verify cron secret (Vercel sets this header)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Find bookings happening tomorrow (within a 24-hour window)
  const tomorrowStart = new Date(tomorrow);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const upcomingBookings = await db
    .select({
      id: bookings.id,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      startTime: bookings.startTime,
      cancellationToken: bookings.cancellationToken,
      serviceName: services.name,
      businessName: businesses.name,
      businessPhone: businesses.phone,
      businessAddress: businesses.address,
      timezone: businesses.timezone,
    })
    .from(bookings)
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .leftJoin(businesses, eq(bookings.businessId, businesses.id))
    .where(
      and(
        eq(bookings.status, "confirmed"),
        gte(bookings.startTime, tomorrowStart),
        lte(bookings.startTime, tomorrowEnd)
      )
    );

  const baseUrl = process.env.AUTH_URL || "https://helloslotbuddy.com";
  let sent = 0;

  for (const booking of upcomingBookings) {
    try {
      const tz = booking.timezone || "America/Chicago";
      const dateDisplay = new Date(booking.startTime).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: tz,
      });
      const timeDisplay = new Date(booking.startTime).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: tz,
      });

      await sendBookingReminder({
        customerEmail: booking.customerEmail,
        customerName: booking.customerName,
        businessName: booking.businessName || "Your business",
        serviceName: booking.serviceName || "Appointment",
        date: dateDisplay,
        time: timeDisplay,
        businessPhone: booking.businessPhone,
        businessAddress: booking.businessAddress,
        cancellationToken: booking.cancellationToken,
        baseUrl,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send reminder for booking ${booking.id}:`, err);
    }
  }

  return NextResponse.json({ sent, total: upcomingBookings.length });
}
