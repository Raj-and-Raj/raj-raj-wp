"use client";

import { useState } from "react";

export function ShareRow() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <button
        onClick={handleShare}
        className="rounded-full border border-black/10 px-4 py-2 text-[color:var(--muted)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
      >
        Share
      </button>
      <button
        onClick={handleCopy}
        className="rounded-full border border-black/10 px-4 py-2 text-[color:var(--muted)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
      <div className="rounded-full border border-black/10 px-4 py-2 text-[color:var(--muted)]">
        Wishlist
      </div>
    </div>
  );
}