import { auth } from "@/lib/auth";
import { db } from "@/db";
import { blockedTimes, businesses } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
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

  const blocks = await db
    .select()
    .from(blockedTimes)
    .where(eq(blockedTimes.businessId, business.id))
    .orderBy(asc(blockedTimes.startTime));

  return NextResponse.json(blocks);
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

  const { startTime, endTime, reason } = await req.json();

  if (!startTime || !endTime) {
    return NextResponse.json({ error: "Start and end time are required" }, { status: 400 });
  }

  const [block] = await db
    .insert(blockedTimes)
    .values({
      businessId: business.id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reason: reason?.trim() || null,
    })
    .returning();

  return NextResponse.json(block);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getUserBusiness(session.user.id);
  if (!business) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  const { id } = await req.json();

  await db
    .delete(blockedTimes)
    .where(and(eq(blockedTimes.id, id), eq(blockedTimes.businessId, business.id)));

  return NextResponse.json({ success: true });
}
