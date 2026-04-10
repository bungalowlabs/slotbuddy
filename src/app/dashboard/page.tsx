import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { businesses, services, availability, bookings } from "@/db/schema";
import { and, eq, gte, lt, desc } from "drizzle-orm";
import Link from "next/link";
import { CopyLinkButton } from "@/components/copy-link-button";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session.user.id))
    .limit(1);

  if (!business) redirect("/onboarding");

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const [activeServices, enabledAvailability, todayBookings, weekBookings, recentBookings] =
    await Promise.all([
      db.select().from(services).where(and(eq(services.businessId, business.id), eq(services.isActive, true))),
      db.select().from(availability).where(and(eq(availability.businessId, business.id), eq(availability.isEnabled, true))),
      db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.businessId, business.id),
            gte(bookings.startTime, startOfToday),
            lt(bookings.startTime, startOfTomorrow)
          )
        )
        .orderBy(bookings.startTime),
      db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.businessId, business.id),
            gte(bookings.startTime, startOfWeek),
            lt(bookings.startTime, endOfWeek)
          )
        ),
      db
        .select()
        .from(bookings)
        .where(eq(bookings.businessId, business.id))
        .orderBy(desc(bookings.createdAt))
        .limit(5),
    ]);

  const todayCount = todayBookings.filter((b) => b.status !== "cancelled").length;
  const weekCount = weekBookings.filter((b) => b.status !== "cancelled").length;

  const checklist = [
    { label: "Add a service", done: activeServices.length > 0, href: "/dashboard/services" },
    { label: "Set your availability", done: enabledAvailability.length > 0, href: "/dashboard/availability" },
    { label: "Receive your first booking", done: recentBookings.length > 0, href: "/dashboard/calendar" },
  ];
  const checklistComplete = checklist.every((c) => c.done);

  function fmtTime(d: Date) {
    return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Here&apos;s what&apos;s happening with {business.name}.</p>
      </div>

      {/* Booking link card */}
      <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Your booking link</p>
            <p className="mt-1 truncate font-mono text-sm text-gray-900">/book/{business.slug}</p>
            <p className="mt-2 text-xs text-gray-600">Share this with customers so they can book themselves.</p>
          </div>
          <div className="w-32 shrink-0">
            <CopyLinkButton slug={business.slug} />
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Today" value={todayCount} />
        <Stat label="This week" value={weekCount} />
        <Stat label="Active services" value={activeServices.length} />
        <Stat label="Days open / week" value={enabledAvailability.length} />
      </div>

      {/* Today's schedule */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Today&apos;s schedule</h2>
          <Link href="/dashboard/calendar" className="text-xs font-medium text-teal-600 hover:text-teal-700">
            Open calendar →
          </Link>
        </div>
        {todayBookings.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">No bookings today.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {todayBookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {fmtTime(b.startTime)} — {fmtTime(b.endTime)}
                  </div>
                  <div className="text-xs text-gray-500">{b.customerName}</div>
                </div>
                <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                  {b.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent activity */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Recent activity</h2>
          <Link href="/dashboard/bookings" className="text-xs font-medium text-teal-600 hover:text-teal-700">
            All bookings →
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">No bookings yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentBookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-900">{b.customerName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(b.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at{" "}
                    {fmtTime(b.startTime)}
                  </div>
                </div>
                <span className="ml-3 shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {b.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Setup checklist (auto-hides when complete) */}
      {!checklistComplete && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-semibold text-amber-900">Finish setting up</h2>
          <p className="mt-1 text-xs text-amber-800">A few steps to get your booking page ready.</p>
          <ul className="mt-3 space-y-2">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg bg-white/60 px-3 py-2 text-sm hover:bg-white"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      item.done
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-amber-400 bg-white"
                    }`}
                  >
                    {item.done && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                  <span className={item.done ? "text-gray-500 line-through" : "font-medium text-gray-900"}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
    </div>
  );
}
