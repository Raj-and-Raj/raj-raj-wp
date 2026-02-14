"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, KeyRound } from "lucide-react";
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
      <div className="mx-auto mt-32 flex min-h-[400px] max-w-lg items-center justify-center rounded-[24px] border border-black/5 bg-white/80 p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col items-center gap-4 text-sm text-[color:var(--muted)]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[color:var(--brand)]" />
          <p>Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-32 max-w-lg space-y-8 rounded-xl border border-black/5 bg-white/90 p-6 shadow-lg backdrop-blur-xl sm:p-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[color:var(--ink)]">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Sign in to access your account or create a new one.
        </p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-3 gap-1 bg-black/5 p-1">
          <TabsTrigger
            value="login"
            className="flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm"
          >
            <LogIn className="h-4 w-4" />
            <span className="text-xs font-semibold sm:text-sm">Login</span>
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span className="text-xs font-semibold sm:text-sm">Join</span>
          </TabsTrigger>
          <TabsTrigger
            value="reset"
            className="flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm"
          >
            <KeyRound className="h-4 w-4" />
            <span className="text-xs font-semibold sm:text-sm">Reset</span>
          </TabsTrigger>
        </TabsList>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TabsContent value="login" className="mt-0">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register" className="mt-0">
            <RegisterForm />
          </TabsContent>
          <TabsContent value="reset" className="mt-0">
            <ResetPasswordForm />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
