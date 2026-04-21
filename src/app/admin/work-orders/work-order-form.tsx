"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, MapPin, Calculator, Package, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  formatCurrency,
  toIsoDate,
  cn,
} from "@/lib/utils";
import {
  calculateHaversineDistance,
  calculateDistanceCharge,
} from "@/lib/distance";
import { createWorkOrder, updateWorkOrder, deleteWorkOrder } from "./actions";
import type {
  WorkOrderInput,
} from "./actions";

interface PickerData {
  customers: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    latitude: number | null;
    longitude: number | null;
  }[];
  vendors: {
    id: string;
    name: string;
    address: string;
    distance_free_limit: number;
    distance_rate: number;
    latitude: number | null;
    longitude: number | null;
  }[];
  items: { id: string; name: string; category: string; price: number }[];
  returnItems: { id: string; name: string; price: number }[];
  drivers: { id: string; name: string; email: string }[];
  blockedDates: string[];
}

interface InitialData {
  id: string;
  customer_id: string;
  vendor_id: string;
  driver_id: string | null;
  delivery_date: string;
  notes: string;
  distance: number | null;
  items: { item_id: string; quantity: number; price_snapshot: number }[];
  returns: { return_item_id: string; quantity: number }[];
}

type ItemLine = {
  item_id: string;
  quantity: number;
  price_snapshot: number;
};

type ReturnLine = {
  return_item_id: string;
  quantity: number;
};

