"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { RotateCcw, Plus, Edit, Trash2 } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import {
  createReturnItem,
  updateReturnItem,
  deleteReturnItem,
} from "./actions";
import type { ReturnItem } from "@/types/database";

export function ReturnsManager({ data }: { data: ReturnItem[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<ReturnItem | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<ReturnItem | null>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((r) => r.name.toLowerCase().includes(q));
  }, [data, search]);

  const columns: ColumnDef<ReturnItem, any>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium text-[var(--foreground)]">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums font-medium text-[var(--foreground)]">
          {formatCurrency(row.original.price)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(row.original);
              setShowForm(true);
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
        <div className="flex items-center justify-between gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search returns..."
          />
          <Button
            variant="gradient"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Return
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(r) => {
            setEditing(r);
            setShowForm(true);
          }}
          emptyState={
            <EmptyState
              icon={RotateCcw}
              title={search ? "No matching returns" : "No return items yet"}
              description={
                search
                  ? "Try a different search."
                  : "Add items that drivers collect on delivery."
              }
              action={
                !search && (
                  <Button
                    variant="gradient"
                    onClick={() => {
                      setEditing(null);
                      setShowForm(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    New Return
                  </Button>
                )
              }
            />
          }
        />
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Return Item" : "New Return Item"}
            </DialogTitle>
          </DialogHeader>
          <ReturnForm
            initial={editing}
            onSaved={() => {
              setShowForm(false);
              router.refresh();
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete return item?"
        description={
          deleteTarget ? `Remove "${deleteTarget.name}" from the catalog.` : ""
        }
        variant="danger"
        confirmText="Delete"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const res = await deleteReturnItem(deleteTarget.id);
          if ("error" in res && res.error)
            toast.error("Delete failed", { description: res.error });
          else {
            toast.success("Deleted");
            router.refresh();
          }
          setDeleteTarget(null);
        }}
      />
    </>
  );
}

function ReturnForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: ReturnItem | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [price, setPrice] = React.useState(initial ? String(initial.price) : "15");
  const [saving, setSaving] = React.useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name required");
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) return toast.error("Valid price required");
    setSaving(true);
    const payload = { name: name.trim(), price: priceNum };
    const res = initial
      ? await updateReturnItem(initial.id, payload)
      : await createReturnItem(payload);
    if ("error" in res && res.error) {
      toast.error("Save failed", { description: res.error });
      setSaving(false);
      return;
    }
    toast.success(initial ? "Updated" : "Created");
    onSaved();
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="r-name">Name *</Label>
        <Input
          id="r-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Old mattress"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="r-price">Price *</Label>
        <Input
          id="r-price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="15.00"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="gradient" loading={saving}>
          {initial ? "Save" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}
