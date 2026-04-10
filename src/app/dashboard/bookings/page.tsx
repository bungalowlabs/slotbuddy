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

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-teal-100 text-teal-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  no_show: "bg-yellow-100 text-yellow-700",
};

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending approval</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            {statusFilter === "all"
              ? "No bookings yet. Share your booking link to start getting bookings."
              : `No ${statusFilter} bookings.`}
          </p>
        </div>
      ) : (
        <div className="mt-6">
          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Service</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date & Time</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className={booking.status === "cancelled" ? "opacity-50" : ""}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{booking.customerName}</div>
                      <div className="text-xs text-gray-500">{booking.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{booking.serviceName || "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{formatDateTime(booking.startTime)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[booking.status] || "bg-gray-100 text-gray-600"}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {booking.status === "pending" && (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => updateStatus(booking.id, "confirmed")}
                            className="rounded px-2 py-1 text-xs text-teal-600 hover:bg-teal-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, "cancelled")}
                            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {booking.status === "confirmed" && (
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => updateStatus(booking.id, "completed")}
                            className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, "cancelled")}
                            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
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
          <div className="md:hidden space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`rounded-xl border border-gray-200 bg-white p-4 ${
                  booking.status === "cancelled" ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{booking.customerName}</div>
                    <div className="text-xs text-gray-500">{booking.serviceName || "—"}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[booking.status] || "bg-gray-100 text-gray-600"}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">{formatDateTime(booking.startTime)}</div>
                {booking.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => updateStatus(booking.id, "confirmed")}
                      className="rounded-lg px-3 py-1 text-xs font-medium text-teal-600 border border-teal-200 hover:bg-teal-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, "cancelled")}
                      className="rounded-lg px-3 py-1 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50"
                    >
                      Decline
                    </button>
                  </div>
                )}
                {booking.status === "confirmed" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => updateStatus(booking.id, "completed")}
                      className="rounded-lg px-3 py-1 text-xs font-medium text-green-600 border border-green-200 hover:bg-green-50"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => updateStatus(booking.id, "cancelled")}
                      className="rounded-lg px-3 py-1 text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50"
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
