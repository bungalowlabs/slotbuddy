import { db } from "@/db";
import { businesses, services } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isBusinessBookable } from "@/lib/business-access";

export const dynamic = "force-dynamic";

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
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-lg px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8">
              <h2 className="text-lg font-semibold text-gray-900">
                Online booking is paused
              </h2>
              <p className="mt-3 text-sm text-gray-600">
                This business isn&apos;t accepting new bookings online right now.
                {business.phone ? " Please contact them directly to schedule." : ""}
              </p>
              {business.phone && (
                <p className="mt-4 text-sm font-medium text-gray-900">
                  {business.phone}
                </p>
              )}
            </div>
            <footer className="mt-12 text-center text-xs text-gray-400">
              Powered by{" "}
              <a href="/" className="text-teal-500 hover:text-teal-600">
                Hello! SlotBuddy
              </a>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  const activeServices = await db
    .select()
    .from(services)
    .where(and(eq(services.businessId, business.id), eq(services.isActive, true)))
    .orderBy(asc(services.sortOrder), asc(services.createdAt));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-6 sm:py-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{business.name}</h1>
          {business.description && (
            <p className="mt-2 text-base text-gray-600">{business.description}</p>
          )}
        </div>

        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg font-semibold text-gray-900">Select a service</h2>
          {activeServices.length === 0 ? (
            <p className="mt-4 text-gray-500">No services available right now.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {activeServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/book/${params.businessSlug}/date?service=${service.id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-5 active:scale-[0.98] hover:border-teal-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{service.name}</h3>
                      {service.description && (
                        <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                        <span>{service.durationMinutes} min</span>
                        {service.price !== null && (
                          <span>${(service.price / 100).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-gray-400 mt-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <footer className="mt-12 text-center text-xs text-gray-400">
          Powered by{" "}
          <a href="/" className="text-teal-500 hover:text-teal-600">
            Hello! SlotBuddy
          </a>
        </footer>
      </div>
    </div>
  );
}
