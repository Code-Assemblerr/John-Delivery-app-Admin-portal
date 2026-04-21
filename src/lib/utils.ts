import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function mergeItemLines(
  rows: { item_id: string; quantity: number; price_snapshot: number | string }[],
): { item_id: string; quantity: number; price_snapshot: number }[] {
  const map = new Map<
    string,
    { item_id: string; quantity: number; price_snapshot: number }
  >();
  for (const r of rows) {
    const existing = map.get(r.item_id);
    if (existing) {
      existing.quantity += r.quantity;
    } else {
      map.set(r.item_id, {
        item_id: r.item_id,
        quantity: r.quantity,
        price_snapshot: Number(r.price_snapshot),
      });
    }
  }
  return Array.from(map.values());
}

export function mergeReturnLines(
  rows: { return_item_id: string; quantity: number }[],
): { return_item_id: string; quantity: number }[] {
  const map = new Map<string, { return_item_id: string; quantity: number }>();
  for (const r of rows) {
    const existing = map.get(r.return_item_id);
    if (existing) {
      existing.quantity += r.quantity;
    } else {
      map.set(r.return_item_id, {
        return_item_id: r.return_item_id,
        quantity: r.quantity,
      });
    }
  }
  return Array.from(map.values());
}
