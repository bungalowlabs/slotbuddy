"use client";

import { useState, useEffect, useCallback } from "react";

interface BlockedTime {
  id: string;
  startTime: string;
  endTime: string;
  reason: string | null;
}

export default function BlockedTimesPage() {
  const [blocks, setBlocks] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("17:00");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBlocks = useCallback(async () => {
    const res = await fetch("/api/blocked");
    if (res.ok) {
      setBlocks(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await fetch("/api/blocked", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: new Date(`${startDate}T${startTime}`).toISOString(),
        endTime: new Date(`${endDate}T${endTime}`).toISOString(),
        reason,
      }),
    });

    setShowForm(false);
    setStartDate("");
    setEndDate("");
    setReason("");
    setSaving(false);
    fetchBlocks();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this blocked time?")) return;
    await fetch("/api/blocked", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchBlocks();
  }

  function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blocked Times</h1>
          <p className="mt-1 text-sm text-gray-500">Block off times when you&apos;re unavailable</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
        >
          Block time
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mt-6 rounded-xl border border-gray-200 bg-white p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900">Add blocked time</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate) setEndDate(e.target.value);
                }}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Vacation, Holiday"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add blocked time"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : blocks.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">No blocked times. Add one for vacations or holidays.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDateTime(block.startTime)} — {formatDateTime(block.endTime)}
                </div>
                {block.reason && (
                  <div className="mt-1 text-xs text-gray-500">{block.reason}</div>
                )}
              </div>
              <button
                onClick={() => handleDelete(block.id)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
