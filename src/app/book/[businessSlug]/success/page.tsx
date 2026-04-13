import Link from "next/link";
import { FeedbackWidget } from "@/components/feedback-widget";

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { date?: string; time?: string; status?: string };
}) {
  const isPending = searchParams.status === "pending";
  const formattedDate = searchParams.date
    ? new Date(searchParams.date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-lg px-5 pb-16 pt-20">
        <p className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          <span className="h-px w-8 bg-terracotta" />
          {isPending ? "Request received" : "You're all set"}
        </p>
        <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
          {isPending ? (
            <>
              Sitting in the{" "}
              <em className="italic text-terracotta">queue</em>.
            </>
          ) : (
            <>
              See you <em className="italic text-terracotta">then</em>.
            </>
          )}
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-ink/70">
          {isPending
            ? "Your booking request is waiting for approval. We'll email you the moment it's confirmed."
            : "A confirmation email is on its way. Add it to your calendar while you're at it."}
        </p>

        {(formattedDate || searchParams.time) && (
          <div className="mt-10 border-l-2 border-terracotta pl-5">
            {formattedDate && (
              <p className="font-display text-xl font-semibold text-ink">
                {formattedDate}
              </p>
            )}
            {searchParams.time && (
              <p className="mt-1 text-lg text-ink/70">{searchParams.time}</p>
            )}
          </div>
        )}

        <p className="mt-10 text-sm text-ink/55">
          Need to cancel? Check your confirmation email for a cancellation link.
        </p>

        <footer className="mt-20 border-t border-ink/10 pt-6 text-xs text-ink/50">
          Powered by{" "}
          <Link
            href="/"
            className="font-display font-semibold text-ink hover:text-terracotta"
          >
            Hello! SlotBuddy
          </Link>
        </footer>
      </div>
      <FeedbackWidget source="booking" />
    </div>
  );
}
