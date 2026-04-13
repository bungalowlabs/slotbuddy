import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Hello!<span className="text-terracotta"> SlotBuddy</span>
        </Link>
      </div>

      <div className="mx-auto flex max-w-md flex-col px-6 pb-16 pt-12 lg:pt-20">
        <p className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          <span className="h-px w-8 bg-terracotta" />
          Check your inbox
        </p>
        <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink lg:text-6xl">
          Link <em className="italic text-terracotta">sent</em>.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink/70">
          We just emailed you a sign-in link. Click it to continue &mdash; no
          password needed. Check your spam folder if you don&rsquo;t see it.
        </p>

        <p className="mt-10 text-sm text-ink/60">
          Wrong email?{" "}
          <Link
            href="/login"
            className="font-medium text-terracotta underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta"
          >
            Try again →
          </Link>
        </p>
      </div>
    </div>
  );
}
