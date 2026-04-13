import { db } from "@/db";
import { businesses, services } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isBusinessBookable } from "@/lib/business-access";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function BookingPage({
  params,
}: {
  params: { businessSlug: string };
}) {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, params.businessSlug))
    .limit(1);

  if (!business) notFound();

  const bookable = await isBusinessBookable(business.userId);

  if (!bookable) {
    return (
      <div className="min-h-screen bg-cream text-ink">
        <div className="mx-auto max-w-lg px-5 py-16">
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight">
            {business.name}
          </h1>
          <div className="mt-10 border-t border-ink/10 pt-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
              Booking paused
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold">
              Not taking bookings right now.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink/70">
              This business isn&apos;t accepting online bookings at the moment.
              {business.phone ? " Give them a call to schedule." : ""}
            </p>
            {business.phone && (
              <p className="mt-5 font-display text-xl font-semibold text-ink">
                {business.phone}
              </p>
            )}
          </div>
          <PoweredBy />
        </div>
      </div>
    );
  }

  const activeServices = await db
    .select()
    .from(services)
    .where(and(eq(services.businessId, business.id), sql`${services.isActive} IS TRUE`))
    .orderBy(asc(services.sortOrder), asc(services.createdAt));

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-lg px-5 pb-16 pt-10 sm:pt-14">
        <p className="mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          <span className="h-px w-8 bg-terracotta" />
          Book an appointment
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-5xl">
          {business.name}
        </h1>
        {business.description && (
          <p className="mt-4 text-base leading-relaxed text-ink/70">
            {business.description}
          </p>
        )}

        <div className="mt-10">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink/60">
            Step 1 — Pick a service
          </p>

          {activeServices.length === 0 ? (
            <p className="mt-6 text-base text-ink/60">
              No services available right now. Check back soon.
            </p>
          ) : (
            <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
              {activeServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/book/${params.businessSlug}/date?service=${service.id}`}
                  className="group flex items-center justify-between gap-4 py-5 transition-colors hover:bg-ink/[0.02]"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-xl font-semibold text-ink">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="mt-1 text-sm text-ink/60">{service.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-sm text-ink/70">
                      <span>{service.durationMinutes} min</span>
                      {service.price !== null && (
                        <>
                          <span className="text-ink/30">·</span>
                          <span className="font-medium text-ink">
                            ${(service.price / 100).toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-all group-hover:border-terracotta group-hover:bg-terracotta group-hover:text-cream">
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <PoweredBy />
      </div>
    </div>
  );
}

function PoweredBy() {
  return (
    <footer className="mt-20 border-t border-ink/10 pt-6 text-xs text-ink/50">
      Powered by{" "}
      <a href="/" className="font-display font-semibold text-ink hover:text-terracotta">
        Hello! SlotBuddy
      </a>
    </footer>
  );
}
