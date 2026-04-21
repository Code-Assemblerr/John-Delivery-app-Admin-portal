"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Zap, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency, cn } from "@/lib/utils";
import { createAddon, updateAddon, deleteAddon } from "./actions";
import type { Addon, AddonRule, AddonType } from "@/types/database";

export function AddonsManager({ data }: { data: Addon[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<Addon | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Addon | null>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((a) => a.name.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search add-ons..."
          />
          <Button
            variant="gradient"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Add-on
          </Button>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={Plus}
                title={search ? "No matching add-ons" : "No add-ons yet"}
                description={
                  search
                    ? "Try a different search."
                    : "Create fixed or conditional add-on charges drivers can apply."
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
                      New Add-on
                    </Button>
                  )
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <AddonCard
                key={a.id}
                addon={a}
                onEdit={() => {
                  setEditing(a);
                  setShowForm(true);
                }}
                onDelete={() => setDeleteTarget(a)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Add-on" : "New Add-on"}
            </DialogTitle>
          </DialogHeader>
          <AddonForm
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
        title="Delete add-on?"
        description={deleteTarget ? `Remove "${deleteTarget.name}".` : ""}
        variant="danger"
        confirmText="Delete"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const res = await deleteAddon(deleteTarget.id);
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

function AddonCard({
  addon,
  onEdit,
  onDelete,
}: {
  addon: Addon;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group transition-all hover:border-[var(--accent)]/30 hover:shadow-[0_8px_32px_-8px_var(--accent-glow)]">
      <div className="flex items-start justify-between p-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {addon.type === "fixed" ? (
              <Zap className="h-4 w-4 text-[var(--accent)]" />
            ) : (
              <Layers className="h-4 w-4 text-[var(--role-admin)]" />
            )}
            <span className="truncate font-semibold text-[var(--foreground)]">
              {addon.name}
            </span>
          </div>
          <div className="mt-2">
            <Badge variant={addon.type === "fixed" ? "default" : "secondary"}>
              {addon.type === "fixed" ? "Fixed" : "Conditional"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon-sm" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            className="text-[var(--danger)] hover:bg-[var(--danger-soft)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-5 py-4">
        {addon.type === "fixed" ? (
          <div className="tabular-nums text-xl font-bold text-[var(--foreground)]">
            {formatCurrency(addon.price)}
          </div>
        ) : (
          <div className="space-y-1.5">
            {(addon.rules ?? []).map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-[var(--foreground-muted)]">
                  {r.label ||
                    `${r.min}${r.max != null ? `–${r.max}` : "+"} qty`}
                </span>
                <span className="tabular-nums font-semibold text-[var(--foreground)]">
                  {formatCurrency(r.price)}
                </span>
              </div>
            ))}
            {(!addon.rules || addon.rules.length === 0) && (
              <span className="text-xs text-[var(--foreground-subtle)]">
                No rules configured
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function AddonForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Addon | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [type, setType] = React.useState<AddonType>(initial?.type ?? "fixed");
  const [price, setPrice] = React.useState(initial ? String(initial.price) : "");
  const [rules, setRules] = React.useState<AddonRule[]>(
    initial?.rules ?? [{ min: 1, max: null, price: 0, label: "" }],
  );
  const [saving, setSaving] = React.useState(false);

  function addRule() {
    const last = rules[rules.length - 1];
    const nextMin = last ? (last.max ?? last.min) + 1 : 1;
    setRules([...rules, { min: nextMin, max: null, price: 0, label: "" }]);
  }

  function updateRule(i: number, patch: Partial<AddonRule>) {
    setRules(rules.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function removeRule(i: number) {
    setRules(rules.filter((_, idx) => idx !== i));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name required");

    if (type === "fixed") {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0)
        return toast.error("Valid price required");

      setSaving(true);
      const payload = {
        name: name.trim(),
        type,
        price: priceNum,
        rules: null,
      };
      const res = initial
        ? await updateAddon(initial.id, payload)
        : await createAddon(payload);
      if ("error" in res && res.error) {
        toast.error("Save failed", { description: res.error });
        setSaving(false);
        return;
      }
      toast.success(initial ? "Updated" : "Created");
      onSaved();
      setSaving(false);
    } else {
      if (rules.length === 0) return toast.error("Add at least one rule");
      for (const r of rules) {
        if (isNaN(r.price) || r.price < 0)
          return toast.error("Every rule needs a valid price");
      }
      setSaving(true);
      const payload = {
        name: name.trim(),
        type,
        price: 0,
        rules,
      };
      const res = initial
        ? await updateAddon(initial.id, payload)
        : await createAddon(payload);
      if ("error" in res && res.error) {
        toast.error("Save failed", { description: res.error });
        setSaving(false);
        return;
      }
      toast.success(initial ? "Updated" : "Created");
      onSaved();
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="a-name">Name *</Label>
          <Input
            id="a-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Stair fee"
          />
        </div>
        <div className="space-y-2">
          <Label>Type *</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("fixed")}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors cursor-pointer",
                type === "fixed"
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-medium"
                  : "border-[var(--border)] bg-[var(--input)] text-[var(--foreground-muted)]",
              )}
            >
              <Zap className="mx-auto mb-1 h-4 w-4" />
              Fixed
            </button>
            <button
              type="button"
              onClick={() => setType("conditional")}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm transition-colors cursor-pointer",
                type === "conditional"
                  ? "border-[var(--role-admin)] bg-[var(--role-admin)]/10 text-[var(--role-admin)] font-medium"
                  : "border-[var(--border)] bg-[var(--input)] text-[var(--foreground-muted)]",
              )}
            >
              <Layers className="mx-auto mb-1 h-4 w-4" />
              Conditional
            </button>
          </div>
        </div>
      </div>

      {type === "fixed" ? (
        <div className="space-y-2">
          <Label htmlFor="a-price">Price *</Label>
          <Input
            id="a-price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="25.00"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Quantity-based Rules</Label>
            <Button type="button" variant="outline" size="sm" onClick={addRule}>
              <Plus className="h-3.5 w-3.5" />
              Add rule
            </Button>
          </div>
          <p className="text-xs text-[var(--foreground-subtle)]">
            Driver enters a quantity (e.g., number of stairs). The first matching
            rule determines the price. Leave “max” empty for the last tier.
          </p>
          <div className="space-y-2">
            {rules.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-end gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-3"
              >
                <div className="col-span-12 md:col-span-3 space-y-1">
                  <Label className="text-xs">Min</Label>
                  <Input
                    type="number"
                    min="0"
                    value={r.min}
                    onChange={(e) =>
                      updateRule(i, { min: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="col-span-12 md:col-span-3 space-y-1">
                  <Label className="text-xs">Max (empty = no limit)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={r.max ?? ""}
                    onChange={(e) =>
                      updateRule(i, {
                        max: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                  />
                </div>
                <div className="col-span-6 md:col-span-3 space-y-1">
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={r.price}
                    onChange={(e) =>
                      updateRule(i, {
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="col-span-5 md:col-span-2 space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={r.label}
                    onChange={(e) => updateRule(i, { label: e.target.value })}
                    placeholder="1 step"
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeRule(i)}
                    className="text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
