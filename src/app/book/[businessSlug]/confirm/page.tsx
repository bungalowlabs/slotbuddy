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

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="mx-auto max-w-lg px-4 py-6 sm:py-8">
        <button
          onClick={() => router.back()}
          className="-ml-2 px-2 py-2 text-base text-teal-600 hover:text-teal-700 mb-2"
        >
          &larr; Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Confirm your booking</h1>

        <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50 p-4">
          <div className="text-base font-medium text-teal-900">{formattedDate}</div>
          <div className="text-base text-teal-700">{timeStr}</div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form id="booking-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your full name"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@email.com"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              placeholder="(555) 123-4567"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {customFields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {!field.required && <span className="text-gray-400"> (optional)</span>}
              </label>
              {field.fieldType === "textarea" ? (
                <textarea
                  value={fieldValues[field.id] || ""}
                  onChange={(e) =>
                    setFieldValues((v) => ({ ...v, [field.id]: e.target.value }))
                  }
                  required={field.required}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none"
                />
              ) : (
                <input
                  type={field.fieldType === "email" || field.fieldType === "tel" ? field.fieldType : "text"}
                  inputMode={field.fieldType === "tel" ? "tel" : field.fieldType === "email" ? "email" : undefined}
                  value={fieldValues[field.id] || ""}
                  onChange={(e) =>
                    setFieldValues((v) => ({ ...v, [field.id]: e.target.value }))
                  }
                  required={field.required}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              )}
            </div>
          ))}
        </form>

        <footer className="mt-12 text-center text-xs text-gray-400">
          Powered by{" "}
          <a href="/" className="text-teal-500 hover:text-teal-600">
            Hello! SlotBuddy
          </a>
        </footer>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3 sm:py-4 safe-area-inset-bottom">
        <div className="mx-auto max-w-lg">
          <button
            type="submit"
            form="booking-form"
            disabled={loading || !name.trim() || !email.trim() || missingRequired}
            className="w-full rounded-lg bg-teal-600 px-4 py-4 text-base font-semibold text-white hover:bg-teal-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Booking..." : "Confirm booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
