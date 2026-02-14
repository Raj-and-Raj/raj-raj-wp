"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !password) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Missing details",
        description: "Enter your username/email and password.",
      });
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Use at least 6 characters.",
      });
      return;
    }

    const payload = { username, password };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      toast({
        variant: "destructive",
        title: "Invalid credentials",
        description: "Please check your details and try again.",
      });
      return;
    }

    toast({
      variant: "success",
      title: "Signed in",
      description: "Welcome back.",
    });
    window.dispatchEvent(new Event("auth:updated"));
    router.push("/account");
  };

  return (
    <div className="space-y-4">
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
