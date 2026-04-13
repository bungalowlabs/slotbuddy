"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "error">("verifying");

  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    const redirect = searchParams.get("redirect") || "/dashboard";

    if (!email || !token) {
      setStatus("error");
      return;
    }

    signIn("magic-link", {
      email,
      token,
      callbackUrl: redirect,
    }).catch(() => {
      setStatus("error");
    });
  }, [searchParams]);

  if (status === "error") {
    return (
      <div className="min-h-screen bg-cream text-ink">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            Hello!<span className="text-terracotta"> SlotBuddy</span>
          </Link>
        </div>
        <div className="mx-auto flex max-w-md flex-col px-6 pb-16 pt-12 lg:pt-20">
          <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-ink">
            Link <em className="italic text-terracotta">expired</em>.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/70">
            This sign-in link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-full bg-teal-700 px-6 py-3 text-center text-sm font-medium text-cream transition-colors hover:bg-teal-800"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Hello!<span className="text-terracotta"> SlotBuddy</span>
        </Link>
      </div>
      <div className="mx-auto flex max-w-md flex-col px-6 pb-16 pt-12 lg:pt-20">
        <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-ink">
          Signing you <em className="italic text-terracotta">in</em>...
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink/70">
          Hold tight, we&rsquo;re verifying your link.
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream text-ink">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            Hello!<span className="text-terracotta"> SlotBuddy</span>
          </Link>
        </div>
        <div className="mx-auto flex max-w-md flex-col px-6 pb-16 pt-12 lg:pt-20">
          <h1 className="font-display text-4xl font-bold leading-[0.95] tracking-tight text-ink">
            Signing you <em className="italic text-terracotta">in</em>...
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink/70">
            Hold tight, we&rsquo;re verifying your link.
          </p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
