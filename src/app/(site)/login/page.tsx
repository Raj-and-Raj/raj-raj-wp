"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { ResetPasswordForm } from "@/components/auth/reset-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          router.replace("/account");
          return;
        }
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [router]);

  if (checking) {
    return (
      <div className="mx-auto max-w-lg rounded-[16px] border border-black/5 bg-white/95 p-8">
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-sm text-[color:var(--muted)]">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-[color:var(--brand)]" />
          Checking your session...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-[16px] border border-black/5 bg-white/95 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Account access</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Sign in, create an account, or reset your password.
        </p>
      </div>
      <Tabs defaultValue="login" className="w-full">
        <TabsList>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="reset">Forgot</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm />
        </TabsContent>
        <TabsContent value="reset">
          <ResetPasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
