"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formStartedAt, setFormStartedAt] = useState(0);

  useEffect(() => {
    setFormStartedAt(Date.now());
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const honeypot = String(formData.get("company") ?? "").trim();
    const startedAt = Number(formData.get("formStartedAt") ?? 0);
    const now = Date.now();
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();

    if (!email || !password) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Missing details",
        description: "Email and password are required.",
      });
      return;
    }

    if (honeypot) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Signup blocked",
        description: "Please try again.",
      });
      return;
    }

    if (!startedAt || now - startedAt < 2000) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Signup blocked",
        description: "Please wait a moment and try again.",
      });
      return;
    }

    if (!email.includes("@")) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Enter a valid email address.",
      });
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Weak password",
        description: "Use at least 6 characters.",
      });
      return;
    }

    const baseFromName = `${firstName}${lastName}`.toLowerCase();
    const baseFromEmail = email.split("@")[0]?.toLowerCase() ?? "user";
    const base = (baseFromName || baseFromEmail).replace(/[^a-z0-9]/g, "");
    const suffix = String(Math.floor(Math.random() * 900) + 100);
    const username = `${base || "user"}${suffix}`;

    const payload = {
      email,
      username,
      password,
      firstName,
      lastName,
      honeypot,
      formStartedAt: startedAt,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Unable to create account. Try again.",
      });
      return;
    }

    toast({
      variant: "success",
      title: "Account created",
      description: "You can sign in now.",
    });
    router.push("/account");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="hidden">
        <Label htmlFor="register-company">Company</Label>
        <Input
          id="register-company"
          name="company"
          placeholder="Company"
          autoComplete="off"
          tabIndex={-1}
        />
        <Input
          id="register-started-at"
          name="formStartedAt"
          type="hidden"
          value={formStartedAt || ""}
          readOnly
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="register-first-name">First name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-[color:var(--muted)]/60" />
            <Input
              id="register-first-name"
              name="firstName"
              placeholder="First"
              className="pl-9 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-last-name">Last name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-[color:var(--muted)]/60" />
            <Input
              id="register-last-name"
              name="lastName"
              placeholder="Last"
              className="pl-9 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-[color:var(--muted)]/60" />
          <Input
            id="register-email"
            name="email"
            type="email"
            placeholder="you@email.com"
            required
            className="pl-9 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-[color:var(--muted)]/60" />
          <Input
            id="register-password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="pl-9 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-linear-to-r from-[color:var(--brand)] to-red-600 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] hover:brightness-110"
        disabled={loading}
      >
        {loading ? (
          "Creating..."
        ) : (
          <>
            Create account <MoveRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
