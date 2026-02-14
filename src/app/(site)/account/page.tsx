import { AccountDashboard } from "@/components/auth/account-dashboard";

export default function AccountPage() {
  return (
    <div className="mx-auto mt-32 max-w-5xl rounded-xl border border-black/5 bg-white/90 p-4 shadow-md backdrop-blur-xl md:p-8">
      <AccountDashboard />
    </div>
  );
}