import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { businesses, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { CopyLinkButton } from "@/components/copy-link-button";
import { TrialBanner } from "@/components/trial-banner";
import { FeedbackWidget } from "@/components/feedback-widget";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userBusinesses = await db
    .select()
    .from(businesses)
    .where(eq(businesses.userId, session.user.id))
    .limit(1);

  if (userBusinesses.length === 0) {
    redirect("/onboarding");
  }

  const business = userBusinesses[0];

  // Check subscription status
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const isTrialing =
    !!user &&
    user.subscriptionStatus === "trialing" &&
    !!user.trialEndsAt &&
    new Date(user.trialEndsAt) > new Date();
  const isActive = user?.subscriptionStatus === "active";

  if (!isTrialing && !isActive) {
    redirect("/upgrade");
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-1 flex-col border-r border-ink/10 bg-white">
          <div className="border-b border-ink/10 px-6 py-6">
            <Link href="/dashboard" className="font-display text-xl font-bold tracking-tight text-ink">
              Hello!<span className="text-terracotta"> SlotBuddy</span>
            </Link>
            <p className="mt-2 truncate font-display text-sm font-semibold text-ink/70">
              {business.name}
            </p>
          </div>
          <nav className="flex-1 space-y-0.5 px-3 py-5">
            <NavLink href="/dashboard" label="Home" />
            <NavLink href="/dashboard/calendar" label="Calendar" />
            <NavLink href="/dashboard/bookings" label="Bookings" />
            <NavLink href="/dashboard/services" label="Services" />
            <NavLink href="/dashboard/availability" label="Availability" />
            <NavLink href="/dashboard/blocked" label="Blocked times" />
            <NavLink href="/dashboard/settings" label="Settings" />
          </nav>
          <div className="border-t border-ink/10 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink/50">
              Your link
            </p>
            <p className="mt-1.5 break-all font-mono text-xs text-ink/70">
              /book/{business.slug}
            </p>
            <CopyLinkButton slug={business.slug} />
          </div>
          <div className="border-t border-ink/10 p-5">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-sm text-ink/55 transition-colors hover:text-terracotta"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-ink/10 bg-white px-5 py-4 md:hidden">
        <Link href="/dashboard" className="font-display text-lg font-bold tracking-tight">
          Hello!<span className="text-terracotta"> SlotBuddy</span>
        </Link>
        <span className="max-w-[140px] truncate font-display text-sm font-semibold text-ink/70">
          {business.name}
        </span>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-ink/10 bg-cream/95 py-2.5 backdrop-blur md:hidden">
        <MobileNavLink href="/dashboard" label="Home" />
        <MobileNavLink href="/dashboard/calendar" label="Calendar" />
        <MobileNavLink href="/dashboard/bookings" label="Bookings" />
        <MobileNavLink href="/dashboard/services" label="Services" />
        <MobileNavLink href="/dashboard/settings" label="More" />
      </nav>

      {/* Main content */}
      <main className="md:pl-64">
        {isTrialing && user?.trialEndsAt && <TrialBanner trialEndsAt={user.trialEndsAt} />}
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-8 md:px-10 md:py-10">{children}</div>
      </main>
      <FeedbackWidget source="dashboard" userEmail={session.user.email ?? undefined} />
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-4 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-cream hover:text-ink"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 text-[11px] font-medium text-ink/60 hover:text-terracotta"
    >
      {label}
    </Link>
  );
}
