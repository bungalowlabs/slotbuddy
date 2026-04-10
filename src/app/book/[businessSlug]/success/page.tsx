import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          {isPending ? "Request received!" : "Booking confirmed!"}
        </h1>
        <p className="mt-2 text-gray-600">
          {isPending
            ? "Your booking request is pending approval. You'll get an email once it's confirmed."
            : "You're all set. A confirmation email is on its way."}
        </p>

        {(formattedDate || searchParams.time) && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 inline-block">
            {formattedDate && (
              <div className="text-sm font-medium text-gray-900">{formattedDate}</div>
            )}
            {searchParams.time && (
              <div className="text-sm text-gray-600">{searchParams.time}</div>
            )}
          </div>
        )}

        <p className="mt-6 text-sm text-gray-500">
          Need to cancel? Check your confirmation email for a cancellation link.
        </p>

        <footer className="mt-16 text-center text-xs text-gray-400">
          Powered by{" "}
          <Link href="/" className="text-teal-500 hover:text-teal-600">
            Hello! SlotBuddy
          </Link>
        </footer>
      </div>
    </div>
  );
}
