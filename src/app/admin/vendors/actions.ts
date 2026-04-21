"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { geocodeAddress } from "@/lib/distance";

export interface VendorInput {
  name: string;
  address: string;
  distance_free_limit: number;
  distance_rate: number;
  user_id: string | null;
}

export async function createVendor(input: VendorInput) {
  await requireAdmin();
  const supabase = await createClient();
  const geo = await geocodeAddress(input.address);

  const { data, error } = await supabase
    .from("vendors")
    .insert({
      name: input.name,
      address: input.address,
      distance_free_limit: input.distance_free_limit,
      distance_rate: input.distance_rate,
      user_id: input.user_id,
      latitude: geo.latitude,
      longitude: geo.longitude,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/vendors");
  return { id: data.id };
}

export async function updateVendor(id: string, input: VendorInput) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("vendors")
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
    .from("vendors")
    .update({
      name: input.name,
      address: input.address,
      distance_free_limit: input.distance_free_limit,
      distance_rate: input.distance_rate,
      user_id: input.user_id,
      latitude,
      longitude,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${id}`);
  return { ok: true };
}

export async function deleteVendor(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("vendors").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/vendors");
  return { ok: true };
}
