"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { UserRole } from "@/types/database";

export async function updateUserRole(id: string, role: UserRole) {
  const admin = await requireAdmin();
  if (id === admin.id && role !== "admin") {
    return { error: "You cannot remove your own admin role" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ role }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUserProfile(id: string) {
  const admin = await requireAdmin();
  if (id === admin.id) {
    return { error: "You cannot delete yourself" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { ok: true };
}
