"use client";

import { useState } from "react";

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/book/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="mt-3 w-full rounded-full bg-ink px-4 py-2 text-xs font-medium text-cream transition-colors hover:bg-ink/90"
    >
      {copied ? "Copied ✓" : "Copy link"}
    </button>
  );
}
