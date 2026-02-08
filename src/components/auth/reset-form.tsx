"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function ResetPasswordForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    if (!email || !email.includes("@")) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Enter a valid email address.",
      });
      return;
    }

    const payload = { email };

    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);
    setStatus(res.ok ? "success" : "error");
    toast({
      variant: res.ok ? "success" : "destructive",
      title: res.ok ? "Reset link sent" : "Reset failed",
      description: res.ok
        ? "Check your email for the reset link."
        : "Could not send reset link.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          placeholder="you@email.com"
          required
        />
      </div>
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
