"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { aggregateMonthlyInvoices } from "./actions";

export function MonthlyAggregateButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [running, setRunning] = React.useState(false);

  async function handleAggregate() {
    setRunning(true);
    const res = await aggregateMonthlyInvoices();
    if ("error" in res && res.error) {
      toast.error("Aggregation failed", { description: res.error });
      setRunning(false);
      return;
    }
    toast.success("Monthly invoices generated", {
      description: `Aggregated for ${res.count} vendor${res.count === 1 ? "" : "s"}.`,
    });
    setOpen(false);
    setRunning(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <CalendarClock className="h-4 w-4" />
        Generate Monthly Invoices
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Aggregate last month's invoices?"
        description="This groups all delivered invoices from the previous month by vendor into monthly totals. Safe to re-run — existing rows will be overwritten."
        confirmText="Run Aggregation"
        onConfirm={handleAggregate}
        loading={running}
      />
    </>
  );
}
