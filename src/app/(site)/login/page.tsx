import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { ResetPasswordForm } from "@/components/auth/reset-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-[16px] border border-black/5 bg-white/95 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Account access</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Sign in, create an account, or reset your password.
        </p>
      </div>
      <Tabs defaultValue="login" className="w-full">
        <TabsList>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="reset">Forgot</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm />
        </TabsContent>
        <TabsContent value="reset">
          <ResetPasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
