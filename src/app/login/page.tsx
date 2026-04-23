import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Package2 } from "lucide-react";

export const metadata = {
  title: "Sign in — Delivery Admin",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_30%,transparent_80%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-[0_8px_32px_-4px_var(--accent-glow)]">
              <Package2 className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">
              Delivery
            </h1>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Operations control center
            </p>
          </div>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <p className="mt-8 text-center text-xs text-[var(--foreground-subtle)]">
            Drivers — please use the mobile app to sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
