import { auth } from "@/lib/auth";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, slug, timezone } = await req.json();

  if (!name?.trim() || !slug?.trim() || !timezone?.trim()) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // Check if user already has a business
  const existing = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session.user.id))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "You already have a business set up" }, { status: 400 });
  }

  // Check if slug is taken
  const slugTaken = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, slug.trim()))
    .limit(1);

  if (slugTaken.length > 0) {
    return NextResponse.json({ error: "That URL is already taken. Try a different one." }, { status: 400 });
  }

  await db.insert(businesses).values({
    userId: session.user.id,
    name: name.trim(),
    slug: slug.trim(),
    timezone: timezone.trim(),
  });

  return NextResponse.json({ success: true });
}
