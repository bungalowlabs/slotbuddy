"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";

interface Slot {
  time: string;
  startUTC: string;
  endUTC: string;
}

export default function DatePickerPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const businessSlug = params.businessSlug as string;
  const serviceId = searchParams.get("service");

  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    if (!selectedDate || !serviceId) return;
    setLoadingSlots(true);
    fetch(
      `/api/availability/slots?business=${businessSlug}&service=${serviceId}&date=${selectedDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots || []);
      })
      .catch(() => {
        setSlots([]);
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, [selectedDate, serviceId, businessSlug]);

  function selectSlot(slot: Slot) {
    const params = new URLSearchParams({
      service: serviceId!,
      start: slot.startUTC,
      end: slot.endUTC,
      date: selectedDate,
      time: slot.time,
    });
    router.push(`/book/${businessSlug}/confirm?${params}`);
  }

  // Calendar rendering
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function prevMonth() {
    setCurrentMonth((prev) => {
      const d = new Date(prev.year, prev.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      const d = new Date(prev.year, prev.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function isDateSelectable(day: number): boolean {
    const d = new Date(currentMonth.year, currentMonth.month, day);
    return d >= today;
  }

  function formatDateStr(day: number): string {
    const m = (currentMonth.month + 1).toString().padStart(2, "0");
    const d = day.toString().padStart(2, "0");
    return `${currentMonth.year}-${m}-${d}`;
  }

  if (!serviceId) {
    router.push(`/book/${businessSlug}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-lg px-5 pb-16 pt-8">
        <button
          onClick={() => router.back()}
          className="-ml-1 mb-6 text-sm font-medium text-ink/60 transition-colors hover:text-terracotta"
        >
          ← Back
        </button>

        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          Step 2 — When?
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.0] tracking-tight sm:text-5xl">
          Pick a <em className="italic text-terracotta">time</em>.
        </h1>

        {/* Calendar */}
        <div className="mt-8 rounded-3xl border border-ink/10 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-cream hover:text-ink"
              aria-label="Previous month"
            >
              ←
            </button>
            <span className="font-display text-base font-semibold text-ink">{monthName}</span>
            <button
              onClick={nextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-cream hover:text-ink"
              aria-label="Next month"
            >
              →
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wider text-ink/40">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = formatDateStr(day);
              const selectable = isDateSelectable(day);
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === formatTodayStr();

              return (
                <button
                  key={day}
                  onClick={() => selectable && setSelectedDate(dateStr)}
                  disabled={!selectable}
                  className={`aspect-square min-h-[44px] rounded-full text-base font-medium transition-colors ${
                    isSelected
                      ? "bg-terracotta text-cream"
                      : isToday
                      ? "bg-cream text-terracotta hover:bg-terracotta/10"
                      : selectable
                      ? "text-ink hover:bg-cream"
                      : "text-ink/20 cursor-not-allowed"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="mt-10">
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink/60">
              Available times
            </p>
            {loadingSlots ? (
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-2xl bg-ink/5" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="mt-5 text-base text-ink/60">
                Nothing open that day. Try another.
              </p>
            ) : (
              <div className="mt-5 grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.startUTC}
                    onClick={() => selectSlot(slot)}
                    className="min-h-[52px] rounded-2xl border border-ink/15 bg-white px-3 py-3 text-base font-medium text-ink transition-all hover:border-terracotta hover:bg-terracotta hover:text-cream active:scale-95"
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
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

function formatTodayStr(): string {
  const d = new Date();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
