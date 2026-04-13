"use client";

import { useState, useEffect, useCallback } from "react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface DaySchedule {
  dayOfWeek: number;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
}

const DEFAULT_SCHEDULE: DaySchedule[] = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i,
  isEnabled: i >= 1 && i <= 5, // Mon-Fri enabled by default
  startTime: "09:00",
  endTime: "17:00",
}));

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  }
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

const selectClass =
  "rounded-full border border-ink/15 bg-white px-4 py-2 text-sm text-ink outline-none transition-colors focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20";

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchAvailability = useCallback(async () => {
    const res = await fetch("/api/availability");
    if (res.ok) {
      const slots = await res.json();
      if (slots.length > 0) {
        const loaded = DEFAULT_SCHEDULE.map((day) => {
          const match = slots.find((s: DaySchedule) => s.dayOfWeek === day.dayOfWeek);
          if (match) {
            return { ...day, isEnabled: true, startTime: match.startTime.slice(0, 5), endTime: match.endTime.slice(0, 5) };
          }
          return { ...day, isEnabled: false };
        });
        setSchedule(loaded);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  function updateDay(dayOfWeek: number, updates: Partial<DaySchedule>) {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...updates } : d))
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div>
        <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          <span className="h-px w-8 bg-terracotta" />
          When you work
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-5xl">
          Availability
        </h1>
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-ink/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            <span className="h-px w-8 bg-terracotta" />
            When you work
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-5xl">
            Availability
          </h1>
          <p className="mt-4 text-base text-ink/65">
            Set the hours you accept bookings. Closed on a day? Just uncheck it.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-shrink-0 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-teal-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save schedule"}
        </button>
      </div>

      <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
        {schedule.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`flex flex-wrap items-center gap-4 py-5 ${
              day.isEnabled ? "" : "opacity-50"
            }`}
          >
            <label className="flex min-w-[160px] items-center gap-3">
              <input
                type="checkbox"
                checked={day.isEnabled}
                onChange={(e) => updateDay(day.dayOfWeek, { isEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-ink/30 text-terracotta focus:ring-terracotta/30"
              />
              <span className="font-display text-lg font-semibold text-ink">
                {DAY_NAMES[day.dayOfWeek]}
              </span>
            </label>

            {day.isEnabled ? (
              <div className="flex items-center gap-3">
                <select
                  value={day.startTime}
                  onChange={(e) => updateDay(day.dayOfWeek, { startTime: e.target.value })}
                  className={selectClass}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-ink/40">→</span>
                <select
                  value={day.endTime}
                  onChange={(e) => updateDay(day.dayOfWeek, { endTime: e.target.value })}
                  className={selectClass}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-sm italic text-ink/40">Closed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
