import { RegisterForm } from "@/components/auth/register-form";

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
      <RegisterForm />
    </div>
  );
}