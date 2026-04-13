"use client";

import { useState, useEffect, useCallback } from "react";

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  timezone: string;
}

const inputClass =
  "mt-2 block w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder-ink/30 outline-none transition-colors focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20";
const readOnlyClass =
  "mt-2 block w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 text-sm text-ink/60";
const labelClass =
  "block text-xs font-medium uppercase tracking-[0.15em] text-ink/60";

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const fetchBusiness = useCallback(async () => {
    const res = await fetch("/api/business");
    if (res.ok) {
      const data = await res.json();
      setBusiness(data);
      setName(data.name);
      setDescription(data.description || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/business", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, phone, address }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleCopyLink() {
    if (!business) return;
    const url = `${window.location.origin}/book/${business.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const [billingError, setBillingError] = useState("");

  async function handleManageBilling() {
    setBillingError("");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setBillingError(data.error || "Unable to open billing portal");
    }
  }

  if (loading) {
    return (
      <div>
        <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          <span className="h-px w-8 bg-terracotta" />
          Your shop
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-5xl">
          Settings
        </h1>
        <div className="mt-10 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-ink/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!business) return null;

  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/book/${business.slug}`;

  return (
    <div className="space-y-10">
      <div>
        <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          <span className="h-px w-8 bg-terracotta" />
          Your shop
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-5xl">
          Settings
        </h1>
      </div>

      {/* Booking link */}
      <section className="rounded-3xl border border-ink/10 bg-white p-7">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          Share this
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink">
          Your booking link
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          Paste it in your Instagram bio, text it to regulars, stick it on a sign.
        </p>
        <div className="mt-5 flex items-stretch gap-2">
          <input
            type="text"
            readOnly
            value={bookingUrl}
            className="flex-1 rounded-2xl border border-ink/10 bg-cream px-4 py-3 font-mono text-xs text-ink/70"
          />
          <button
            onClick={handleCopyLink}
            className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition-colors hover:bg-ink/90"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
      </section>

      {/* Business info */}
      <form
        onSubmit={handleSave}
        className="rounded-3xl border border-ink/10 bg-white p-7"
      >
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          Details
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink">
          Business information
        </h2>

        <div className="mt-6 space-y-5">
          <div>
            <label className={labelClass}>Business name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief description shown on your booking page"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Time zone</label>
            <input
              type="text"
              readOnly
              value={business.timezone.replace(/_/g, " ")}
              className={readOnlyClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-teal-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
        </button>
      </form>

      {/* Billing */}
      <section className="rounded-3xl border border-ink/10 bg-white p-7">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          Money
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-ink">Billing</h2>
        <p className="mt-2 text-sm text-ink/60">
          Manage your subscription and payment method through Stripe.
        </p>
        <button
          onClick={handleManageBilling}
          className="mt-5 rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/30"
        >
          Manage billing →
        </button>
        {billingError && (
          <p className="mt-3 text-sm text-terracotta">
            {billingError === "No billing account found"
              ? "Billing portal is available after you subscribe. You're currently on a free trial."
              : billingError}
          </p>
        )}
      </section>
    </div>
  );
}
