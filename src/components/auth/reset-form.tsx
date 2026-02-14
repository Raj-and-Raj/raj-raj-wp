"use client";

import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
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
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-[color:var(--muted)]/60" />
          <Input
            id="reset-email"
            name="email"
            type="email"
            placeholder="you@email.com"
            required
            className="pl-9 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
          />
        </div>
      </div>
      {status === "success" ? (
        <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-600">
          Reset link sent. Check your inbox.
        </div>
      ) : null}
      {status === "error" ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
          Could not send reset link. Please try again.
        </div>
      ) : null}
      <Button
        type="submit"
        className="w-full bg-linear-to-r from-[color:var(--brand)] to-red-600 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] hover:brightness-110"
        disabled={loading}
      >
        {loading ? (
          "Sending..."
        ) : (
          <>
            Send reset link <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      <div className="text-right">
        <a href="/login" className="text-xs font-semibold text-[color:var(--brand)]">
          Back to login
        </a>
      </div>
    </form>
  );
}