export function WorkOrderForm({
  pickers,
  initial,
  backHref = "/admin/work-orders",
}: {
  pickers: PickerData;
  initial?: InitialData;
  backHref?: string;
}) {
  const router = useRouter();

  const [customerId, setCustomerId] = React.useState(initial?.customer_id ?? "");
  const [vendorId, setVendorId] = React.useState(initial?.vendor_id ?? "");
  const [driverId, setDriverId] = React.useState<string | null>(
    initial?.driver_id ?? null,
  );
  const [deliveryDate, setDeliveryDate] = React.useState(
    initial?.delivery_date ?? toIsoDate(new Date()),
  );
  const [notes, setNotes] = React.useState(initial?.notes ?? "");
  const [distance, setDistance] = React.useState<string>(
    initial?.distance != null ? String(initial.distance) : "",
  );
  const [items, setItems] = React.useState<ItemLine[]>(initial?.items ?? []);
  const [returns, setReturns] = React.useState<ReturnLine[]>(
    initial?.returns ?? [],
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);

  const customer = pickers.customers.find((c) => c.id === customerId);
  const vendor = pickers.vendors.find((v) => v.id === vendorId);

  React.useEffect(() => {
    if (distance) return;
    if (
      customer?.latitude != null &&
      customer?.longitude != null &&
      vendor?.latitude != null &&
      vendor?.longitude != null
    ) {
      const d = calculateHaversineDistance(
        vendor.latitude,
        vendor.longitude,
        customer.latitude,
        customer.longitude,
      );
      setDistance(d.toFixed(2));
    }
  }, [customer, vendor, distance]);

  const itemTotal = items.reduce(
    (sum, i) => sum + i.quantity * i.price_snapshot,
    0,
  );
  const returnTotal = returns.reduce((sum, r) => {
    const ri = pickers.returnItems.find((x) => x.id === r.return_item_id);
    return sum + (ri ? r.quantity * ri.price : 0);
  }, 0);
  const distanceCharge = calculateDistanceCharge(
    distance ? parseFloat(distance) : null,
    vendor?.distance_free_limit ?? 15,
    vendor?.distance_rate ?? 2,
  );
  const total = itemTotal + returnTotal + distanceCharge;

  const isDateBlocked = pickers.blockedDates.includes(deliveryDate);

  function addItem(itemId: string) {
    const item = pickers.items.find((i) => i.id === itemId);
    if (!item) return;
    if (items.find((i) => i.item_id === itemId)) {
      toast.error("Item already added");
      return;
    }
    setItems([...items, { item_id: itemId, quantity: 1, price_snapshot: item.price }]);
  }

  function updateItemQty(itemId: string, qty: number) {
    setItems(items.map((i) => (i.item_id === itemId ? { ...i, quantity: qty } : i)));
  }

  function removeItem(itemId: string) {
    setItems(items.filter((i) => i.item_id !== itemId));
  }

  function addReturn(returnId: string) {
    if (returns.find((r) => r.return_item_id === returnId)) {
      toast.error("Return item already added");
      return;
    }
    setReturns([...returns, { return_item_id: returnId, quantity: 1 }]);
  }

  function updateReturnQty(returnId: string, qty: number) {
    setReturns(
      returns.map((r) =>
        r.return_item_id === returnId ? { ...r, quantity: qty } : r,
      ),
    );
  }

  function removeReturn(returnId: string) {
    setReturns(returns.filter((r) => r.return_item_id !== returnId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!customerId) return toast.error("Please select a customer");
    if (!vendorId) return toast.error("Please select a vendor");
    if (!deliveryDate) return toast.error("Please pick a delivery date");
    if (isDateBlocked)
      return toast.error("The selected date is blocked for deliveries");
    if (items.length === 0) return toast.error("Add at least one item");

    const payload: WorkOrderInput = {
      customer_id: customerId,
      vendor_id: vendorId,
      driver_id: driverId,
      delivery_date: deliveryDate,
      notes,
      distance: distance ? parseFloat(distance) : null,
      items,
      returns,
    };

    setSubmitting(true);
    const result = initial
      ? await updateWorkOrder(initial.id, payload)
      : await createWorkOrder(payload);

    if ("error" in result && result.error) {
      toast.error(initial ? "Update failed" : "Create failed", {
        description: result.error,
      });
      setSubmitting(false);
      return;
    }

    toast.success(initial ? "Work order updated" : "Work order created");
    const id = "id" in result ? result.id : initial?.id;
    router.push(id ? `/admin/work-orders/${id}` : "/admin/work-orders");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    setDeleting(true);
    const result = await deleteWorkOrder(initial.id);
    if ("error" in result && result.error) {
      toast.error("Delete failed", { description: result.error });
      setDeleting(false);
      return;
    }
    toast.success("Work order deleted");
    router.push("/admin/work-orders");
    router.refresh();
  }

  const customerOpts = pickers.customers.map((c) => ({
    value: c.id,
    label: c.name,
    description: c.address,
  }));
  const vendorOpts = pickers.vendors.map((v) => ({
    value: v.id,
    label: v.name,
    description: v.address,
  }));
  const driverOpts = [
    { value: "", label: "Unassigned" },
    ...pickers.drivers.map((d) => ({
      value: d.id,
      label: d.name,
      description: d.email,
    })),
  ];
  const itemOpts = pickers.items.map((i) => ({
    value: i.id,
    label: i.name,
    description: `${i.category} · ${formatCurrency(i.price)}`,
  }));
  const returnOpts = pickers.returnItems.map((r) => ({
    value: r.id,
    label: r.name,
    description: formatCurrency(r.price),
  }));

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">

        <Card>
          <CardHeader>
            <CardTitle>Order Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer *</Label>
                <Combobox
                  options={customerOpts}
                  value={customerId}
                  onChange={setCustomerId}
                  placeholder="Select customer"
                />
                {customer?.phone && (
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    📞 {customer.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Vendor *</Label>
                <Combobox
                  options={vendorOpts}
                  value={vendorId}
                  onChange={setVendorId}
                  placeholder="Select vendor"
                />
                {vendor && (
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    Free {vendor.distance_free_limit} mi · {formatCurrency(vendor.distance_rate)}/mi over
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Driver</Label>
                <Combobox
                  options={driverOpts}
                  value={driverId ?? ""}
                  onChange={(v) => setDriverId(v || null)}
                  placeholder="Unassigned"
                />
              </div>
              <div className="space-y-2">
                <Label>Delivery Date *</Label>
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className={cn(
                    isDateBlocked && "border-[var(--danger)]",
                  )}
                />
                {isDateBlocked && (
                  <p className="text-xs text-[var(--danger)]">
                    This date is blocked for deliveries
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Distance (miles)
              </Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder={
                  customer?.latitude && vendor?.latitude
                    ? "Auto-calculated from coordinates"
                    : "Enter distance manually"
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions, gate code, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Add item</Label>
              <Combobox
                options={itemOpts}
                value=""
                onChange={addItem}
                placeholder="Search catalog..."
              />
            </div>

            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center">
                <p className="text-sm text-[var(--foreground-muted)]">
                  No items added yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((line) => {
                  const item = pickers.items.find((i) => i.id === line.item_id);
                  return (
                    <div
                      key={line.item_id}
                      className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-sm text-[var(--foreground)]">
                          {item?.name ?? "Unknown item"}
                        </div>
                        <div className="text-xs text-[var(--foreground-subtle)]">
                          {formatCurrency(line.price_snapshot)} each
                        </div>
                      </div>
                      <QtyStepper
                        value={line.quantity}
                        onChange={(q) => updateItemQty(line.item_id, q)}
                      />
                      <div className="w-20 text-right tabular-nums text-sm font-semibold text-[var(--foreground)]">
                        {formatCurrency(line.quantity * line.price_snapshot)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(line.item_id)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground-subtle)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] cursor-pointer"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Returns ({returns.length})
            </CardTitle>
            <p className="text-sm text-[var(--foreground-muted)]">
              Items to collect from customer — driver confirms at delivery.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Add return item</Label>
              <Combobox
                options={returnOpts}
                value=""
                onChange={addReturn}
                placeholder="Select return item..."
              />
            </div>

            {returns.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center">
                <p className="text-xs text-[var(--foreground-muted)]">
                  No returns scheduled
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {returns.map((line) => {
                  const ri = pickers.returnItems.find(
                    (r) => r.id === line.return_item_id,
                  );
                  return (
                    <div
                      key={line.return_item_id}
                      className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-sm text-[var(--foreground)]">
                          {ri?.name ?? "Unknown"}
                        </div>
                        <div className="text-xs text-[var(--foreground-subtle)]">
                          {formatCurrency(ri?.price ?? 0)} each
                        </div>
                      </div>
                      <QtyStepper
                        value={line.quantity}
                        onChange={(q) => updateReturnQty(line.return_item_id, q)}
                      />
                      <div className="w-20 text-right tabular-nums text-sm font-semibold text-[var(--foreground)]">
                        {formatCurrency((ri?.price ?? 0) * line.quantity)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReturn(line.return_item_id)}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground-subtle)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] cursor-pointer"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Pricing Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="Items" value={formatCurrency(itemTotal)} />
            <Row
              label="Returns (if confirmed)"
              value={formatCurrency(returnTotal)}
              muted
            />
            <Row
              label={`Distance${distance ? ` (${distance} mi)` : ""}`}
              value={formatCurrency(distanceCharge)}
            />
            <div className="my-2 h-px bg-[var(--border)]" />
            <Row
              label="Estimated Total"
              value={formatCurrency(total)}
              emphasize
            />
            <p className="pt-2 text-xs text-[var(--foreground-subtle)]">
              Final invoice generated when driver marks delivered. Add-ons
              applied by driver are not included here.
            </p>

            <div className="flex flex-col gap-2 pt-4">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                loading={submitting}
              >
                {initial ? "Save Changes" : "Create Work Order"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(backHref)}
              >
                Cancel
              </Button>
              {initial && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowDelete(true)}
                  className="text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Order
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {initial && (
        <ConfirmDialog
          open={showDelete}
          onOpenChange={setShowDelete}
          title="Delete work order?"
          description="This will permanently remove the order and all its items, returns, delivery records, and invoice. This cannot be undone."
          variant="danger"
          confirmText="Delete"
          loading={deleting}
          onConfirm={handleDelete}
        />
      )}
    </form>
  );
}

function Row({
  label,
  value,
  emphasize,
  muted,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          "text-sm",
          muted ? "text-[var(--foreground-subtle)]" : "text-[var(--foreground-muted)]",
          emphasize && "text-base font-semibold text-[var(--foreground)]",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums text-sm font-medium text-[var(--foreground)]",
          emphasize && "text-xl font-bold text-gradient-accent",
        )}
      >
        {value}
      </span>
    </div>
  );
}
