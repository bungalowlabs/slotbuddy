import { auth } from "@/lib/auth";
import { db } from "@/db";
import { availability, businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

async function getUserBusiness(userId: string) {
  const result = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getUserBusiness(session.user.id);
  if (!business) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  const slots = await db
    .select()
    .from(availability)
    .where(eq(availability.businessId, business.id));

  return NextResponse.json(slots);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getUserBusiness(session.user.id);
  if (!business) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  const { schedule } = await req.json();

  if (!Array.isArray(schedule)) {
    return NextResponse.json({ error: "Invalid schedule data" }, { status: 400 });
  }

  // Delete existing availability and replace
  await db.delete(availability).where(eq(availability.businessId, business.id));

  const values = schedule
    .filter((day: { isEnabled: boolean }) => day.isEnabled)
    .map((day: { dayOfWeek: number; startTime: string; endTime: string; isEnabled: boolean }) => ({
      businessId: business.id,
      dayOfWeek: day.dayOfWeek,
      startTime: day.startTime,
      endTime: day.endTime,
      isEnabled: true,
    }));

  if (values.length > 0) {
    await db.insert(availability).values(values);
  }

  return NextResponse.json({ success: true });
}
