import { auth } from "@/lib/auth";
import { db } from "@/db";
import { services, businesses } from "@/db/schema";
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

  const allServices = await db
    .select()
    .from(services)
    .where(eq(services.businessId, business.id))
    .orderBy(asc(services.sortOrder), asc(services.createdAt));

  return NextResponse.json(allServices);
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

  const { name, description, durationMinutes, price, isActive } = await req.json();

  if (!name?.trim() || !durationMinutes) {
    return NextResponse.json({ error: "Name and duration are required" }, { status: 400 });
  }

  const [service] = await db
    .insert(services)
    .values({
      businessId: business.id,
      name: name.trim(),
      description: description?.trim() || null,
      durationMinutes,
      price: price ? Math.round(price * 100) : null,
      isActive: isActive ?? true,
    })
    .returning();

  return NextResponse.json(service);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getUserBusiness(session.user.id);
  if (!business) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  const { id, name, description, durationMinutes, price, isActive, sortOrder } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
  }

  const [updated] = await db
    .update(services)
    .set({
      name: name?.trim(),
      description: description?.trim() || null,
      durationMinutes,
      price: price !== undefined ? (price ? Math.round(price * 100) : null) : undefined,
      isActive,
      sortOrder,
    })
    .where(and(eq(services.id, id), eq(services.businessId, business.id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
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

  if (!id) {
    return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
  }

  await db
    .delete(services)
    .where(and(eq(services.id, id), eq(services.businessId, business.id)));

  return NextResponse.json({ success: true });
}
