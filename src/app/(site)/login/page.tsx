import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-[32px] border border-black/5 bg-white/95 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Sign in with your WordPress account to access your dashboard.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}