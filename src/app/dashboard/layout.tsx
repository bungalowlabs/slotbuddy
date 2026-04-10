import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { businesses, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { CopyLinkButton } from "@/components/copy-link-button";
import { TrialBanner } from "@/components/trial-banner";

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
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-56 md:flex-col">
        <div className="flex flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="px-4 py-5 border-b border-gray-200">
            <Link href="/dashboard" className="text-lg font-bold text-gray-900">
              Hello! SlotBuddy
            </Link>
            <p className="mt-1 text-xs text-gray-500 truncate">{business.name}</p>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            <NavLink href="/dashboard" label="Home" />
            <NavLink href="/dashboard/calendar" label="Calendar" />
            <NavLink href="/dashboard/bookings" label="Bookings" />
            <NavLink href="/dashboard/services" label="Services" />
            <NavLink href="/dashboard/availability" label="Availability" />
            <NavLink href="/dashboard/blocked" label="Blocked Times" />
            <NavLink href="/dashboard/settings" label="Settings" />
          </nav>
          <div className="border-t border-gray-200 p-3">
            <div className="rounded-lg bg-teal-50 p-3">
              <p className="text-xs font-medium text-teal-700 mb-1">Your booking link</p>
              <p className="text-xs text-teal-600 break-all">/book/{business.slug}</p>
              <CopyLinkButton slug={business.slug} />
            </div>
          </div>
          <div className="border-t border-gray-200 p-4">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900">
          Hello! SlotBuddy
        </Link>
        <span className="text-xs text-gray-500 truncate max-w-[140px]">{business.name}</span>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white flex justify-around py-2 z-50">
        <MobileNavLink href="/dashboard" label="Home" />
        <MobileNavLink href="/dashboard/calendar" label="Calendar" />
        <MobileNavLink href="/dashboard/bookings" label="Bookings" />
        <MobileNavLink href="/dashboard/services" label="Services" />
        <MobileNavLink href="/dashboard/settings" label="Settings" />
      </nav>

      {/* Main content */}
      <main className="md:pl-56">
        {isTrialing && user?.trialEndsAt && <TrialBanner trialEndsAt={user.trialEndsAt} />}
        <div className="mx-auto max-w-5xl px-4 py-6 pb-20 md:pb-6">{children}</div>
      </main>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
    >
      {label}
    </Link>
  );
}
