"use client";

import { useState } from "react";

export function MagicLinkForm({ callbackPath }: { callbackPath: string }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), callbackPath }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-teal-700/20 bg-teal-700/5 p-6">
        <p className="font-display text-lg font-semibold text-ink">Check your inbox</p>
        <p className="mt-1.5 text-sm text-ink/65">
          We sent a sign-in link to <strong>{email}</strong>. Click it to continue — no password needed.
        </p>
        <button
          onClick={() => { setSent(false); setEmail(""); }}
          className="mt-3 text-sm font-medium text-terracotta hover:text-terracotta-dark"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@yourbusiness.com"
        required
        className="block w-full rounded-full border border-ink/15 bg-white px-5 py-4 text-base text-ink placeholder-ink/30 outline-none transition-colors focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
      />
      <button
        type="submit"
        disabled={sending || !email.trim()}
        className="mt-3 w-full rounded-full bg-teal-700 px-5 py-4 text-base font-medium text-cream transition-colors hover:bg-teal-800 disabled:opacity-50"
      >
        {sending ? "Sending..." : "Email me a sign-in link"}
      </button>
      {error && <p className="mt-3 text-sm text-terracotta">{error}</p>}
    </form>
  );
}
