import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tint = "accent",
  loading,
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive?: boolean };
  tint?: "accent" | "success" | "warning" | "info" | "danger";
  loading?: boolean;
  className?: string;
}) {
  const tints: Record<string, { bg: string; text: string }> = {
    accent: {
      bg: "bg-[var(--accent-soft)]",
      text: "text-[var(--accent)]",
    },
    success: {
      bg: "bg-[var(--success-soft)]",
      text: "text-[var(--success)]",
    },
    warning: {
      bg: "bg-[var(--warning-soft)]",
      text: "text-[var(--warning)]",
    },
    info: {
      bg: "bg-[var(--info-soft)]",
      text: "text-[var(--info)]",
    },
    danger: {
      bg: "bg-[var(--danger-soft)]",
      text: "text-[var(--danger)]",
    },
  };
  const t = tints[tint];

  return (
    <div
      className={cn(
        "glass group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:border-[var(--accent)]/30 hover:shadow-[0_8px_32px_-8px_var(--accent-glow)]",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--foreground-subtle)]">
            {label}
          </p>
          <p className="tabular-nums text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            {loading ? (
              <span className="inline-block h-8 w-20 rounded bg-[var(--panel-elevated)] shimmer" />
            ) : (
              value
            )}
          </p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.positive ? "text-[var(--success)]" : "text-[var(--danger)]",
              )}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
            t.bg,
          )}
        >
          <Icon className={cn("h-5 w-5", t.text)} />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
