"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function aggregateMonthlyInvoices(month?: number, year?: number) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("aggregate_monthly_invoices", {
    target_month: month ?? null,
    target_year: year ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/invoices");
  revalidatePath("/vendor/invoices");
  return { count: (data as number | null) ?? 0 };
}

export interface InvoiceUpdate {
  item_total: number;
  addon_total: number;
  return_total: number;
  distance_charge: number;
  total_amount: number;
}

export async function updateInvoice(id: string, input: InvoiceUpdate) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").update(input).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/invoices");
  return { ok: true };
}

export async function deleteInvoice(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/invoices");
  return { ok: true };
}
