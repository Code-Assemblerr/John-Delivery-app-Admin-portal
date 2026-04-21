"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { AddonRule, AddonType } from "@/types/database";

export interface AddonInput {
  name: string;
  type: AddonType;
  price: number;
  rules: AddonRule[] | null;
}

export async function createAddon(input: AddonInput) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("addons").insert({
    name: input.name,
    type: input.type,
    price: input.type === "fixed" ? input.price : 0,
    rules: input.type === "conditional" ? input.rules : null,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/addons");
  return { ok: true };
}

export async function updateAddon(id: string, input: AddonInput) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("addons")
    .update({
      name: input.name,
      type: input.type,
      price: input.type === "fixed" ? input.price : 0,
      rules: input.type === "conditional" ? input.rules : null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/addons");
  return { ok: true };
}

export async function deleteAddon(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("addons").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/addons");
  return { ok: true };
}
