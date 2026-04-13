import Link from "next/link";

export function TrialBanner({ trialEndsAt }: { trialEndsAt: Date }) {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - now.getTime()) / msPerDay));

  const urgent = daysLeft <= 2;

  const label =
    daysLeft === 0
      ? "Trial ends today"
      : daysLeft === 1
      ? "1 day left in your trial"
      : `${daysLeft} days left in your trial`;

  return (
    <div
      className={`border-b ${
        urgent ? "border-terracotta/30 bg-terracotta/5" : "border-ink/10 bg-cream"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3 text-sm md:px-10">
        <span
          className={`flex items-center gap-3 font-medium ${
            urgent ? "text-terracotta-dark" : "text-ink/75"
          }`}
        >
          <span
            className={`h-px w-6 ${urgent ? "bg-terracotta" : "bg-ink/30"}`}
          />
          {label}
        </span>
        <Link
          href="/upgrade"
          className="shrink-0 rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-cream transition-colors hover:bg-ink/90"
        >
          Add payment →
        </Link>
      </div>
    </div>
  );
}
