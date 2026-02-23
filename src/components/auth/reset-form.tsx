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
  const [step, setStep] = useState<"request" | "set">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { toast } = useToast();

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");

    const nextEmail = email.trim();
    if (!nextEmail || !nextEmail.includes("@")) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Enter a valid email address.",
      });
      return;
    }

    const res = await fetch("/api/auth/reset/code/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: nextEmail }),
    });

    setLoading(false);
    setStatus(res.ok ? "success" : "error");
    toast({
      variant: res.ok ? "success" : "destructive",
      title: res.ok ? "Code sent" : "Reset failed",
      description: res.ok
        ? "Check your email for the reset code."
        : "Could not send reset code.",
    });
    if (res.ok) {
      setStep("set");
    }
  };

  const handleSetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");

    const nextEmail = email.trim();
    if (!nextEmail || !nextEmail.includes("@")) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Enter a valid email address.",
      });
      return;
    }
    if (!code.trim()) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Missing code",
        description: "Enter the reset code from your email.",
      });
      return;
    }
    if (!password) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Missing password",
        description: "Enter a new password.",
      });
      return;
    }
    if (password !== confirm) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please confirm the same password.",
      });
      return;
    }

    const validateRes = await fetch("/api/auth/reset/code/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: nextEmail, code: code.trim() }),
    });

    if (!validateRes.ok) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Invalid code",
        description: "The reset code is invalid or has expired.",
      });
      return;
    }

    const res = await fetch("/api/auth/reset/code/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: nextEmail,
        code: code.trim(),
        password,
      }),
    });

    setLoading(false);
    setStatus(res.ok ? "success" : "error");
    toast({
      variant: res.ok ? "success" : "destructive",
      title: res.ok ? "Password updated" : "Reset failed",
      description: res.ok
        ? "You can now sign in with your new password."
        : "Could not reset password. Please try again.",
    });
    if (res.ok) {
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    }
  };

  return step === "request" ? (
    <form onSubmit={handleRequest} className="space-y-4">
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      </div>
      {status === "success" ? (
        <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-600">
          Reset code sent. Check your inbox.
        </div>
      ) : null}
      {status === "error" ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
          Could not send reset code. Please try again.
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
            Send reset code <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      <div className="text-right">
        <a
          href="/login"
          className="text-xs font-semibold text-[color:var(--brand)]"
        >
          Back to login
        </a>
      </div>
    </form>
  ) : (
    <form onSubmit={handleSetPassword} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email-confirm">Email</Label>
        <Input
          id="reset-email-confirm"
          name="email"
          type="email"
          placeholder="you@email.com"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reset-code">Reset code</Label>
        <Input
          id="reset-code"
          name="code"
          type="text"
          placeholder="Enter the code from email"
          required
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          name="password"
          type="password"
          placeholder="********"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input
          id="confirm-password"
          name="confirm"
          type="password"
          placeholder="********"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </div>
      {status === "success" ? (
        <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-600">
          Password updated. You can now sign in.
        </div>
      ) : null}
      {status === "error" ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
          Could not reset password. Please try again.
        </div>
      ) : null}
      <Button
        type="submit"
        className="w-full bg-linear-to-r from-[color:var(--brand)] to-red-600 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] hover:brightness-110"
        disabled={loading}
      >
        {loading ? "Updating..." : "Update password"}
      </Button>
      <div className="text-right">
        <button
          type="button"
          className="text-xs font-semibold text-[color:var(--brand)]"
          onClick={() => setStep("request")}
        >
          Send new code
        </button>
      </div>
    </form>
  );
}
