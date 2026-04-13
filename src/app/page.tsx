import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Hello!<span className="text-terracotta"> SlotBuddy</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-teal-800"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-12 lg:pb-32 lg:pt-16">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Left: headline */}
          <div className="lg:col-span-7">
            <p className="mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
              <span className="h-px w-10 bg-terracotta" />
              Online booking, humanized
            </p>
            <h1 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight text-ink">
              Your booking page,{" "}
              <em className="italic text-terracotta">live before your coffee</em> goes cold.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink/75">
              Hello! SlotBuddy gives your customers a simple place to pick a time — no app,
              no account, no friction. You run your business. We&rsquo;ll run the calendar.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/signup"
                className="rounded-full bg-teal-700 px-7 py-3.5 text-base font-medium text-cream transition-colors hover:bg-teal-800"
              >
                Start your 14-day trial
              </Link>
              <Link
                href="#how"
                className="group flex items-center gap-2 text-base font-medium text-ink"
              >
                See how it works
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
            <p className="mt-5 text-sm text-ink/60">
              $15/month after. Cancel anytime. No credit card to try.
            </p>
          </div>

          {/* Right: tilted mock booking card */}
          <div className="relative lg:col-span-5 lg:pt-12">
            <div className="relative mx-auto max-w-sm -rotate-[2.5deg] rounded-3xl bg-white p-6 shadow-[0_30px_60px_-15px_rgba(31,43,46,0.25)] ring-1 ring-ink/5">
              <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">
                    Joe&rsquo;s Barbershop
                  </p>
                  <p className="text-xs text-ink/60">Downtown · Open today</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 font-display text-lg font-bold text-cream">
                  J
                </div>
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-ink/50">
                Pick a time
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["9:00", "9:30", "10:00", "10:30", "11:00", "11:30"].map((t, i) => (
                  <div
                    key={t}
                    className={`rounded-xl border px-3 py-2 text-center text-sm font-medium ${
                      i === 2
                        ? "border-teal-700 bg-teal-700 text-cream"
                        : "border-ink/15 text-ink/75"
                    }`}
                  >
                    {t}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-cream p-3 text-sm">
                <p className="font-medium text-ink">Classic cut — 30 min</p>
                <p className="text-ink/60">$35 · with Joe</p>
              </div>
              <div className="mt-4 w-full rounded-full bg-terracotta py-3 text-center font-medium text-cream">
                Confirm booking
              </div>
            </div>
            {/* Rotated sticker */}
            <div className="absolute -bottom-4 left-2 hidden rotate-[6deg] rounded-2xl bg-ink px-4 py-2 font-display text-sm font-semibold text-cream shadow-lg lg:block">
              No app required ✿
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="h-px bg-ink/10" />
      </div>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
              The whole thing
            </p>
            <h2 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink lg:text-5xl">
              Three steps. One afternoon.
            </h2>
          </div>
          <p className="max-w-xs text-ink/70 lg:text-right">
            We built this for the five-chair shop down the street — not the Fortune 500.
          </p>
        </div>
        <div className="space-y-12 lg:space-y-16">
          {[
            {
              num: "01",
              title: "Tell us what you do",
              body: "Add your services — haircuts, training sessions, detailing packages. Set durations and prices. If you change your mind tomorrow, change them tomorrow.",
            },
            {
              num: "02",
              title: "Tell us when you work",
              body: "Monday mornings only? Wednesday through Saturday? Closed on Tuesdays because that's your kid's soccer day? All of that is a checkbox.",
            },
            {
              num: "03",
              title: "Share your link",
              body: "You get helloslotbuddy.com/book/your-shop. Put it in your Instagram bio, text it to your regulars, stick it on a sign. Bookings start showing up.",
            },
          ].map((step) => (
            <div
              key={step.num}
              className="grid gap-6 border-t border-ink/10 pt-12 lg:grid-cols-12"
            >
              <p className="font-display text-6xl font-bold italic leading-none text-terracotta lg:col-span-2 lg:text-7xl">
                {step.num}
              </p>
              <div className="lg:col-span-8">
                <h3 className="font-display text-2xl font-bold text-ink lg:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink/75">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for — dark section */}
      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            Built for
          </p>
          <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight lg:text-6xl">
            The person who{" "}
            <em className="italic text-terracotta">actually</em> runs the shop.
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-cream/75">
            Whether you&rsquo;re cutting hair, changing oil, training clients, or kneading
            backs — your customers want to pick a time without texting you at 10pm.
          </p>
          <div className="mt-12 flex flex-wrap gap-3">
            {[
              "Barbershops",
              "Hair salons",
              "Personal trainers",
              "Auto detailing",
              "Massage therapy",
              "Tattoo studios",
              "Nail techs",
              "Dog groomers",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-cream/25 px-4 py-2 text-sm text-cream/90"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-6 py-24 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
              One plan, no surprises
            </p>
            <h2 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink lg:text-6xl">
              Fifteen dollars.
            </h2>
            <p className="mt-5 max-w-md text-lg text-ink/70">
              Per month, per business. No per-booking fees. No &ldquo;enterprise&rdquo; tier. No
              sales calls ever.
            </p>
            <div className="mt-8 flex items-baseline gap-2">
              <span className="font-display text-6xl font-bold text-ink">$15</span>
              <span className="text-lg text-ink/60">/month</span>
            </div>
            <Link
              href="/signup"
              className="mt-8 inline-block rounded-full bg-teal-700 px-7 py-3.5 text-base font-medium text-cream transition-colors hover:bg-teal-800"
            >
              Start 14-day free trial
            </Link>
          </div>
          <div className="lg:col-span-7">
            <ul className="space-y-5 border-l-2 border-terracotta pl-8">
              {[
                "14-day free trial, no credit card",
                "Unlimited services and bookings",
                "Your own booking link on helloslotbuddy.com",
                "Calendar dashboard with drag-to-reschedule",
                "Automatic email confirmations and reminders",
                "Customers can cancel via email link",
                "Your time zone, your business hours, your rules",
              ].map((item) => (
                <li key={item} className="flex items-start gap-4 text-lg text-ink/80">
                  <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-terracotta" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
          <p className="font-display text-lg font-bold">
            Hello!<span className="text-terracotta"> SlotBuddy</span>
          </p>
          <p className="text-sm text-ink/60">
            &copy; {new Date().getFullYear()} · Made for small shops
          </p>
        </div>
      </footer>
    </div>
  );
}
