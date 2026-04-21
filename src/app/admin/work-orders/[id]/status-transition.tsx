"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check, Clock, Truck, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { updateWorkOrderStatus } from "../actions";
import type { WorkOrderStatus } from "@/types/database";

const stages: { value: WorkOrderStatus; label: string; icon: any }[] = [
  { value: "pending", label: "Pending", icon: Clock },
  { value: "shipped", label: "In Transit", icon: Truck },
  { value: "delivered", label: "Delivered", icon: PackageCheck },
];

export function StatusTransition({
  id,
  current,
}: {
  id: string;
  current: WorkOrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState<WorkOrderStatus | null>(null);

  const currentIndex = stages.findIndex((s) => s.value === current);

  async function setStatus(status: WorkOrderStatus) {
    setLoading(status);
    const res = await updateWorkOrderStatus(id, status);
    if ("error" in res && res.error) {
      toast.error("Update failed", { description: res.error });
    } else {
      toast.success(`Status updated to ${status}`);
      router.refresh();
    }
    setLoading(null);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {stages.map((s, idx) => {
          const Icon = s.icon;
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={s.value}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isCurrent && "bg-[var(--accent-soft)]",
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors",
                  isDone
                    ? "border-[var(--success)] bg-[var(--success)] text-white"
                    : isCurrent
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : "border-[var(--border-strong)] text-[var(--foreground-subtle)]",
                )}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm",
                  isCurrent
                    ? "font-semibold text-[var(--foreground)]"
                    : isDone
                      ? "text-[var(--foreground-muted)]"
                      : "text-[var(--foreground-subtle)]",
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {stages
          .filter((s) => s.value !== current)
          .map((s) => (
            <Button
              key={s.value}
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setStatus(s.value)}
              loading={loading === s.value}
              disabled={loading !== null}
            >
              Change to {s.label}
            </Button>
          ))}
      </div>
    </div>
  );
}
