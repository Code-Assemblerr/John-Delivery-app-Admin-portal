"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const errorParam = searchParams.get("error");
  const nextPath = searchParams.get("next") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error("Sign in failed", { description: error.message });
        setSubmitting(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        const role = profile?.role as "admin" | "driver" | "vendor" | undefined;

        if (role === "driver") {
          await supabase.auth.signOut();
          toast.error("Drivers must use the mobile app");
          setSubmitting(false);
          return;
        }

        toast.success("Welcome back", {
          description: role === "admin" ? "Admin portal" : "Vendor portal",
        });

        const dest =
          nextPath && nextPath !== "/"
            ? nextPath
            : role === "admin"
              ? "/admin"
              : "/vendor";

        router.replace(dest);
        router.refresh();
      }
    } catch (err) {
      toast.error("Unexpected error", {
        description: err instanceof Error ? err.message : "Please try again",
      });
      setSubmitting(false);
    }
  }

  return (
    <Card className="relative p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Sign in
        </h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Admin & vendor access
        </p>
      </div>

      {errorParam === "driver_not_allowed" && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Drivers must use the mobile app to sign in.</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-9"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-[var(--danger)]">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="pl-9"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-[var(--danger)]">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          loading={submitting}
        >
          Sign in
        </Button>
      </form>
    </Card>
  );
}
