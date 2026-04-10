import { db } from "@/db";
import { businesses, services, users } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.slug, "alex-business"))
      .limit(1);

    if (!business) {
      return NextResponse.json({ error: "Business not found" });
    }

    const [owner] = await db
      .select({
        id: users.id,
        subscriptionStatus: users.subscriptionStatus,
        trialEndsAt: users.trialEndsAt,
      })
      .from(users)
      .where(eq(users.id, business.userId))
      .limit(1);

    const activeServices = await db
      .select()
      .from(services)
      .where(and(eq(services.businessId, business.id), eq(services.isActive, true)))
      .orderBy(asc(services.sortOrder), asc(services.createdAt));

    const allServices = await db
      .select()
      .from(services)
      .where(eq(services.businessId, business.id));

    return NextResponse.json({
      business: { id: business.id, slug: business.slug, name: business.name },
      owner,
      activeServicesCount: activeServices.length,
      activeServices: activeServices.map((s) => ({ id: s.id, name: s.name, isActive: s.isActive })),
      allServicesCount: allServices.length,
      allServices: allServices.map((s) => ({ id: s.id, name: s.name, isActive: s.isActive })),
      dbUrlExists: !!process.env.DATABASE_URL,
      now: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
