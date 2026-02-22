import { Suspense } from "react";
import { LoginClient } from "./login-client";

function LoginFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-[24px] border border-black/5 bg-white/80 p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col items-center gap-4 text-sm text-[color:var(--muted)]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[color:var(--brand)]" />
          <p>Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}
