"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface BookingInfo {
  id: string;
  customerName: string;
  startTime: string;
  endTime: string;
  status: string;
  serviceName: string | null;
  businessName: string | null;
  timezone: string | null;
}

export default function CancelBookingPage() {
  const params = useParams();
  const token = params.token as string;

  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/bookings/cancel?token=${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Booking not found");
        return res.json();
      })
      .then((data) => {
        setBooking(data);
        if (data.status === "cancelled") setCancelled(true);
      })
      .catch(() => setError("Booking not found or invalid link."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCancel() {
    setCancelling(true);
    const res = await fetch("/api/bookings/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (res.ok) {
      setCancelled(true);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
    setCancelling(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/10 border-t-terracotta" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-cream text-ink">
        <div className="mx-auto max-w-lg px-5 pt-24">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            Hmm
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight">
            Link not <em className="italic text-terracotta">valid</em>.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/70">
            This cancellation link is invalid or has expired. Check your confirmation email
            for a fresh link, or contact the business directly.
          </p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const tz = booking.timezone || "America/Chicago";
  const dateDisplay = new Date(booking.startTime).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: tz,
  });
  const timeDisplay = new Date(booking.startTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  });

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-lg px-5 pb-16 pt-20">
        {cancelled ? (
          <>
            <p className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
              <span className="h-px w-8 bg-terracotta" />
              Cancelled
            </p>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight">
              All <em className="italic text-terracotta">clear</em>.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink/70">
              Your appointment at{" "}
              <span className="font-semibold text-ink">{booking.businessName}</span> has
              been cancelled. No hard feelings.
            </p>
            <div className="mt-10 border-l-2 border-ink/20 pl-5">
              <p className="text-sm text-ink/55 line-through">{dateDisplay}</p>
              <p className="text-sm text-ink/55 line-through">{timeDisplay}</p>
            </div>
          </>
        ) : (
          <>
            <p className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
              <span className="h-px w-8 bg-terracotta" />
              Cancel booking
            </p>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight">
              Cancel <em className="italic text-terracotta">this one</em>?
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink/70">
              Just confirming you&rsquo;d like to cancel. The business will be notified.
            </p>

            <div className="mt-10 border-l-2 border-terracotta pl-5">
              <p className="font-display text-xl font-semibold text-ink">
                {booking.businessName}
              </p>
              <p className="mt-1 text-base text-ink/70">{booking.serviceName}</p>
              <p className="mt-3 text-base text-ink">{dateDisplay}</p>
              <p className="text-base text-ink/70">{timeDisplay}</p>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-terracotta/30 bg-terracotta/5 px-5 py-4 text-sm text-terracotta-dark">
                {error}
              </div>
            )}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-full bg-ink px-7 py-4 text-base font-medium text-cream transition-colors hover:bg-ink/90 disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Yes, cancel it"}
              </button>
              <a
                href="/"
                className="flex-1 rounded-full border border-ink/15 bg-white px-7 py-4 text-center text-base font-medium text-ink transition-colors hover:border-ink/25"
              >
                Never mind
              </a>
            </div>
          </>
        )}

        <footer className="mt-20 border-t border-ink/10 pt-6 text-xs text-ink/50">
          Powered by{" "}
          <a href="/" className="font-display font-semibold text-ink hover:text-terracotta">
            Hello! SlotBuddy
          </a>
        </footer>
      </div>
    </div>
  );
}
