"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarOff, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, toIsoDate } from "@/lib/utils";
import { createBlockedDate, deleteBlockedDate } from "./actions";
import type { BlockedDate } from "@/types/database";

export function BlockedDatesManager({ data }: { data: BlockedDate[] }) {
  const router = useRouter();
  const [date, setDate] = React.useState(toIsoDate(new Date()));
  const [reason, setReason] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<BlockedDate | null>(
    null,
  );

  async function addBlocked() {
    if (!date) return toast.error("Pick a date");
    if (data.some((d) => d.date === date))
      return toast.error("Date already blocked");

    setSaving(true);
    const res = await createBlockedDate(date, reason);
    if ("error" in res && res.error) {
      toast.error("Failed to add", { description: res.error });
      setSaving(false);
      return;
    }
    toast.success("Date blocked");
    setReason("");
    router.refresh();
    setSaving(false);
  }

  const sorted = [...data].sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardContent className="space-y-4 p-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Block a new date
          </h3>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Holiday, maintenance, etc."
            />
          </div>
          <Button
            variant="gradient"
            className="w-full"
            onClick={addBlocked}
            loading={saving}
          >
            <Plus className="h-4 w-4" />
            Block Date
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <EmptyState
              icon={CalendarOff}
              title="No blocked dates"
              description="Dates you block here will be rejected when creating work orders."
              className="py-16"
            />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {sorted.map((d) => {
                const past = new Date(d.date) < new Date(toIsoDate(new Date()));
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`tabular-nums font-medium ${
                            past
                              ? "text-[var(--foreground-subtle)]"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {formatDate(d.date)}
                        </span>
                        {past && (
                          <span className="text-xs text-[var(--foreground-subtle)]">
                            past
                          </span>
                        )}
                      </div>
                      {d.reason && (
                        <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
                          {d.reason}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(d)}
                      className="text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Unblock this date?"
        description={
          deleteTarget
            ? `${formatDate(deleteTarget.date)} will become available for deliveries again.`
            : ""
        }
        confirmText="Unblock"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const res = await deleteBlockedDate(deleteTarget.id);
          if ("error" in res && res.error)
            toast.error("Failed", { description: res.error });
          else {
            toast.success("Date unblocked");
            router.refresh();
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
