import { cn } from "@/lib/utils";
import type { WorkOrderStatus, UserRole } from "@/types/database";

const statusConfig: Record<
  WorkOrderStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  pending: {
    label: "Pending",
    dot: "bg-[var(--status-pending)]",
    bg: "bg-[var(--warning-soft)]",
    text: "text-[var(--status-pending)]",
  },
  shipped: {
    label: "Shipped",
    dot: "bg-[var(--status-shipped)]",
    bg: "bg-[var(--info-soft)]",
    text: "text-[var(--status-shipped)]",
  },
  delivered: {
    label: "Delivered",
    dot: "bg-[var(--status-delivered)]",
    bg: "bg-[var(--success-soft)]",
    text: "text-[var(--status-delivered)]",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: WorkOrderStatus;
  className?: string;
}) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        cfg.bg,
        cfg.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

const roleConfig: Record<UserRole, { label: string; color: string }> = {
  admin: { label: "Admin", color: "text-[var(--role-admin)]" },
  driver: { label: "Driver", color: "text-[var(--role-driver)]" },
  vendor: { label: "Vendor", color: "text-[var(--role-vendor)]" },
};

export function RoleBadge({
  role,
  className,
}: {
  role: UserRole;
  className?: string;
}) {
  const cfg = roleConfig[role];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1 text-xs font-medium",
        cfg.color,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}
