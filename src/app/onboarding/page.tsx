"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleNameChange(name: string) {
    setBusinessName(name);
    setSlug(generateSlug(name));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !slug.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: businessName.trim(), slug: slug.trim(), timezone }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/dashboard/services");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
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
              Step 1 of 2
            </p>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink lg:text-6xl">
              Tell us about{" "}
              <em className="italic text-terracotta">your shop</em>.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink/70">
              Takes about thirty seconds. You can change everything — the name, the
              URL, the time zone — tomorrow. Or next Tuesday. Whenever.
            </p>
            <p className="mt-6 hidden text-sm text-ink/55 lg:block">
              Next up: add your services, set your hours, share your link.
            </p>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-7">
            {error && (
              <div className="mb-6 rounded-2xl border border-terracotta/30 bg-terracotta/5 px-5 py-4 text-sm text-terracotta-dark">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium uppercase tracking-[0.15em] text-ink/60"
                >
                  Business name
                </label>
                <input
                  id="name"
                  type="text"
                  value={businessName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Joe's Barbershop"
                  required
                  className="mt-2 block w-full rounded-2xl border border-ink/15 bg-white px-5 py-4 font-display text-xl font-semibold text-ink placeholder-ink/30 outline-none transition-colors focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-xs font-medium uppercase tracking-[0.15em] text-ink/60"
                >
                  Your booking URL
                </label>
                <div className="mt-2 flex items-stretch overflow-hidden rounded-2xl border border-ink/15 bg-white focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-700/20">
                  <span className="flex items-center border-r border-ink/10 bg-cream px-4 text-sm text-ink/60">
                    helloslotbuddy.com/book/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    required
                    className="block w-full bg-white px-4 py-4 text-base font-medium text-ink outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="timezone"
                  className="block text-xs font-medium uppercase tracking-[0.15em] text-ink/60"
                >
                  Time zone
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="mt-2 block w-full rounded-2xl border border-ink/15 bg-white px-5 py-4 text-base text-ink outline-none transition-colors focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !businessName.trim() || !slug.trim()}
                className="w-full rounded-full bg-teal-700 px-7 py-4 text-base font-medium text-cream transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating your booking page…" : "Create my booking page →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
