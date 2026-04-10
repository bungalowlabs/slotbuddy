import { db } from "@/db";
import { serviceFields, services, businesses } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Public endpoint: given ?business=slug&service=id, return the intake fields.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("business");
  const serviceId = url.searchParams.get("service");
  if (!slug || !serviceId) return NextResponse.json({ fields: [] });

  const [row] = await db
    .select({ id: services.id })
    .from(services)
    .innerJoin(businesses, eq(services.businessId, businesses.id))
    .where(and(eq(services.id, serviceId), eq(businesses.slug, slug)))
    .limit(1);
  if (!row) return NextResponse.json({ fields: [] });

  const fields = await db
    .select({
      id: serviceFields.id,
      label: serviceFields.label,
      fieldType: serviceFields.fieldType,
      required: serviceFields.required,
    })
    .from(serviceFields)
    .where(eq(serviceFields.serviceId, serviceId))
    .orderBy(asc(serviceFields.sortOrder), asc(serviceFields.createdAt));

  return NextResponse.json({ fields });
}
