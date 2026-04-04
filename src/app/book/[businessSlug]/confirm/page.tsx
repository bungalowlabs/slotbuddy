"use client";

import { useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";

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
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      router.push(`/book/${businessSlug}/success?date=${dateStr}&time=${timeStr}`);
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          &larr; Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Confirm your booking</h1>

        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="text-sm font-medium text-blue-900">{formattedDate}</div>
          <div className="text-sm text-blue-700">{timeStr}</div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@email.com"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
              placeholder="(555) 123-4567"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim()}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Booking..." : "Confirm booking"}
          </button>
        </form>

        <footer className="mt-12 text-center text-xs text-gray-400">
          Powered by{" "}
          <a href="/" className="text-blue-500 hover:text-blue-600">
            SlotBuddy
          </a>
        </footer>
      </div>
    </div>
  );
}
