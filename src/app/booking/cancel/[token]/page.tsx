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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Booking not found</h1>
          <p className="mt-2 text-gray-500">This cancellation link is invalid or has expired.</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        {cancelled ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">Booking cancelled</h1>
            <p className="mt-2 text-gray-600">
              Your appointment at {booking.businessName} has been cancelled.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Cancel your booking?</h1>
            <p className="mt-2 text-gray-600">
              Are you sure you want to cancel this appointment?
            </p>

            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 inline-block text-left">
              <div className="text-sm font-medium text-gray-900">{booking.businessName}</div>
              <div className="mt-1 text-sm text-gray-600">{booking.serviceName}</div>
              <div className="mt-2 text-sm text-gray-600">{dateDisplay}</div>
              <div className="text-sm text-gray-600">{timeDisplay}</div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, cancel my booking"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
