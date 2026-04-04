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

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-100 border-blue-200 text-blue-800",
  completed: "bg-green-100 border-green-200 text-green-800",
  cancelled: "bg-gray-100 border-gray-200 text-gray-500 line-through",
  no_show: "bg-yellow-100 border-yellow-200 text-yellow-800",
};

export default function DashboardPage() {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("day")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "day" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setView("week")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "week" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-gray-100">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="text-sm font-medium text-gray-900">
          {view === "week"
            ? `${formatDate(weekDays[0])} — ${formatDate(weekDays[6])}`
            : formatDate(currentDate)}
        </div>
        <button onClick={() => navigate(1)} className="rounded-lg p-2 hover:bg-gray-100">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {weekDays.map((date) => {
            const dayBookings = getBookingsForDate(date);
            return (
              <div key={date.toISOString()} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div
                  className={`px-4 py-2 border-b text-sm font-medium ${
                    isToday(date) ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {formatDate(date)}
                  {isToday(date) && <span className="ml-2 text-xs font-normal">Today</span>}
                </div>
                {dayBookings.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">No bookings</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {dayBookings.map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          booking.status === "cancelled" ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
                            </span>
                            <span className="ml-2 text-sm text-gray-600">
                              {booking.customerName}
                            </span>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        {booking.serviceName && (
                          <div className="mt-1 text-xs text-gray-500">{booking.serviceName}</div>
                        )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Customer: </span>
                <span className="font-medium text-gray-900">{selectedBooking.customerName}</span>
              </div>
              <div>
                <span className="text-gray-500">Email: </span>
                <span className="text-gray-900">{selectedBooking.customerEmail}</span>
              </div>
              {selectedBooking.customerPhone && (
                <div>
                  <span className="text-gray-500">Phone: </span>
                  <span className="text-gray-900">{selectedBooking.customerPhone}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Service: </span>
                <span className="text-gray-900">{selectedBooking.serviceName || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500">Time: </span>
                <span className="text-gray-900">
                  {formatTime(selectedBooking.startTime)} — {formatTime(selectedBooking.endTime)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Status: </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_COLORS[selectedBooking.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            {selectedBooking.status === "confirmed" && (
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => updateStatus(selectedBooking.id, "completed")}
                  className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  Completed
                </button>
                <button
                  onClick={() => updateStatus(selectedBooking.id, "no_show")}
                  className="flex-1 rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition-colors"
                >
                  No Show
                </button>
                <button
                  onClick={() => updateStatus(selectedBooking.id, "cancelled")}
                  className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
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
