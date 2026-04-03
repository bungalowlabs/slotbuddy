import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold text-gray-900">SlotBuddy</span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Your booking page,
          <span className="text-blue-600"> live in 5 minutes</span>.
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          SlotBuddy lets your customers book appointments online — no app
          downloads, no account required. Set up your services, share your link,
          and start getting bookings today.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Start your 14-day free trial
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          $15/month after trial. Cancel anytime.
        </p>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            How it works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <FeatureCard
              step="1"
              title="Add your services"
              description="List what you offer — haircuts, training sessions, detailing packages — with durations and prices."
            />
            <FeatureCard
              step="2"
              title="Set your availability"
              description="Tell us when you work. Monday through Friday, weekends only, whatever fits your schedule."
            />
            <FeatureCard
              step="3"
              title="Share your booking link"
              description="Customers visit your page, pick a service, choose a time, and book — all without creating an account."
            />
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Built for small service businesses
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <BusinessType icon="scissors" label="Barbers & Salons" />
            <BusinessType icon="dumbbell" label="Personal Trainers" />
            <BusinessType icon="car" label="Auto Detailers" />
            <BusinessType icon="hands" label="Massage Therapists" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Simple pricing</h2>
          <p className="mt-4 text-gray-600">
            One plan. Everything included. No surprises.
          </p>
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-gray-900">$15</span>
              <span className="text-gray-500">/month per business</span>
            </div>
            <ul className="mt-8 space-y-3 text-left text-sm text-gray-600">
              <PricingItem text="14-day free trial" />
              <PricingItem text="Unlimited services and bookings" />
              <PricingItem text="Public booking page with your own link" />
              <PricingItem text="Calendar dashboard" />
              <PricingItem text="Email confirmations and reminders" />
              <PricingItem text="Customer cancellation via email link" />
            </ul>
            <Link
              href="/signup"
              className="mt-8 block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SlotBuddy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
        {step}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function BusinessType({ icon, label }: { icon: string; label: string }) {
  const icons: Record<string, React.ReactNode> = {
    scissors: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.839c.005.351.054.695.14 1.024M9.384 9.137l2.077 1.199M7.848 15.75l1.536-.887m-1.536.887a3 3 0 11-5.196 3 3 3 0 015.196-3zm1.536-.887a2.165 2.165 0 001.083-1.838c.005-.352.054-.695.14-1.025m-1.223 2.863l2.077-1.199m0-3.328a4.323 4.323 0 012.068-1.379l5.325-1.628a4.5 4.5 0 012.48-.044l.803.215-7.794 4.5m-2.882-1.664A4.331 4.331 0 0010.607 12m3.736 0l7.794 4.5-.802.215a4.5 4.5 0 01-2.48-.043l-5.326-1.629a4.324 4.324 0 01-2.068-1.379M14.343 12l-2.882 1.664" />
      </svg>
    ),
    dumbbell: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
    ),
    car: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    hands: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 text-center">
      <div className="text-blue-600">{icons[icon]}</div>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </div>
  );
}

function PricingItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <svg
        className="h-5 w-5 flex-shrink-0 text-blue-600"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      {text}
    </li>
  );
}
