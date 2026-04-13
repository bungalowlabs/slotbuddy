import { signIn, auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MagicLinkForm } from "@/components/magic-link-form";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Wordmark */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Hello!<span className="text-terracotta"> SlotBuddy</span>
        </Link>
      </div>

      <div className="mx-auto flex max-w-md flex-col px-6 pb-16 pt-12 lg:pt-20">
        <p className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          <span className="h-px w-8 bg-terracotta" />
          14 days, on us
        </p>
        <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink lg:text-6xl">
          Let&rsquo;s get you a{" "}
          <em className="italic text-terracotta">booking page</em>.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink/70">
          Sign up with Google, tell us what you do, and share your link. The whole
          thing takes less time than making coffee.
        </p>

        <div className="mt-10 space-y-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/onboarding" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-white px-5 py-4 text-base font-medium text-ink shadow-[0_1px_0_0_rgba(31,43,46,0.05)] transition-colors hover:border-ink/25 hover:bg-ink/[0.02]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </button>
          </form>

          <div className="flex items-center gap-3 py-2">
            <span className="h-px flex-1 bg-ink/10" />
            <span className="text-xs font-medium text-ink/40">or</span>
            <span className="h-px flex-1 bg-ink/10" />
          </div>

          <MagicLinkForm callbackPath="/onboarding" />
        </div>

        <ul className="mt-10 space-y-3 border-l-2 border-terracotta pl-6 text-sm text-ink/75">
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-terracotta" />
            <span>14 days free. No credit card to start.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-terracotta" />
            <span>$15/month after, per business. Cancel anytime.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-terracotta" />
            <span>Your customers never need an account.</span>
          </li>
        </ul>

        <p className="mt-10 text-sm text-ink/60">
          Already set up?{" "}
          <Link
            href="/login"
            className="font-medium text-terracotta underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta"
          >
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
