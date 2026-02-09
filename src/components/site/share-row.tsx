"use client";

import React, { useState } from "react";
import { Link as LinkIcon, Share2 } from "lucide-react";

export const ShareRow: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
      return;
    }
    await handleCopy();
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
        className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-[color:var(--muted)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-[color:var(--muted)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
      >
        <LinkIcon className="h-4 w-4" />
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
};
