"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function createBlockedDate(date: string, reason: string) {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("blocked_dates").insert({
    date,
    reason: reason || null,
    created_by: admin.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/blocked-dates");
  return { ok: true };
}

export async function deleteBlockedDate(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/blocked-dates");
  return { ok: true };
}
