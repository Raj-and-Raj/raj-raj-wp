"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [login, setLogin] = useState("");
  const [key, setKey] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const nextLogin =
      searchParams.get("login") || searchParams.get("rp_login") || "";
    const nextKey = searchParams.get("key") || searchParams.get("rp_key") || "";
    setLogin(nextLogin);
    setKey(nextKey);
    setReady(true);
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!login || !key) {
      toast({
        variant: "destructive",
        title: "Invalid reset link",
        description: "The reset link is missing required parameters.",
      });
      return;
    }
    if (!password || password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Use at least 6 characters.",
      });
      return;
    }
    if (password !== confirm) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please confirm the same password.",
      });
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, key, password }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: data?.error || "Unable to reset password.",
      });
      return;
    }

    toast({
      variant: "success",
      title: "Password updated",
      description: "You can now sign in with your new password.",
    });
    router.replace("/login");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6 rounded-[16px] border border-black/5 bg-white/95 p-8">
        <div>
          <h1 className="text-2xl font-semibold">Reset your password</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Enter a new password for your account.
          </p>
        </div>
        {!ready ? (
          <div className="flex min-h-[120px] items-center justify-center text-sm text-[color:var(--muted)]">
            Loading...
          </div>
        ) : !login || !key ? (
          <div className="rounded-[12px] border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            This reset link is invalid or has expired.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="********"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </Button>
            <div className="text-right">
              <a
                href="/login"
                className="text-xs font-semibold text-[color:var(--brand)]"
              >
                Back to login
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
