import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

function RegisterFallback() {
  return (
    <div className="min-h-[360px] w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-sm text-[color:var(--muted)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[color:var(--brand)]" />
        <p>Loading...</p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="mx-auto mt-32 max-w-lg space-y-8 rounded-xl border border-black/5 bg-white/90 p-6 shadow-lg backdrop-blur-xl sm:p-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[color:var(--ink)]">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Register to save your favorites and manage your orders.
        </p>
      </div>
      <Suspense fallback={<RegisterFallback />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
