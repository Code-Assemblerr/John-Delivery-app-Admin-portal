export type UserRole = "admin" | "driver" | "vendor";
export type WorkOrderStatus = "pending" | "shipped" | "delivered";
export type AddonType = "fixed" | "conditional";

export interface AddonRule {
  min: number;
  max: number | null;
  price: number;
  label: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Vendor {
  id: string;
  name: string;
  address: string;
  distance_free_limit: number;
  distance_rate: number;
  latitude: number | null;
  longitude: number | null;
  user_id: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  price: number;
  created_at: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  type: AddonType;
  rules: AddonRule[] | null;
  created_at: string;
}

export interface ReturnItem {
  id: string;
  name: string;
  price: number;
  created_at: string;
}

export interface WorkOrder {
  id: string;
  customer_id: string;
  vendor_id: string;
  driver_id: string | null;
  delivery_date: string;
  status: WorkOrderStatus;
  notes: string;
  distance: number | null;
  created_by: string;
  created_at: string;
}

export interface WorkOrderWithRelations extends WorkOrder {
  customer: { name: string; address?: string; phone?: string } | null;
  vendor: {
    name: string;
    address?: string;
    distance_free_limit: number;
    distance_rate: number;
  } | null;
  driver: { name: string } | null;
}

export interface WorkOrderItem {
  id: string;
  work_order_id: string;
  item_id: string;
  quantity: number;
  price_snapshot: number;
  item?: { name: string; category: string };
}

export interface WorkOrderAddon {
  id: string;
  work_order_id: string;
  addon_id: string | null;
  custom_name: string | null;
  price_snapshot: number;
  quantity: number | null;
  added_by: string;
  addon?: { name: string; type: AddonType } | null;
}

export interface WorkOrderReturn {
  id: string;
  work_order_id: string;
  return_item_id: string;
  quantity: number;
  confirmed: boolean;
  return_item?: { name: string; price: number };
}

export interface Delivery {
  id: string;
  work_order_id: string;
  photo_url: string | null;
  signature_url: string | null;
  completed_at: string | null;
}

export interface Invoice {
  id: string;
  work_order_id: string;
  item_total: number;
  addon_total: number;
  return_total: number;
  distance_charge: number;
  total_amount: number;
  created_at: string;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

export interface VendorMonthlyInvoice {
  id: string;
  vendor_id: string;
  month: number;
  year: number;
  total_amount: number;
  created_at: string;
}
