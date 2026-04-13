"use client";

import { useState, useEffect, useCallback } from "react";

interface BlockedTime {
  id: string;
  startTime: string;
  endTime: string;
  reason: string | null;
}

const inputClass =
  "mt-2 block w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder-ink/30 outline-none transition-colors focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20";
const labelClass =
  "block text-xs font-medium uppercase tracking-[0.15em] text-ink/60";

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
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            <span className="h-px w-8 bg-terracotta" />
            When you&rsquo;re away
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-5xl">
            Blocked times
          </h1>
          <p className="mt-4 text-base text-ink/65">
            Vacation, holidays, a Tuesday off — block it here and nobody can book it.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex-shrink-0 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-teal-800"
        >
          + Block time
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mt-8 space-y-5 rounded-3xl border border-ink/10 bg-white p-7"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
              New block
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink">
              Block off some time
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate) setEndDate(e.target.value);
                }}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Reason <span className="normal-case tracking-normal text-ink/40">(optional)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Vacation, Holiday"
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-teal-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Block this time"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full px-4 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:bg-cream hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="mt-10 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-ink/5" />
          ))}
        </div>
      ) : blocks.length === 0 ? (
        <div className="mt-16 border-t border-ink/10 pt-10 text-center">
          <p className="text-base text-ink/60">
            Nothing blocked. Everything on your schedule is fair game.
          </p>
        </div>
      ) : (
        <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
          {blocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center justify-between gap-4 py-5"
            >
              <div className="min-w-0">
                <div className="font-display text-base font-semibold text-ink">
                  {formatDateTime(block.startTime)}
                </div>
                <div className="mt-0.5 text-sm text-ink/60">
                  → {formatDateTime(block.endTime)}
                </div>
                {block.reason && (
                  <div className="mt-1 text-xs italic text-terracotta">{block.reason}</div>
                )}
              </div>
              <button
                onClick={() => handleDelete(block.id)}
                className="flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium text-ink/50 transition-colors hover:bg-ink hover:text-cream"
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
