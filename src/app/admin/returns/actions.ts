"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export interface ReturnItemInput {
  name: string;
  price: number;
}

export async function createReturnItem(input: ReturnItemInput) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("return_items").insert(input);
  if (error) return { error: error.message };
  revalidatePath("/admin/returns");
  return { ok: true };
}

export async function updateReturnItem(id: string, input: ReturnItemInput) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("return_items").update(input).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/returns");
  return { ok: true };
}

export async function deleteReturnItem(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("return_items").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/returns");
  return { ok: true };
}
