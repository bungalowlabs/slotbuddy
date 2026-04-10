import Link from "next/link";

export function TrialBanner({ trialEndsAt }: { trialEndsAt: Date }) {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - now.getTime()) / msPerDay));

  let tone = "bg-gray-100 text-gray-800 border-gray-200";
  if (daysLeft <= 2) tone = "bg-red-100 text-red-900 border-red-200";
  else if (daysLeft <= 5) tone = "bg-yellow-100 text-yellow-900 border-yellow-200";

  const label =
    daysLeft === 0
      ? "Your trial ends today"
      : daysLeft === 1
      ? "1 day left in your trial"
      : `${daysLeft} days left in your trial`;

  return (
    <div className={`border-b ${tone}`}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2 text-sm">
        <span className="font-medium">{label}</span>
        <Link
          href="/upgrade"
          className="shrink-0 rounded-md bg-white/70 px-3 py-1 text-xs font-semibold hover:bg-white"
        >
          Add payment method →
        </Link>
      </div>
    </div>
  );
}
