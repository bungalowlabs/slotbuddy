import { auth } from "@/lib/auth";
import { db } from "@/db";
import { serviceFields, services, businesses } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

async function assertServiceOwned(userId: string, serviceId: string) {
  const [row] = await db
    .select({ id: services.id })
    .from(services)
    .innerJoin(businesses, eq(services.businessId, businesses.id))
    .where(and(eq(services.id, serviceId), eq(businesses.userId, userId)))
    .limit(1);
  return !!row;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceId = new URL(req.url).searchParams.get("serviceId");
  if (!serviceId) return NextResponse.json({ error: "serviceId required" }, { status: 400 });

  if (!(await assertServiceOwned(session.user.id, serviceId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fields = await db
    .select()
    .from(serviceFields)
    .where(eq(serviceFields.serviceId, serviceId))
    .orderBy(asc(serviceFields.sortOrder), asc(serviceFields.createdAt));

  return NextResponse.json(fields);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { serviceId, label, fieldType, required, sortOrder } = await req.json();
  if (!serviceId || !label?.trim()) {
    return NextResponse.json({ error: "serviceId and label required" }, { status: 400 });
  }
  if (!(await assertServiceOwned(session.user.id, serviceId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allowedTypes = ["text", "textarea", "tel", "email"];
  const type = allowedTypes.includes(fieldType) ? fieldType : "text";

  const [field] = await db
    .insert(serviceFields)
    .values({
      serviceId,
      label: label.trim(),
      fieldType: type,
      required: !!required,
      sortOrder: sortOrder ?? 0,
    })
    .returning();
  return NextResponse.json(field);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Verify ownership via join
  const [row] = await db
    .select({ id: serviceFields.id })
    .from(serviceFields)
    .innerJoin(services, eq(serviceFields.serviceId, services.id))
    .innerJoin(businesses, eq(services.businessId, businesses.id))
    .where(and(eq(serviceFields.id, id), eq(businesses.userId, session.user.id)))
    .limit(1);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(serviceFields).where(eq(serviceFields.id, id));
  return NextResponse.json({ success: true });
}
