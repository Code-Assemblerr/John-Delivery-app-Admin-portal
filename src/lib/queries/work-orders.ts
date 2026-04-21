import { createClient } from "@/lib/supabase/server";
import type {
  WorkOrderWithRelations,
  WorkOrderStatus,
  WorkOrderItem,
  WorkOrderAddon,
  WorkOrderReturn,
  Delivery,
  Invoice,
} from "@/types/database";

export interface WorkOrderFilters {
  status?: WorkOrderStatus;
  vendor_id?: string;
  customer_id?: string;
  driver_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export async function listWorkOrders(filters: WorkOrderFilters = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("work_orders")
    .select(
      "*, customer:customers(name), vendor:vendors(name, distance_free_limit, distance_rate), driver:users!work_orders_driver_id_fkey(name)",
    )
    .order("delivery_date", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.vendor_id) query = query.eq("vendor_id", filters.vendor_id);
  if (filters.customer_id) query = query.eq("customer_id", filters.customer_id);
  if (filters.driver_id) query = query.eq("driver_id", filters.driver_id);
  if (filters.date_from) query = query.gte("delivery_date", filters.date_from);
  if (filters.date_to) query = query.lte("delivery_date", filters.date_to);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as WorkOrderWithRelations[];
}

export async function getWorkOrderById(id: string) {
  const supabase = await createClient();
  const [woRes, itemsRes, addonsRes, returnsRes, deliveryRes, invoiceRes] =
    await Promise.all([
      supabase
        .from("work_orders")
        .select(
          "*, customer:customers(name, address, phone, latitude, longitude), vendor:vendors(name, address, distance_free_limit, distance_rate, latitude, longitude), driver:users!work_orders_driver_id_fkey(name, email)",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("work_order_items")
        .select("*, item:items(name, category)")
        .eq("work_order_id", id),
      supabase
        .from("work_order_addons")
        .select("*, addon:addons(name, type)")
        .eq("work_order_id", id),
      supabase
        .from("work_order_returns")
        .select("*, return_item:return_items(name, price)")
        .eq("work_order_id", id),
      supabase
        .from("deliveries")
        .select("*")
        .eq("work_order_id", id)
        .maybeSingle(),
      supabase
        .from("invoices")
        .select("*")
        .eq("work_order_id", id)
        .maybeSingle(),
    ]);

  if (woRes.error) throw woRes.error;

  return {
    workOrder: woRes.data as unknown as WorkOrderWithRelations | null,
    items: (itemsRes.data ?? []) as unknown as WorkOrderItem[],
    addons: (addonsRes.data ?? []) as unknown as WorkOrderAddon[],
    returns: (returnsRes.data ?? []) as unknown as WorkOrderReturn[],
    delivery: (deliveryRes.data ?? null) as Delivery | null,
    invoice: (invoiceRes.data ?? null) as Invoice | null,
  };
}

export async function listPickerData() {
  const supabase = await createClient();
  const [customers, vendors, items, returnItems, drivers, blockedDates] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, name, address, phone, latitude, longitude")
        .order("name"),
      supabase
        .from("vendors")
        .select("id, name, address, distance_free_limit, distance_rate, latitude, longitude")
        .order("name"),
      supabase.from("items").select("id, name, category, price").order("name"),
      supabase.from("return_items").select("id, name, price").order("name"),
      supabase
        .from("users")
        .select("id, name, email")
        .eq("role", "driver")
        .order("name"),
      supabase.from("blocked_dates").select("date"),
    ]);

  return {
    customers: customers.data ?? [],
    vendors: vendors.data ?? [],
    items: items.data ?? [],
    returnItems: returnItems.data ?? [],
    drivers: drivers.data ?? [],
    blockedDates: (blockedDates.data ?? []).map((b: any) => b.date) as string[],
  };
}
