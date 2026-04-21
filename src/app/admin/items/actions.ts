"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export interface ItemInput {
  name: string;
  category: string;
  price: number;
}

export async function createItem(input: ItemInput) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("items").insert(input);
  if (error) return { error: error.message };
  revalidatePath("/admin/items");
  return { ok: true };
}

export async function updateItem(id: string, input: ItemInput) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("items").update(input).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/items");
  return { ok: true };
}

export async function deleteItem(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/items");
  return { ok: true };
}
