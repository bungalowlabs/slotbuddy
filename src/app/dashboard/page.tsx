import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { businesses, services, availability, bookings } from "@/db/schema";
import { and, eq, gte, lt, desc, sql } from "drizzle-orm";
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
      db.select().from(services).where(and(eq(services.businessId, business.id), sql`${services.isActive} IS TRUE`)),
      db.select().from(availability).where(and(eq(availability.businessId, business.id), sql`${availability.isEnabled} IS TRUE`)),
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
    <div className="space-y-12">
      {/* Header */}
      <div>
        <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          <span className="h-px w-8 bg-terracotta" />
          Dashboard
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-5xl">
          Welcome <em className="italic text-terracotta">back</em>.
        </h1>
        <p className="mt-4 text-base text-ink/65">
          Here&rsquo;s what&rsquo;s happening at {business.name}.
        </p>
      </div>

      {/* Booking link card */}
      <section className="rounded-3xl border border-ink/10 bg-white p-6">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-terracotta">
              Your booking link
            </p>
            <p className="mt-2 truncate font-mono text-sm text-ink">
              helloslotbuddy.com/book/{business.slug}
            </p>
            <p className="mt-3 text-sm text-ink/60">
              Share this anywhere — Instagram bio, text messages, printed signs.
            </p>
          </div>
          <div className="w-32 shrink-0">
            <CopyLinkButton slug={business.slug} />
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-ink/10 sm:grid-cols-4">
        <Stat label="Today" value={todayCount} />
        <Stat label="This week" value={weekCount} />
        <Stat label="Active services" value={activeServices.length} />
        <Stat label="Days open / week" value={enabledAvailability.length} />
      </section>

      {/* Today's schedule */}
      <section>
        <div className="flex items-end justify-between border-b border-ink/10 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink/50">
              On the books
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">
              Today&rsquo;s schedule
            </h2>
          </div>
          <Link
            href="/dashboard/calendar"
            className="text-sm font-medium text-terracotta underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta"
          >
            Open calendar →
          </Link>
        </div>
        {todayBookings.length === 0 ? (
          <p className="py-6 text-sm text-ink/50">Nothing scheduled today.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {todayBookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-4">
                <div>
                  <div className="font-display text-lg font-semibold text-ink">
                    {fmtTime(b.startTime)} — {fmtTime(b.endTime)}
                  </div>
                  <div className="mt-0.5 text-sm text-ink/60">{b.customerName}</div>
                </div>
                <StatusPill status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent activity */}
      <section>
        <div className="flex items-end justify-between border-b border-ink/10 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink/50">
              Latest
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">
              Recent activity
            </h2>
          </div>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-medium text-terracotta underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta"
          >
            All bookings →
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="py-6 text-sm text-ink/50">No bookings yet.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {recentBookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-4">
                <div className="min-w-0">
                  <div className="truncate font-display text-lg font-semibold text-ink">
                    {b.customerName}
                  </div>
                  <div className="mt-0.5 text-sm text-ink/60">
                    {new Date(b.startTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    at {fmtTime(b.startTime)}
                  </div>
                </div>
                <StatusPill status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Setup checklist (auto-hides when complete) */}
      {!checklistComplete && (
        <section className="rounded-3xl border-l-2 border-terracotta bg-terracotta/5 p-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            Almost there
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-ink">
            Finish setting up.
          </h2>
          <ul className="mt-5 space-y-2">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-4 rounded-2xl bg-white/70 px-4 py-3 text-sm transition-colors hover:bg-white"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${
                      item.done
                        ? "border-terracotta bg-terracotta text-cream"
                        : "border-ink/20 bg-white text-ink/30"
                    }`}
                  >
                    {item.done ? "✓" : ""}
                  </span>
                  <span
                    className={
                      item.done
                        ? "text-ink/50 line-through"
                        : "font-medium text-ink"
                    }
                  >
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
    <div className="bg-white px-5 py-5">
      <div className="font-display text-4xl font-bold text-ink">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-ink/50">
        {label}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string | null }) {
  return (
    <span className="rounded-full border border-ink/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-ink/70">
      {status}
    </span>
  );
}
