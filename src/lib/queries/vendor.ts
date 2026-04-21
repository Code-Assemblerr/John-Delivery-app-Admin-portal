import { createClient } from "@/lib/supabase/server";

export async function getVendorForUser(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vendors")
    .select("id, name, address, distance_free_limit, distance_rate, latitude, longitude, user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function listVendorWorkOrders(vendorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("work_orders")
    .select(
      "*, customer:customers(name), vendor:vendors(name, distance_free_limit, distance_rate), driver:users!work_orders_driver_id_fkey(name)",
    )
    .eq("vendor_id", vendorId)
    .order("delivery_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listVendorPickerData(vendorId: string) {
  const supabase = await createClient();
  const [customers, items, returnItems, drivers, blockedDates, vendor] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, name, address, phone, latitude, longitude")
        .order("name"),
      supabase.from("items").select("id, name, category, price").order("name"),
      supabase.from("return_items").select("id, name, price").order("name"),
      supabase
        .from("users")
        .select("id, name, email")
        .eq("role", "driver")
        .order("name"),
      supabase.from("blocked_dates").select("date"),
      supabase
        .from("vendors")
        .select("*")
        .eq("id", vendorId)
        .maybeSingle(),
    ]);

  return {
    customers: customers.data ?? [],
    items: items.data ?? [],
    returnItems: returnItems.data ?? [],
    drivers: drivers.data ?? [],
    blockedDates: (blockedDates.data ?? []).map((b: any) => b.date) as string[],
    vendor: vendor.data,
  };
}
