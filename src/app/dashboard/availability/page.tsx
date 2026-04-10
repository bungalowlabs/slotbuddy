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
            return { ...day, isEnabled: true, startTime: match.startTime, endTime: match.endTime };
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
        <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="mt-1 text-sm text-gray-500">Set the hours you accept bookings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save schedule"}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {schedule.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`rounded-xl border bg-white p-4 ${
              day.isEnabled ? "border-gray-200" : "border-gray-100 opacity-60"
            }`}
          >
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 min-w-[140px]">
                <input
                  type="checkbox"
                  checked={day.isEnabled}
                  onChange={(e) => updateDay(day.dayOfWeek, { isEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-900">
                  {DAY_NAMES[day.dayOfWeek]}
                </span>
              </label>

              {day.isEnabled && (
                <div className="flex items-center gap-2">
                  <select
                    value={day.startTime}
                    onChange={(e) => updateDay(day.dayOfWeek, { startTime: e.target.value })}
                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {formatTime(t)}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-400">to</span>
                  <select
                    value={day.endTime}
                    onChange={(e) => updateDay(day.dayOfWeek, { endTime: e.target.value })}
                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {formatTime(t)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!day.isEnabled && (
                <span className="text-sm text-gray-400">Closed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
