"use client";

import { useState } from "react";

export function FeedbackWidget({
  source,
  businessId,
  userEmail,
}: {
  source: "dashboard" | "booking";
  businessId?: string;
  userEmail?: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);

    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, businessId, userEmail, message, rating }),
    });

    setSending(false);
    setSent(true);
    setTimeout(() => {
      setOpen(false);
      setSent(false);
      setMessage("");
      setRating(null);
    }, 2000);
  }

  if (sent) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-80 rounded-3xl border border-ink/10 bg-white p-6 shadow-lg">
        <p className="font-display text-lg font-semibold text-ink">Thanks!</p>
        <p className="mt-1 text-sm text-ink/60">Your feedback helps us improve.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm font-medium text-ink/70 shadow-md transition-all hover:border-ink/25 hover:text-ink hover:shadow-lg"
      >
        Feedback?
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-3xl border border-ink/10 bg-white p-6 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-ink">Send feedback</p>
          <p className="mt-0.5 text-xs text-ink/50">We read every message.</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-ink/40 transition-colors hover:text-ink"
        >
          &times;
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(rating === n ? null : n)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors ${
                rating && n <= rating
                  ? "bg-terracotta/10 text-terracotta"
                  : "text-ink/25 hover:text-ink/50"
              }`}
            >
              *
            </button>
          ))}
          <span className="ml-2 text-xs text-ink/40">
            {rating ? `${rating}/5` : "optional"}
          </span>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's on your mind? Bug reports, feature ideas, or just a kind word..."
          rows={3}
          required
          className="block w-full resize-none rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder-ink/30 outline-none transition-colors focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
        />

        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="w-full rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-teal-800 disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send feedback"}
        </button>
      </form>
    </div>
  );
}
