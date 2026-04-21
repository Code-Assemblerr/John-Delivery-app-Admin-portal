import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  User,
  Building2,
  Truck,
  Calendar,
  MapPin,
  Package,
  Plus,
  RotateCcw,
  Receipt,
  FileText,
  Camera,
  PenLine,
  CheckCircle2,
  Circle,
  ImageIcon,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getWorkOrderById } from "@/lib/queries/work-orders";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { calculateDistanceCharge } from "@/lib/distance";
import { StatusTransition } from "./status-transition";

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const {
    workOrder,
    items,
    addons,
    returns,
    delivery,
    invoice,
  } = await getWorkOrderById(id);

  if (!workOrder) notFound();

  const itemTotal = items.reduce(
    (sum, i) => sum + i.quantity * Number(i.price_snapshot),
    0,
  );
  const addonTotal = addons.reduce(
    (sum, a) => sum + Number(a.price_snapshot),
    0,
  );
  const returnTotalConfirmed = returns
    .filter((r) => r.confirmed)
    .reduce((sum, r) => sum + r.quantity * Number(r.return_item?.price ?? 0), 0);
  const distanceCharge = calculateDistanceCharge(
    workOrder.distance,
    workOrder.vendor?.distance_free_limit ?? 15,
    workOrder.vendor?.distance_rate ?? 2,
  );
  const computedTotal =
    itemTotal + addonTotal + returnTotalConfirmed + distanceCharge;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/work-orders"
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
            <Link href={`/admin/work-orders/${id}/edit`}>
              <Button variant="secondary">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">

        <div className="space-y-6 lg:col-span-2">

          <Card>
            <CardHeader>
              <CardTitle>Parties</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <InfoRow
                icon={User}
                label="Customer"
                value={workOrder.customer?.name ?? "—"}
                sub={workOrder.customer?.address}
              />
              <InfoRow
                icon={Building2}
                label="Vendor"
                value={workOrder.vendor?.name ?? "—"}
                sub={workOrder.vendor?.address}
              />
              <InfoRow
                icon={Truck}
                label="Driver"
                value={workOrder.driver?.name ?? "Unassigned"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <InfoRow
                icon={Calendar}
                label="Delivery Date"
                value={formatDate(workOrder.delivery_date)}
              />
              <InfoRow
                icon={MapPin}
                label="Distance"
                value={
                  workOrder.distance != null
                    ? `${Number(workOrder.distance).toFixed(1)} mi`
                    : "—"
                }
                sub={
                  workOrder.vendor && workOrder.distance != null
                    ? `Free ${workOrder.vendor.distance_free_limit} mi · ${formatCurrency(workOrder.vendor.distance_rate)}/mi over`
                    : undefined
                }
              />
              <InfoRow
                icon={FileText}
                label="Notes"
                value={workOrder.notes || "—"}
              />
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
              {items.length === 0 ? (
                <div className="p-6 text-sm text-[var(--foreground-muted)]">
                  No items
                </div>
              ) : (
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
                          {i.item?.category} · {formatCurrency(i.price_snapshot)} × {i.quantity}
                        </div>
                      </div>
                      <div className="tabular-nums text-sm font-semibold text-[var(--foreground)]">
                        {formatCurrency(i.quantity * Number(i.price_snapshot))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {addons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Driver Add-ons ({addons.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-[var(--border)]">
                  {addons.map((a: any) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between px-6 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          {a.addon?.name ?? a.custom_name ?? "Custom charge"}
                        </div>
                        <div className="text-xs text-[var(--foreground-subtle)]">
                          {a.addon?.type === "conditional" ? "Conditional" : "Fixed"}
                          {a.quantity ? ` · qty ${a.quantity}` : ""}
                        </div>
                      </div>
                      <div className="tabular-nums text-sm font-semibold text-[var(--foreground)]">
                        {formatCurrency(Number(a.price_snapshot))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                            {formatCurrency(r.return_item?.price ?? 0)} × {r.quantity}
                            {" · "}
                            {r.confirmed ? (
                              <span className="text-[var(--success)]">Confirmed</span>
                            ) : (
                              <span>Pending driver confirmation</span>
                            )}
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
                        {formatCurrency(Number(r.return_item?.price ?? 0) * r.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {delivery && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Proof</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <ProofTile
                  icon={Camera}
                  label="Delivery Photo"
                  url={delivery.photo_url}
                />
                <ProofTile
                  icon={PenLine}
                  label="Signature"
                  url={delivery.signature_url}
                />
                {delivery.completed_at && (
                  <div className="md:col-span-2 text-xs text-[var(--foreground-muted)]">
                    Completed {formatDateTime(delivery.completed_at)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTransition id={id} current={workOrder.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                {invoice ? "Invoice" : "Estimate"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Line label="Items" value={formatCurrency(itemTotal)} />
              <Line label="Add-ons" value={formatCurrency(addonTotal)} />
              <Line
                label="Returns (confirmed)"
                value={formatCurrency(returnTotalConfirmed)}
              />
              <Line label="Distance" value={formatCurrency(distanceCharge)} />
              <div className="my-2 h-px bg-[var(--border)]" />
              <Line
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
                  Invoice generated on delivery
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
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
        <div className="truncate text-sm font-medium text-[var(--foreground)]">
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

function Line({
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
          emphasize ? "font-semibold text-[var(--foreground)]" : "text-[var(--foreground-muted)]"
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

function ProofTile({
  icon: Icon,
  label,
  url,
}: {
  icon: any;
  label: string;
  url: string | null;
}) {
  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] p-8">
        <Icon className="h-6 w-6 text-[var(--foreground-subtle)]" />
        <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
          No {label.toLowerCase()}
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)]">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="group relative block aspect-video bg-[var(--panel)]"
      >

        <img
          src={url}
          alt={label}
          className="h-full w-full object-contain"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
            <ImageIcon className="h-3.5 w-3.5" />
            Open
          </span>
        </div>
      </a>
      <div className="border-t border-[var(--border)] bg-[var(--panel-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--foreground-muted)]">
        {label}
      </div>
    </div>
  );
}
