"use client";

import { useState } from "react";
import Link from "next/link";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Wordmark */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Hello!<span className="text-terracotta"> SlotBuddy</span>
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-20 pt-10 lg:pt-16">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left: editorial header */}
          <div className="lg:col-span-5">
            <p className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
              <span className="h-px w-8 bg-terracotta" />
              Trial ended
            </p>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink lg:text-6xl">
              Keep it{" "}
              <em className="italic text-terracotta">rolling</em>.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink/70">
              Your 14 days are up. Subscribe and everything picks up exactly where you
              left off — services, availability, bookings, the works.
            </p>
            <p className="mt-6 hidden text-sm text-ink/55 lg:block">
              Your public booking page stays live while you decide. Customers won&rsquo;t
              see a thing.
            </p>
          </div>

          {/* Right: pricing card */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-ink/10 bg-white p-8 lg:p-10">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
                One plan
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-6xl font-bold text-ink lg:text-7xl">
                  $15
                </span>
                <span className="text-lg text-ink/60">/month</span>
              </div>
              <p className="mt-3 text-sm text-ink/60">
                Per business. No per-booking fees. Cancel anytime.
              </p>

              <ul className="mt-8 space-y-4 border-l-2 border-terracotta pl-6 text-base text-ink/80">
                {[
                  "Unlimited services and bookings",
                  "Your public booking page stays live",
                  "Calendar dashboard with approvals",
                  "Email confirmations and reminders",
                  "Customer cancellation links",
                  "Your time zone, your business hours",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2.5 h-1 w-1 flex-shrink-0 rounded-full bg-terracotta" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="mt-10 w-full rounded-full bg-teal-700 px-7 py-4 text-base font-medium text-cream transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Loading…" : "Subscribe & keep going →"}
              </button>

              <p className="mt-5 text-center text-xs text-ink/45">
                Secured by Stripe · Cancel anytime from Settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
