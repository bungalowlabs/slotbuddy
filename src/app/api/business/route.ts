import { auth } from "@/lib/auth";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session.user.id))
    .limit(1);

  if (!business) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  return NextResponse.json(business);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session.user.id))
    .limit(1);

  if (!business) {
    return NextResponse.json({ error: "No business found" }, { status: 404 });
  }

  const { name, description, phone, address } = await req.json();

  const [updated] = await db
    .update(businesses)
    .set({
      name: name?.trim() || business.name,
      description: description?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
    })
    .where(eq(businesses.id, business.id))
    .returning();

  return NextResponse.json(updated);
}
