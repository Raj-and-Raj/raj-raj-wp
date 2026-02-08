"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = { email: formData.get("email") };

    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    setStatus(res.ok ? "success" : "error");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm text-[color:var(--muted)]">
        Email
        <input
          name="email"
          type="email"
          className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
          placeholder="you@email.com"
          required
        />
      </label>
      {status === "success" ? (
        <p className="text-sm text-emerald-600">Reset link sent.</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-500">Could not send reset link.</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
