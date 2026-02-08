"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Invalid credentials");
      return;
    }

    router.push("/account");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-[color:var(--muted)]">
          Username or email
          <input
            name="username"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
            placeholder="you@email.com"
            required
          />
        </label>
        <label className="block text-sm text-[color:var(--muted)]">
          Password
          <input
            name="password"
            type="password"
            className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
            placeholder="••••••••"
            required
          />
        </label>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="text-right">
        <a
          href="/forgot-password"
          className="text-xs font-semibold text-[color:var(--brand)]"
        >
          Forgot password?
        </a>
      </div>
    </div>
  );
}
