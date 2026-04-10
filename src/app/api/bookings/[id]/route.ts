import { auth } from "@/lib/auth";
import { db } from "@/db";
import { bookings, businesses, services } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

  const { status } = await req.json();

  if (!["pending", "confirmed", "cancelled", "completed", "no_show"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [updated] = await db
    .update(bookings)
    .set({ status })
    .where(
      and(eq(bookings.id, params.id), eq(bookings.businessId, business[0].id))
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

  const [booking] = await db
    .select({
      id: bookings.id,
      customerName: bookings.customerName,
      customerEmail: bookings.customerEmail,
      customerPhone: bookings.customerPhone,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      notes: bookings.notes,
      fieldValues: bookings.fieldValues,
      createdAt: bookings.createdAt,
      serviceName: services.name,
      serviceDuration: services.durationMinutes,
    })
    .from(bookings)
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .where(
      and(eq(bookings.id, params.id), eq(bookings.businessId, business[0].id))
    );

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json(booking);
}
