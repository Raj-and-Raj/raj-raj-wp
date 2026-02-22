"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const redirectParam = searchParams.get("redirect");
          const safeRedirect =
            redirectParam &&
            redirectParam.startsWith("/") &&
            !redirectParam.startsWith("//")
              ? redirectParam
              : "/account";
          router.replace(safeRedirect);
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
      <div className="min-h-screen w-full flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-[24px] border border-black/5 bg-white/80 p-8 shadow-xl backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 text-sm text-[color:var(--muted)]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[color:var(--brand)]" />
            <p>Checking session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8 rounded-xl border border-black/5 bg-white/90 p-6 shadow-lg backdrop-blur-xl sm:p-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[color:var(--ink)]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Sign in to access your account.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Tabs defaultValue="login" className="w-full">
            <TabsContent value="login" className="mt-0">
              <LoginForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
