"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireVendor } from "@/lib/auth";
import { getVendorForUser } from "@/lib/queries/vendor";
import type { WorkOrderStatus } from "@/types/database";

export interface VendorWorkOrderInput {
  customer_id: string;
  driver_id: string | null;
  delivery_date: string;
  notes: string;
  distance: number | null;
  items: { item_id: string; quantity: number; price_snapshot: number }[];
  returns: { return_item_id: string; quantity: number }[];
}

export async function createVendorWorkOrder(input: VendorWorkOrderInput) {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);
  if (!vendor) return { error: "Vendor profile not linked" };

  const supabase = await createClient();

  const { data: wo, error } = await supabase
    .from("work_orders")
    .insert({
      customer_id: input.customer_id,
      vendor_id: vendor.id,
      driver_id: input.driver_id,
      delivery_date: input.delivery_date,
      notes: input.notes,
      distance: input.distance,
      created_by: user.id,
      status: "pending" as WorkOrderStatus,
    })
    .select()
    .single();

  if (error || !wo) return { error: error?.message ?? "Create failed" };

  if (input.items.length > 0) {
    const { error: itemErr } = await supabase.from("work_order_items").insert(
      input.items.map((i) => ({
        work_order_id: wo.id,
        item_id: i.item_id,
        quantity: i.quantity,
        price_snapshot: i.price_snapshot,
      })),
    );
    if (itemErr) {
      await supabase.from("work_orders").delete().eq("id", wo.id);
      return { error: itemErr.message };
    }
  }

  if (input.returns.length > 0) {
    const { error: retErr } = await supabase.from("work_order_returns").insert(
      input.returns.map((r) => ({
        work_order_id: wo.id,
        return_item_id: r.return_item_id,
        quantity: r.quantity,
        confirmed: false,
      })),
    );
    if (retErr) {
      await supabase.from("work_order_items").delete().eq("work_order_id", wo.id);
      await supabase.from("work_orders").delete().eq("id", wo.id);
      return { error: retErr.message };
    }
  }

  revalidatePath("/vendor/work-orders");
  revalidatePath("/vendor");
  return { id: wo.id };
}

export async function updateVendorWorkOrder(
  id: string,
  input: VendorWorkOrderInput,
) {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);
  if (!vendor) return { error: "Vendor profile not linked" };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("work_orders")
    .select("vendor_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!existing || existing.vendor_id !== vendor.id) {
    return { error: "Order not found" };
  }

  if (existing.status !== "pending") {
    return { error: "Cannot edit orders that are already shipped or delivered" };
  }

  const { error: woErr } = await supabase
    .from("work_orders")
    .update({
      customer_id: input.customer_id,
      driver_id: input.driver_id,
      delivery_date: input.delivery_date,
      notes: input.notes,
      distance: input.distance,
    })
    .eq("id", id);

  if (woErr) return { error: woErr.message };

  await supabase.from("work_order_items").delete().eq("work_order_id", id);
  if (input.items.length > 0) {
    const { error: itemErr } = await supabase.from("work_order_items").insert(
      input.items.map((i) => ({
        work_order_id: id,
        item_id: i.item_id,
        quantity: i.quantity,
        price_snapshot: i.price_snapshot,
      })),
    );
    if (itemErr) return { error: itemErr.message };
  }

  await supabase.from("work_order_returns").delete().eq("work_order_id", id);
  if (input.returns.length > 0) {
    const { error: retErr } = await supabase.from("work_order_returns").insert(
      input.returns.map((r) => ({
        work_order_id: id,
        return_item_id: r.return_item_id,
        quantity: r.quantity,
        confirmed: false,
      })),
    );
    if (retErr) return { error: retErr.message };
  }

  revalidatePath("/vendor/work-orders");
  revalidatePath(`/vendor/work-orders/${id}`);
  return { id };
}

export async function deleteVendorWorkOrder(id: string) {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);
  if (!vendor) return { error: "Vendor profile not linked" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("work_orders")
    .select("vendor_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!existing || existing.vendor_id !== vendor.id) {
    return { error: "Order not found" };
  }
  if (existing.status !== "pending") {
    return { error: "Cannot delete orders that are already shipped or delivered" };
  }

  const { error } = await supabase.from("work_orders").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/vendor/work-orders");
  return { ok: true };
}
