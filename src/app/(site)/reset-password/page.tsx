import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center px-4">
          <div className="w-full max-w-lg space-y-6 rounded-[16px] border border-black/5 bg-white/95 p-8">
            <div className="flex min-h-[160px] items-center justify-center text-sm text-[color:var(--muted)]">
              Loading...
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
