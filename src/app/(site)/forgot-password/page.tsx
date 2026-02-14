import { ResetPasswordForm } from "@/components/auth/reset-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6 rounded-[16px] border border-black/5 bg-white/95 p-8">
        <div>
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Enter your email to receive a reset link.
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
