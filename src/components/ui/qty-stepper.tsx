"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0 rounded-lg border border-[var(--border)] bg-[var(--input)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-l-lg text-[var(--foreground-muted)] transition-colors hover:bg-[var(--sidebar-item-hover)] hover:text-[var(--foreground)] disabled:opacity-40 cursor-pointer"
        aria-label="Decrease"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <div className="w-10 text-center tabular-nums text-sm font-medium text-[var(--foreground)]">
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-r-lg text-[var(--foreground-muted)] transition-colors hover:bg-[var(--sidebar-item-hover)] hover:text-[var(--foreground)] disabled:opacity-40 cursor-pointer"
        aria-label="Increase"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
