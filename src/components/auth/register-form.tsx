"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
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
      email: formData.get("email"),
      username: formData.get("username"),
      password: formData.get("password"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Unable to create account");
      return;
    }

    router.push("/login");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-[color:var(--muted)]">
          First name
          <input
            name="firstName"
            className="mt-2 w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 text-sm"
            placeholder="First"
          />
        </label>
        <label className="block text-sm text-[color:var(--muted)]">
          Last name
          <input
            name="lastName"
            className="mt-2 w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 text-sm"
            placeholder="Last"
          />
        </label>
      </div>
      <label className="block text-sm text-[color:var(--muted)]">
        Email
        <input
          name="email"
          type="email"
          className="mt-2 w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 text-sm"
          placeholder="you@email.com"
          required
        />
      </label>
      <label className="block text-sm text-[color:var(--muted)]">
        Username
        <input
          name="username"
          className="mt-2 w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 text-sm"
          placeholder="yourname"
        />
      </label>
      <label className="block text-sm text-[color:var(--muted)]">
        Password
        <input
          name="password"
          type="password"
          className="mt-2 w-full rounded-[12px] border border-black/10 bg-white px-4 py-3 text-sm"
          placeholder="••••••••"
          required
        />
      </label>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create account"}
      </Button>
    </form>
  );
}
