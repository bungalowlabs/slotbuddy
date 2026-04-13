"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";

interface CustomField {
  id: string;
  label: string;
  fieldType: string;
  required: boolean;
}

export default function ConfirmPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const businessSlug = params.businessSlug as string;

  const serviceId = searchParams.get("service");
  const startUTC = searchParams.get("start");
  const endUTC = searchParams.get("end");
  const dateStr = searchParams.get("date");
  const timeStr = searchParams.get("time");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!serviceId) return;
    fetch(`/api/public/service-fields?business=${businessSlug}&service=${serviceId}`)
      .then((r) => r.json())
      .then((data) => setCustomFields(data.fields || []))
      .catch(() => setCustomFields([]));
  }, [businessSlug, serviceId]);

  const missingRequired = customFields.some(
    (f) => f.required && !(fieldValues[f.id] || "").trim()
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSlug,
          serviceId,
          startTime: startUTC,
          endTime: endUTC,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          fieldValues: customFields.reduce<Record<string, { label: string; value: string }>>(
            (acc, f) => {
              const v = (fieldValues[f.id] || "").trim();
              if (v) acc[f.id] = { label: f.label, value: v };
              return acc;
            },
            {}
          ),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      const statusParam = data.status === "pending" ? "&status=pending" : "";
      router.push(`/book/${businessSlug}/success?date=${dateStr}&time=${timeStr}${statusParam}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!serviceId || !startUTC || !endUTC) {
    router.push(`/book/${businessSlug}`);
    return null;
  }

  const formattedDate = dateStr
    ? new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const inputClass =
    "mt-2 block w-full rounded-2xl border border-ink/15 bg-white px-5 py-4 text-base text-ink placeholder-ink/30 outline-none transition-colors focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20";

  const labelClass =
    "block text-xs font-medium uppercase tracking-[0.15em] text-ink/60";

  return (
    <div className="min-h-screen bg-cream pb-32 text-ink">
      <div className="mx-auto max-w-lg px-5 pt-8">
        <button
          onClick={() => router.back()}
          className="-ml-1 mb-6 text-sm font-medium text-ink/60 transition-colors hover:text-terracotta"
        >
          ← Back
        </button>

        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          Step 3 — Your details
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-5xl">
          Almost <em className="italic text-terracotta">there</em>.
        </h1>

        <div className="mt-8 border-l-2 border-terracotta pl-5">
          <p className="font-display text-xl font-semibold text-ink">{formattedDate}</p>
          <p className="mt-1 text-lg text-ink/70">{timeStr}</p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-terracotta/30 bg-terracotta/5 px-5 py-4 text-sm text-terracotta-dark">
            {error}
          </div>
        )}

        <form id="booking-form" onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="cust-name" className={labelClass}>
              Name
            </label>
            <input
              id="cust-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your full name"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cust-email" className={labelClass}>
              Email
            </label>
            <input
              id="cust-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@email.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cust-phone" className={labelClass}>
              Phone <span className="normal-case tracking-normal text-ink/40">(optional)</span>
            </label>
            <input
              id="cust-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              placeholder="(555) 123-4567"
              className={inputClass}
            />
          </div>

          {customFields.map((field) => (
            <div key={field.id}>
              <label className={labelClass}>
                {field.label}
                {!field.required && (
                  <span className="normal-case tracking-normal text-ink/40"> (optional)</span>
                )}
              </label>
              {field.fieldType === "textarea" ? (
                <textarea
                  value={fieldValues[field.id] || ""}
                  onChange={(e) =>
                    setFieldValues((v) => ({ ...v, [field.id]: e.target.value }))
                  }
                  required={field.required}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              ) : (
                <input
                  type={
                    field.fieldType === "email" || field.fieldType === "tel"
                      ? field.fieldType
                      : "text"
                  }
                  inputMode={
                    field.fieldType === "tel"
                      ? "tel"
                      : field.fieldType === "email"
                      ? "email"
                      : undefined
                  }
                  value={fieldValues[field.id] || ""}
                  onChange={(e) =>
                    setFieldValues((v) => ({ ...v, [field.id]: e.target.value }))
                  }
                  required={field.required}
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </form>

        <footer className="mt-16 border-t border-ink/10 pt-6 text-xs text-ink/50">
          Powered by{" "}
          <a href="/" className="font-display font-semibold text-ink hover:text-terracotta">
            Hello! SlotBuddy
          </a>
        </footer>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-ink/10 bg-cream/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <button
            type="submit"
            form="booking-form"
            disabled={loading || !name.trim() || !email.trim() || missingRequired}
            className="w-full rounded-full bg-teal-700 px-7 py-4 text-base font-medium text-cream transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Booking…" : "Confirm booking →"}
          </button>
        </div>
      </div>
    </div>
  );
}
