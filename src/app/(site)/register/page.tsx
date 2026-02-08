import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-[32px] border border-black/5 bg-white/95 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Register to save your favorites and manage your orders.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}