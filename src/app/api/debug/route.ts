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

    // Raw SQL check
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);
    const rawServices = await sql`SELECT id, name, is_active, pg_typeof(is_active) as type FROM services WHERE business_id = ${business.id}`;

    // Check generated SQL
    const { drizzle: drizzle2 } = await import("drizzle-orm/neon-http");
    const loggedQueries: string[] = [];
    const logDb = drizzle2(sql, {
      logger: {
        logQuery(query: string, params: unknown[]) {
          loggedQueries.push(`${query} -- params: ${JSON.stringify(params)}`);
        },
      },
    });
    const testResult = await logDb
      .select()
      .from(services)
      .where(and(eq(services.businessId, business.id), eq(services.isActive, true)))
      .orderBy(asc(services.sortOrder), asc(services.createdAt));

    // Test raw parameterized query
    const rawParam = await sql`SELECT id, name, is_active FROM services WHERE business_id = ${business.id} AND is_active = ${true}`;
    const rawLiteral = await sql`SELECT id, name, is_active FROM services WHERE business_id = ${business.id} AND is_active = true`;

    return NextResponse.json({
      business: { id: business.id, slug: business.slug, name: business.name },
      owner,
      activeServicesCount: activeServices.length,
      activeServices: activeServices.map((s) => ({ id: s.id, name: s.name, isActive: s.isActive })),
      allServicesCount: allServices.length,
      allServices: allServices.map((s) => ({ id: s.id, name: s.name, isActive: s.isActive })),
      rawServices,
      loggedQueries,
      testResultCount: testResult.length,
      testResult: testResult.map((s) => ({ id: s.id, name: s.name, isActive: s.isActive })),
      rawParamCount: rawParam.length,
      rawLiteralCount: rawLiteral.length,
      dbUrlExists: !!process.env.DATABASE_URL,
      now: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
