"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { WorkOrderStatus } from "@/types/database";

export interface WorkOrderInput {
  customer_id: string;
  vendor_id: string;
  driver_id: string | null;
  delivery_date: string;
  notes: string;
  distance: number | null;
  items: { item_id: string; quantity: number; price_snapshot: number }[];
  returns: { return_item_id: string; quantity: number }[];
}

export async function createWorkOrder(input: WorkOrderInput) {
  const user = await requireAdmin();
  const supabase = await createClient();

  const { data: wo, error } = await supabase
    .from("work_orders")
    .insert({
      customer_id: input.customer_id,
      vendor_id: input.vendor_id,
      driver_id: input.driver_id,
      delivery_date: input.delivery_date,
      notes: input.notes,
      distance: input.distance,
      created_by: user.id,
      status: "pending" as WorkOrderStatus,
    })
    .select()
    .single();

  if (error || !wo) {
    return { error: error?.message ?? "Failed to create work order" };
  }

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

  revalidatePath("/admin/work-orders");
  revalidatePath("/admin");
  return { id: wo.id };
}

export async function updateWorkOrder(id: string, input: WorkOrderInput) {
  await requireAdmin();
  const supabase = await createClient();

  const { error: woErr } = await supabase
    .from("work_orders")
    .update({
      customer_id: input.customer_id,
      vendor_id: input.vendor_id,
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

  revalidatePath("/admin/work-orders");
  revalidatePath(`/admin/work-orders/${id}`);
  revalidatePath("/admin");
  return { id };
}

export async function deleteWorkOrder(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("work_orders").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/work-orders");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateWorkOrderStatus(
  id: string,
  status: WorkOrderStatus,
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("work_orders")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/work-orders/${id}`);
  revalidatePath("/admin/work-orders");
  return { ok: true };
}
