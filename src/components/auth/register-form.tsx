"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function RegisterForm({ redirectTo }: { redirectTo?: string } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formStartedAt, setFormStartedAt] = useState(0);
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    setFormStartedAt(Date.now());
  }, []);

  const validate = (nextValues: typeof values) => {
    const nextErrors = { email: "", password: "" };
    const email = nextValues.email.trim();
    const password = nextValues.password;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (password && password.length < 6) {
      nextErrors.password = "Use at least 6 characters.";
    }
    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = values.email.trim();
    const password = values.password;
    const honeypot = String(formData.get("company") ?? "").trim();
    const startedAt = Number(formData.get("formStartedAt") ?? 0);
    const now = Date.now();
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();

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

    const currentErrors = validate(values);
    if (currentErrors.email || currentErrors.password) {
      setErrors(currentErrors);
      setTouched({ email: true, password: true });
      setLoading(false);
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
            value={values.firstName}
            onChange={(event) => {
              const next = { ...values, firstName: event.target.value };
              setValues(next);
            }}
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
            value={values.lastName}
            onChange={(event) => {
              const next = { ...values, lastName: event.target.value };
              setValues(next);
            }}
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
          value={values.email}
          onChange={(event) => {
            const next = { ...values, email: event.target.value };
            setValues(next);
            if (touched.email) {
              setErrors(validate(next));
            }
          }}
          onBlur={() => {
            setTouched((prev) => ({ ...prev, email: true }));
            setErrors(validate(values));
          }}
          className="pl-9 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
        />
      </div>
      {touched.email && errors.email ? (
        <p className="text-xs text-rose-600">{errors.email}</p>
      ) : null}
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
          value={values.password}
          onChange={(event) => {
            const next = { ...values, password: event.target.value };
            setValues(next);
            if (touched.password) {
              setErrors(validate(next));
            }
          }}
          onBlur={() => {
            setTouched((prev) => ({ ...prev, password: true }));
            setErrors(validate(values));
          }}
          className="pl-9 focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
        />
      </div>
      {touched.password && errors.password ? (
        <p className="text-xs text-rose-600">{errors.password}</p>
      ) : null}
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
