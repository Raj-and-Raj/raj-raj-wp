"use client";

import { useState } from "react";
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !username || !password) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Missing details",
        description: "Email, username, and password are required.",
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

    const payload = {
      email,
      username,
      password,
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
        <Label htmlFor="register-username">Username</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-[color:var(--muted)]/60" />
          <Input
            id="register-username"
            name="username"
            placeholder="yourname"
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
