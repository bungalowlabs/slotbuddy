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
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-terracotta/15 text-terracotta-dark",
  confirmed: "bg-teal-700 text-cream",
  completed: "bg-ink text-cream",
  cancelled: "border border-ink/15 text-ink/40",
  no_show: "bg-terracotta text-cream",
};

function statusPill(status: string) {
  return STATUS_STYLES[status] ?? "border border-ink/15 text-ink/60";
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`/api/bookings?${params}`);
    if (res.ok) {
      setBookings(await res.json());
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchBookings();
  }, [fetchBookings]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchBookings();
  }

  function formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            <span className="h-px w-8 bg-terracotta" />
            Everything
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-5xl">
            Bookings
          </h1>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-shrink-0 rounded-full border border-ink/15 bg-white px-4 py-2 text-sm text-ink outline-none transition-colors focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending approval</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No show</option>
        </select>
      </div>

      {loading ? (
        <div className="mt-10 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink/5" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-16 border-t border-ink/10 pt-10 text-center">
          <p className="text-base text-ink/60">
            {statusFilter === "all"
              ? "No bookings yet. Share your booking link and the first one will show up here."
              : `No ${statusFilter} bookings.`}
          </p>
        </div>
      ) : (
        <div className="mt-10">
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-3xl border border-ink/10 bg-white md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 bg-cream">
                  <th className="px-5 py-4 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-ink/55">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-ink/55">
                    Service
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-ink/55">
                    Date & time
                  </th>
                  <th className="px-5 py-4 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-ink/55">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-[11px] font-medium uppercase tracking-[0.15em] text-ink/55">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className={booking.status === "cancelled" ? "opacity-50" : ""}
                  >
                    <td className="px-5 py-4">
                      <div className="font-display text-base font-semibold text-ink">
                        {booking.customerName}
                      </div>
                      <div className="text-xs text-ink/55">{booking.customerEmail}</div>
                    </td>
                    <td className="px-5 py-4 text-ink/75">{booking.serviceName || "—"}</td>
                    <td className="px-5 py-4 text-ink/75">{formatDateTime(booking.startTime)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${statusPill(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {booking.status === "pending" && (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => updateStatus(booking.id, "confirmed")}
                            className="rounded-full px-3 py-1.5 text-xs font-medium text-terracotta transition-colors hover:bg-terracotta/10"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, "cancelled")}
                            className="rounded-full px-3 py-1.5 text-xs font-medium text-ink/50 transition-colors hover:bg-ink hover:text-cream"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {booking.status === "confirmed" && (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => updateStatus(booking.id, "completed")}
                            className="rounded-full px-3 py-1.5 text-xs font-medium text-terracotta transition-colors hover:bg-terracotta/10"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, "cancelled")}
                            className="rounded-full px-3 py-1.5 text-xs font-medium text-ink/50 transition-colors hover:bg-ink hover:text-cream"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`rounded-3xl border border-ink/10 bg-white p-5 ${
                  booking.status === "cancelled" ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg font-semibold text-ink">
                      {booking.customerName}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-ink/55">
                      {booking.serviceName || "—"}
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
                <div className="mt-3 text-sm text-ink/70">
                  {formatDateTime(booking.startTime)}
                </div>
                {booking.status === "pending" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => updateStatus(booking.id, "confirmed")}
                      className="flex-1 rounded-full bg-teal-700 px-4 py-2 text-xs font-medium text-cream transition-colors hover:bg-teal-800"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, "cancelled")}
                      className="flex-1 rounded-full border border-ink/15 bg-white px-4 py-2 text-xs font-medium text-ink transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
                {booking.status === "confirmed" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => updateStatus(booking.id, "completed")}
                      className="flex-1 rounded-full bg-teal-700 px-4 py-2 text-xs font-medium text-cream transition-colors hover:bg-teal-800"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, "cancelled")}
                      className="flex-1 rounded-full border border-ink/15 bg-white px-4 py-2 text-xs font-medium text-ink transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
