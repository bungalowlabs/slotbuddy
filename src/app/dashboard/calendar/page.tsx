"use client";

import { useState, useEffect, useCallback } from "react";

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  startTime: string;
  endTime: string;
  status: string;
  serviceName: string | null;
  serviceDuration: number | null;
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-teal-700 text-cream",
  completed: "bg-ink text-cream",
  cancelled: "border border-ink/15 text-ink/40 line-through",
  no_show: "bg-terracotta text-cream",
  pending: "bg-terracotta/15 text-terracotta-dark",
};

function statusPill(status: string) {
  return (
    STATUS_STYLES[status] ??
    "border border-ink/15 text-ink/60"
  );
}

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [view, setView] = useState<"day" | "week">("week");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (view === "week") {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      end.setDate(start.getDate() + 7);
    } else {
      end.setDate(end.getDate() + 1);
    }

    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
    });

    const res = await fetch(`/api/bookings?${params}`);
    if (res.ok) {
      setBookings(await res.json());
    }
    setLoading(false);
  }, [currentDate, view]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSelectedBooking(null);
    fetchBookings();
  }

  function navigate(direction: number) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (view === "week" ? 7 * direction : direction));
    setCurrentDate(d);
  }

  function goToToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setCurrentDate(d);
  }

  function getWeekDays(): Date[] {
    const start = new Date(currentDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  function getBookingsForDate(date: Date): Booking[] {
    const dateStr = date.toISOString().split("T")[0];
    return bookings.filter((b) => {
      const bDate = new Date(b.startTime).toISOString().split("T")[0];
      return bDate === dateStr;
    });
  }

  function formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  const weekDays = view === "week" ? getWeekDays() : [currentDate];
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            <span className="h-px w-8 bg-terracotta" />
            What&rsquo;s booked
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-5xl">
            Calendar
          </h1>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-ink/10 bg-white p-1">
          <button
            onClick={() => setView("day")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              view === "day" ? "bg-ink text-cream" : "text-ink/60 hover:text-ink"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setView("week")}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              view === "week" ? "bg-ink text-cream" : "text-ink/60 hover:text-ink"
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between border-y border-ink/10 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-cream hover:text-ink"
          aria-label="Previous"
        >
          ←
        </button>
        <div className="flex items-center gap-4">
          <div className="font-display text-base font-semibold text-ink">
            {view === "week"
              ? `${formatDate(weekDays[0])} — ${formatDate(weekDays[6])}`
              : formatDate(currentDate)}
          </div>
          <button
            onClick={goToToday}
            className="rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink/70 transition-colors hover:border-terracotta hover:text-terracotta"
          >
            Today
          </button>
        </div>
        <button
          onClick={() => navigate(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-cream hover:text-ink"
          aria-label="Next"
        >
          →
        </button>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-ink/5" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {weekDays.map((date) => {
            const dayBookings = getBookingsForDate(date);
            return (
              <div
                key={date.toISOString()}
                className="overflow-hidden rounded-3xl border border-ink/10 bg-white"
              >
                <div
                  className={`flex items-center justify-between px-5 py-3 ${
                    isToday(date)
                      ? "bg-terracotta text-cream"
                      : "bg-cream text-ink"
                  }`}
                >
                  <span className="font-display text-base font-semibold">
                    {formatDate(date)}
                  </span>
                  {isToday(date) && (
                    <span className="text-[10px] font-medium uppercase tracking-widest">
                      Today
                    </span>
                  )}
                </div>
                {dayBookings.length === 0 ? (
                  <div className="px-5 py-5 text-sm text-ink/40">Nothing scheduled.</div>
                ) : (
                  <div className="divide-y divide-ink/10">
                    {dayBookings.map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`w-full px-5 py-4 text-left transition-colors hover:bg-cream ${
                          booking.status === "cancelled" ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-display text-base font-semibold text-ink">
                              {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
                            </div>
                            <div className="mt-0.5 truncate text-sm text-ink/65">
                              {booking.customerName}
                              {booking.serviceName && (
                                <span className="text-ink/40"> · {booking.serviceName}</span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${statusPill(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Booking detail modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-cream p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
                  Booking
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-ink">
                  {selectedBooking.customerName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-ink hover:text-cream"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <dl className="mt-6 space-y-3 border-t border-ink/10 pt-5 text-sm">
              <Row label="Email" value={selectedBooking.customerEmail} />
              {selectedBooking.customerPhone && (
                <Row label="Phone" value={selectedBooking.customerPhone} />
              )}
              <Row label="Service" value={selectedBooking.serviceName || "—"} />
              <Row
                label="Time"
                value={`${formatTime(selectedBooking.startTime)} — ${formatTime(
                  selectedBooking.endTime
                )}`}
              />
              <div className="flex items-center justify-between">
                <dt className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink/50">
                  Status
                </dt>
                <dd>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${statusPill(
                      selectedBooking.status
                    )}`}
                  >
                    {selectedBooking.status}
                  </span>
                </dd>
              </div>
            </dl>

            {selectedBooking.status === "confirmed" && (
              <div className="mt-7 flex flex-wrap gap-2">
                <button
                  onClick={() => updateStatus(selectedBooking.id, "completed")}
                  className="flex-1 rounded-full bg-teal-700 px-4 py-3 text-sm font-medium text-cream transition-colors hover:bg-teal-800"
                >
                  Complete
                </button>
                <button
                  onClick={() => updateStatus(selectedBooking.id, "no_show")}
                  className="flex-1 rounded-full border border-ink/15 bg-white px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-terracotta hover:text-terracotta"
                >
                  No show
                </button>
                <button
                  onClick={() => updateStatus(selectedBooking.id, "cancelled")}
                  className="flex-1 rounded-full bg-ink px-4 py-3 text-sm font-medium text-cream transition-colors hover:bg-ink/90"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-[11px] font-medium uppercase tracking-[0.15em] text-ink/50">
        {label}
      </dt>
      <dd className="text-right text-sm text-ink">{value}</dd>
    </div>
  );
}
