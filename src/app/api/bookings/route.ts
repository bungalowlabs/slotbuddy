import { auth } from "@/lib/auth";
import { db } from "@/db";
import { bookings, businesses, services } from "@/db/schema";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session.user.id))
    .limit(1);

  if (business.length === 0) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const status = url.searchParams.get("status");

  const conditions = [eq(bookings.businessId, business[0].id)];

  if (start) conditions.push(gte(bookings.startTime, new Date(start)));
  if (end) conditions.push(lte(bookings.startTime, new Date(end)));
  if (status) conditions.push(eq(bookings.status, status));

  const result = await db
    .select({
      id: bookings.id,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      customerPhone: bookings.customerPhone,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      notes: bookings.notes,
      createdAt: bookings.createdAt,
      serviceName: services.name,
      serviceDuration: services.durationMinutes,
    })
    .from(bookings)
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .where(and(...conditions))
    .orderBy(asc(bookings.startTime));

  return NextResponse.json(result);
}
