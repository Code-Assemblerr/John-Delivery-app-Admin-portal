"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { geocodeAddress } from "@/lib/distance";

export interface CustomerInput {
  name: string;
  address: string;
  phone: string;
}

export async function createCustomer(input: CustomerInput) {
  await requireAdmin();
  const supabase = await createClient();

  const geo = await geocodeAddress(input.address);

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: input.name,
      address: input.address,
      phone: input.phone,
      latitude: geo.latitude,
      longitude: geo.longitude,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/customers");
  return { id: data.id };
}

export async function updateCustomer(id: string, input: CustomerInput) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("customers")
    .select("address, latitude, longitude")
    .eq("id", id)
    .maybeSingle();

  let latitude = existing?.latitude ?? null;
  let longitude = existing?.longitude ?? null;
  if (!existing || existing.address !== input.address) {
    const geo = await geocodeAddress(input.address);
    latitude = geo.latitude;
    longitude = geo.longitude;
  }

  const { error } = await supabase
    .from("customers")
    .update({
      name: input.name,
      address: input.address,
      phone: input.phone,
      latitude,
      longitude,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  return { ok: true };
}

export async function deleteCustomer(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/customers");
  return { ok: true };
}
