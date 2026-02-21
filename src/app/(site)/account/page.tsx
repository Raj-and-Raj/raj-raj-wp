import { AccountDashboard } from "@/components/auth/account-dashboard";

export default function AccountPage() {
  return (
    <div className="mx-auto mt-32 max-w-5xl mb-12 rounded-xl border border-black/5 bg-white/90 p-4 shadow-sm backdrop-blur-xl md:p-8">
      <AccountDashboard />
    </div>
  );
}
