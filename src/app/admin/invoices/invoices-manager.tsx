"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Receipt, Edit, Trash2, ExternalLink } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { updateInvoice, deleteInvoice } from "./actions";

interface InvoiceRow {
  id: string;
  work_order_id: string;
  item_total: number;
  addon_total: number;
  return_total: number;
  distance_charge: number;
  total_amount: number;
  created_at: string;
  work_order: {
    id: string;
    delivery_date: string;
    customer: { name: string } | null;
    vendor: { name: string } | null;
  } | null;
}

export function InvoicesManager({ data }: { data: InvoiceRow[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<InvoiceRow | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<InvoiceRow | null>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (inv) =>
        inv.work_order?.customer?.name?.toLowerCase().includes(q) ||
        inv.work_order?.vendor?.name?.toLowerCase().includes(q),
    );
  }, [data, search]);

  const columns: ColumnDef<InvoiceRow, any>[] = [
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="font-medium text-[var(--foreground)]">
          {row.original.work_order?.customer?.name ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
      cell: ({ row }) => (
        <div className="text-[var(--foreground-muted)]">
          {row.original.work_order?.vendor?.name ?? "—"}
        </div>
      ),
    },
    {
      accessorKey: "delivery_date",
      header: "Delivery",
      cell: ({ row }) => (
        <div className="tabular-nums text-[var(--foreground-muted)]">
          {formatDate(row.original.work_order?.delivery_date)}
        </div>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => (
        <div className="tabular-nums font-semibold text-[var(--foreground)]">
          {formatCurrency(row.original.total_amount)}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Issued",
      cell: ({ row }) => (
        <div className="text-xs text-[var(--foreground-subtle)]">
          {formatDate(row.original.created_at)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {row.original.work_order_id && (
            <Link href={`/admin/work-orders/${row.original.work_order_id}`}>
              <Button variant="ghost" size="icon-sm">
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(row.original);
            }}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row.original);
            }}
            className="text-[var(--danger)] hover:bg-[var(--danger-soft)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by customer or vendor..."
        />
        <DataTable
          columns={columns}
          data={filtered}
          emptyState={
            <EmptyState
              icon={Receipt}
              title={search ? "No matching invoices" : "No invoices yet"}
              description={
                search
                  ? "Try a different search."
                  : "Invoices are auto-generated when drivers mark orders delivered."
              }
            />
          }
        />
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {editing && (
            <InvoiceEditForm
              invoice={editing}
              onSaved={() => {
                setEditing(null);
                router.refresh();
              }}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete invoice?"
        description="This will remove the invoice permanently. The work order will remain but its total will be recalculated if regenerated."
        variant="danger"
        confirmText="Delete"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const res = await deleteInvoice(deleteTarget.id);
          if ("error" in res && res.error)
            toast.error("Failed", { description: res.error });
          else {
            toast.success("Invoice deleted");
            router.refresh();
          }
          setDeleteTarget(null);
        }}
      />
    </>
  );
}

function InvoiceEditForm({
  invoice,
  onSaved,
  onCancel,
}: {
  invoice: InvoiceRow;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [item, setItem] = React.useState(String(invoice.item_total));
  const [addon, setAddon] = React.useState(String(invoice.addon_total));
  const [ret, setRet] = React.useState(String(invoice.return_total));
  const [dist, setDist] = React.useState(String(invoice.distance_charge));
  const [saving, setSaving] = React.useState(false);

  const sum =
    (parseFloat(item) || 0) +
    (parseFloat(addon) || 0) +
    (parseFloat(ret) || 0) +
    (parseFloat(dist) || 0);

  async function save() {
    setSaving(true);
    const res = await updateInvoice(invoice.id, {
      item_total: parseFloat(item) || 0,
      addon_total: parseFloat(addon) || 0,
      return_total: parseFloat(ret) || 0,
      distance_charge: parseFloat(dist) || 0,
      total_amount: sum,
    });
    if ("error" in res && res.error) {
      toast.error("Save failed", { description: res.error });
      setSaving(false);
      return;
    }
    toast.success("Invoice updated");
    onSaved();
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <NumField label="Items" value={item} onChange={setItem} />
        <NumField label="Add-ons" value={addon} onChange={setAddon} />
        <NumField label="Returns" value={ret} onChange={setRet} />
        <NumField label="Distance" value={dist} onChange={setDist} />
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-elevated)] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--foreground-muted)]">
            Total
          </span>
          <span className="tabular-nums text-2xl font-bold text-gradient-accent">
            {formatCurrency(sum)}
          </span>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="gradient" onClick={save} loading={saving}>
          Save
        </Button>
      </DialogFooter>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
