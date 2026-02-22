"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function LoginForm({ redirectTo }: { redirectTo?: string } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !password) {
      setLoading(false);
      setErrorMessage("Enter your username/email and password.");
      toast({
        variant: "destructive",
        title: "Missing details",
        description: "Enter your username/email and password.",
      });
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      setErrorMessage("Use at least 6 characters.");
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Use at least 6 characters.",
      });
      return;
    }

    const payload = { username, password };

    let res: Response | null = null;
    try {
      res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      setLoading(false);
      const message =
        error instanceof Error ? error.message : "Unable to sign in.";
      setErrorMessage(message);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: message,
      });
      return;
    }

    setLoading(false);

    if (!res.ok) {
      let message = "Invalid credentials";
      try {
        const data = (await res.json()) as { error?: string };
        if (data?.error) message = String(data.error);
      } catch {
        // ignore JSON parse errors
      }
      setErrorMessage(message);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: message,
      });
      return;
    }

    toast({
      variant: "success",
      title: "Signed in",
      description: "Welcome back.",
    });
    window.dispatchEvent(new Event("auth:updated"));
    const redirectParam = redirectTo || searchParams.get("redirect");
    const safeRedirect =
      redirectParam &&
      redirectParam.startsWith("/") &&
      !redirectParam.startsWith("//")
        ? redirectParam
        : "/account";
    router.push(safeRedirect);
  };

  return (
    <div className="space-y-4">
      {errorMessage ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-username">Username or email</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-[color:var(--muted)]/60" />
            <Input
              id="login-username"
              name="username"
              placeholder="you@email.com"
              required
              className="pl-9 transition-all focus-visible:ring-2 focus-visible:ring-[color:var(--brand)] focus-visible:ring-offset-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <a
              href="/forgot-password"
              className="text-xs font-semibold text-[color:var(--brand)] hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-[color:var(--muted)]/60" />
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="pl-9 transition-all focus-visible:ring-2 focus-visible:ring-[color:var(--brand)] focus-visible:ring-offset-1"
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-linear-to-r from-[color:var(--brand)] to-red-600 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] hover:brightness-110"
          disabled={loading}
        >
          {loading ? (
            "Signing in..."
          ) : (
            <>
              Sign in <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
