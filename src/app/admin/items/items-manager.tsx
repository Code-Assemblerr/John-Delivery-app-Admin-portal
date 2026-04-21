"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { Package, Plus, Edit, Trash2 } from "lucide-react";
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
import { createItem, updateItem, deleteItem } from "./actions";
import type { Item } from "@/types/database";

export function ItemsManager({ data }: { data: Item[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Item | null>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q),
    );
  }, [data, search]);

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(item: Item) {
    setEditing(item);
    setShowForm(true);
  }

  const columns: ColumnDef<Item, any>[] = [
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
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-[var(--foreground-muted)]">
          {row.original.category || "—"}
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
              openEdit(row.original);
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
            placeholder="Search items..."
          />
          <Button variant="gradient" onClick={openNew}>
            <Plus className="h-4 w-4" />
            New Item
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={openEdit}
          emptyState={
            <EmptyState
              icon={Package}
              title={search ? "No matching items" : "No items yet"}
              description={
                search ? "Try a different search." : "Add your first catalog item."
              }
              action={
                !search && (
                  <Button variant="gradient" onClick={openNew}>
                    <Plus className="h-4 w-4" />
                    New Item
                  </Button>
                )
              }
            />
          }
        />
      </div>

      <ItemDialog
        open={showForm}
        onOpenChange={setShowForm}
        initial={editing}
        onSaved={() => {
          setShowForm(false);
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete item?"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.name}" from the catalog. Existing work orders keep their price snapshots.`
            : ""
        }
        variant="danger"
        confirmText="Delete"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const res = await deleteItem(deleteTarget.id);
          if ("error" in res && res.error) {
            toast.error("Delete failed", { description: res.error });
          } else {
            toast.success("Item deleted");
            router.refresh();
          }
          setDeleteTarget(null);
        }}
      />
    </>
  );
}

function ItemDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: Item | null;
  onSaved: () => void;
}) {
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setCategory(initial?.category ?? "");
      setPrice(initial ? String(initial.price) : "");
    }
  }, [open, initial]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name required");
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) return toast.error("Valid price required");
    setSaving(true);
    const payload = { name: name.trim(), category: category.trim(), price: priceNum };
    const res = initial
      ? await updateItem(initial.id, payload)
      : await createItem(payload);
    if ("error" in res && res.error) {
      toast.error("Save failed", { description: res.error });
      setSaving(false);
      return;
    }
    toast.success(initial ? "Item updated" : "Item created");
    onSaved();
    setSaving(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Item" : "New Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Name *</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sofa — 3 Seat"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-category">Category</Label>
            <Input
              id="item-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Furniture"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-price">Price *</Label>
            <Input
              id="item-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gradient" loading={saving}>
              {initial ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
