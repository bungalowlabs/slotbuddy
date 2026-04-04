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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          &larr; Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900">Pick a date & time</h1>

        {/* Calendar */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-900">{monthName}</span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="py-1">{d}</div>
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
                  className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : isToday
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : selectable
                      ? "text-gray-900 hover:bg-gray-100"
                      : "text-gray-300 cursor-not-allowed"
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
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">Available times</h2>
            {loadingSlots ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">No available times on this date. Try another day.</p>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.startUTC}
                    onClick={() => selectSlot(slot)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="mt-12 text-center text-xs text-gray-400">
          Powered by{" "}
          <a href="/" className="text-blue-500 hover:text-blue-600">
            SlotBuddy
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
