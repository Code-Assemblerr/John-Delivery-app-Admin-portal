"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Check, MapPin, DollarSign } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createVendor, updateVendor, deleteVendor } from "./actions";

const vendorSchema = z.object({
  name: z.string().min(1, "Name required"),
  address: z.string().min(1, "Address required"),
  distance_free_limit: z.number().min(0),
  distance_rate: z.number().min(0),
});

type VendorValues = z.infer<typeof vendorSchema>;

export function VendorForm({
  initial,
  vendorUsers,
}: {
  initial?: {
    id: string;
    name: string;
    address: string;
    distance_free_limit: number;
    distance_rate: number;
    user_id: string | null;
  };
  vendorUsers: { id: string; name: string; email: string }[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(
    initial?.user_id ?? null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          address: initial.address,
          distance_free_limit: initial.distance_free_limit,
          distance_rate: initial.distance_rate,
        }
      : {
          name: "",
          address: "",
          distance_free_limit: 15,
          distance_rate: 2,
        },
  });

  async function onSubmit(values: VendorValues) {
    setSubmitting(true);
    const payload = { ...values, user_id: userId };
    const res = initial
      ? await updateVendor(initial.id, payload)
      : await createVendor(payload);
    if ("error" in res && res.error) {
      toast.error("Save failed", { description: res.error });
      setSubmitting(false);
      return;
    }
    toast.success(initial ? "Vendor updated" : "Vendor created");
    router.push("/admin/vendors");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    setDeleting(true);
    const res = await deleteVendor(initial.id);
    if ("error" in res && res.error) {
      toast.error("Delete failed", { description: res.error });
      setDeleting(false);
      return;
    }
    toast.success("Vendor deleted");
    router.push("/admin/vendors");
    router.refresh();
  }

  const userOpts = [
    { value: "", label: "No vendor account linked" },
    ...vendorUsers.map((u) => ({
      value: u.id,
      label: u.name,
      description: u.email,
    })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" placeholder="Acme Furniture Co." {...register("name")} />
            {errors.name && (
              <p className="text-xs text-[var(--danger)]">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Address *
            </Label>
            <Input
              id="address"
              placeholder="456 Warehouse Rd"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-[var(--danger)]">
                {errors.address.message}
              </p>
            )}
            <p className="text-xs text-[var(--foreground-subtle)]">
              Used as the origin for distance-based pricing.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Vendor Account (optional)</Label>
            <Combobox
              options={userOpts}
              value={userId ?? ""}
              onChange={(v) => setUserId(v || null)}
              placeholder="Link a vendor user account"
            />
            <p className="text-xs text-[var(--foreground-subtle)]">
              Allows this vendor user to see their own orders and create new ones.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Distance Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="free">Free Miles</Label>
            <Input
              id="free"
              type="number"
              step="1"
              min="0"
              {...register("distance_free_limit", { valueAsNumber: true })}
            />
            <p className="text-xs text-[var(--foreground-subtle)]">
              Deliveries within this distance have no mileage fee.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Rate per Extra Mile ($)</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              min="0"
              {...register("distance_rate", { valueAsNumber: true })}
            />
            <p className="text-xs text-[var(--foreground-subtle)]">
              Charged for every mile beyond the free limit.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {initial && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDelete(true)}
              className="text-[var(--danger)] hover:bg-[var(--danger-soft)]"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/vendors")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="gradient" loading={submitting}>
            <Check className="h-4 w-4" />
            {initial ? "Save Changes" : "Create Vendor"}
          </Button>
        </div>
      </div>

      {initial && (
        <ConfirmDialog
          open={showDelete}
          onOpenChange={setShowDelete}
          title="Delete vendor?"
          description="This will remove the vendor and break existing work order references."
          variant="danger"
          confirmText="Delete"
          loading={deleting}
          onConfirm={handleDelete}
        />
      )}
    </form>
  );
}
