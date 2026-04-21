import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  User,
  Truck,
  Calendar,
  MapPin,
  Package,
  RotateCcw,
  Receipt,
  FileText,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { requireVendor } from "@/lib/auth";
import { getVendorForUser } from "@/lib/queries/vendor";
import { getWorkOrderById } from "@/lib/queries/work-orders";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculateDistanceCharge } from "@/lib/distance";

export default async function VendorWorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);
  if (!vendor) redirect("/vendor");

  const { id } = await params;
  const { workOrder, items, addons, returns, invoice } =
    await getWorkOrderById(id);

  if (!workOrder) notFound();

  if (workOrder.vendor_id !== vendor.id) redirect("/vendor/work-orders");

  const itemTotal = items.reduce(
    (sum, i) => sum + i.quantity * Number(i.price_snapshot),
    0,
  );
  const addonTotal = addons.reduce(
    (sum, a) => sum + Number(a.price_snapshot),
    0,
  );
  const returnTotal = returns
    .filter((r) => r.confirmed)
    .reduce((sum, r) => sum + r.quantity * Number(r.return_item?.price ?? 0), 0);
  const distanceCharge = calculateDistanceCharge(
    workOrder.distance,
    workOrder.vendor?.distance_free_limit ?? 15,
    workOrder.vendor?.distance_rate ?? 2,
  );
  const computedTotal = itemTotal + addonTotal + returnTotal + distanceCharge;

  const canEdit = workOrder.status === "pending";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/vendor/work-orders"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Work Orders
        </Link>
      </div>

      <PageHeader
        title={workOrder.customer?.name ?? "Work Order"}
        description={`Order #${id.slice(0, 8)} · Created ${formatDate(workOrder.created_at)}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={workOrder.status} />
            {canEdit && (
              <Link href={`/vendor/work-orders/${id}/edit`}>
                <Button variant="secondary">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Delivery</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Row
                icon={User}
                label="Customer"
                value={workOrder.customer?.name ?? "—"}
                sub={workOrder.customer?.address}
              />
              <Row
                icon={Truck}
                label="Driver"
                value={workOrder.driver?.name ?? "Unassigned"}
              />
              <Row
                icon={Calendar}
                label="Delivery Date"
                value={formatDate(workOrder.delivery_date)}
              />
              <Row
                icon={MapPin}
                label="Distance"
                value={
                  workOrder.distance != null
                    ? `${Number(workOrder.distance).toFixed(1)} mi`
                    : "—"
                }
              />
              {workOrder.notes && (
                <div className="md:col-span-2">
                  <Row
                    icon={FileText}
                    label="Notes"
                    value={workOrder.notes}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {items.map((i: any) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between px-6 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-[var(--foreground)]">
                        {i.item?.name ?? "—"}
                      </div>
                      <div className="text-xs text-[var(--foreground-subtle)]">
                        {formatCurrency(i.price_snapshot)} × {i.quantity}
                      </div>
                    </div>
                    <div className="tabular-nums text-sm font-semibold text-[var(--foreground)]">
                      {formatCurrency(i.quantity * Number(i.price_snapshot))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {returns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Returns ({returns.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-[var(--border)]">
                  {returns.map((r: any) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between px-6 py-3"
                    >
                      <div className="flex items-center gap-3">
                        {r.confirmed ? (
                          <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                        ) : (
                          <Circle className="h-4 w-4 text-[var(--foreground-subtle)]" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-[var(--foreground)]">
                            {r.return_item?.name ?? "—"}
                          </div>
                          <div className="text-xs text-[var(--foreground-subtle)]">
                            {r.confirmed ? "Confirmed" : "Pending"}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`tabular-nums text-sm font-semibold ${
                          r.confirmed
                            ? "text-[var(--foreground)]"
                            : "text-[var(--foreground-subtle)] line-through"
                        }`}
                      >
                        {formatCurrency(
                          Number(r.return_item?.price ?? 0) * r.quantity,
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                {invoice ? "Invoice" : "Estimate"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <LineItem label="Items" value={formatCurrency(itemTotal)} />
              <LineItem label="Add-ons" value={formatCurrency(addonTotal)} />
              <LineItem
                label="Returns"
                value={formatCurrency(returnTotal)}
              />
              <LineItem
                label="Distance"
                value={formatCurrency(distanceCharge)}
              />
              <div className="my-2 h-px bg-[var(--border)]" />
              <LineItem
                label="Total"
                value={formatCurrency(invoice?.total_amount ?? computedTotal)}
                emphasize
              />
              {invoice ? (
                <Badge variant="success" className="w-fit">
                  Invoiced {formatDate(invoice.created_at)}
                </Badge>
              ) : (
                <Badge variant="secondary" className="w-fit">
                  Generated on delivery
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--accent-soft)]">
        <Icon className="h-4 w-4 text-[var(--accent)]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-subtle)]">
          {label}
        </div>
        <div className="text-sm font-medium text-[var(--foreground)]">
          {value}
        </div>
        {sub && (
          <div className="truncate text-xs text-[var(--foreground-subtle)]">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function LineItem({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-sm ${
          emphasize
            ? "font-semibold text-[var(--foreground)]"
            : "text-[var(--foreground-muted)]"
        }`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums ${
          emphasize
            ? "text-xl font-bold text-gradient-accent"
            : "text-sm font-medium text-[var(--foreground)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
