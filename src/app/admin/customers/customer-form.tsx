"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Check, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createCustomer, updateCustomer, deleteCustomer } from "./actions";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
});

type CustomerValues = z.infer<typeof customerSchema>;

export function CustomerForm({
  initial,
}: {
  initial?: { id: string; name: string; address: string; phone: string };
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: initial
      ? { name: initial.name, address: initial.address, phone: initial.phone }
      : { name: "", address: "", phone: "" },
  });

  async function onSubmit(values: CustomerValues) {
    setSubmitting(true);
    const res = initial
      ? await updateCustomer(initial.id, values)
      : await createCustomer(values);
    if ("error" in res && res.error) {
      toast.error("Save failed", { description: res.error });
      setSubmitting(false);
      return;
    }
    toast.success(initial ? "Customer updated" : "Customer created", {
      description: "Address geocoded automatically",
    });
    router.push("/admin/customers");
    router.refresh();
  }

  async function handleDelete() {
    if (!initial) return;
    setDeleting(true);
    const res = await deleteCustomer(initial.id);
    if ("error" in res && res.error) {
      toast.error("Delete failed", { description: res.error });
      setDeleting(false);
      return;
    }
    toast.success("Customer deleted");
    router.push("/admin/customers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{initial ? "Edit Customer" : "New Customer"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" placeholder="Jane Doe" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-[var(--danger)]">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="(555) 123-4567"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-xs text-[var(--danger)]">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Address *
            </Label>
            <Input
              id="address"
              placeholder="123 Main St, Springfield, IL"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-[var(--danger)]">
                {errors.address.message}
              </p>
            )}
            <p className="text-xs text-[var(--foreground-subtle)]">
              Latitude/longitude will be geocoded automatically for distance pricing.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
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
            onClick={() => router.push("/admin/customers")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="gradient" loading={submitting}>
            <Check className="h-4 w-4" />
            {initial ? "Save Changes" : "Create Customer"}
          </Button>
        </div>
      </div>

      {initial && (
        <ConfirmDialog
          open={showDelete}
          onOpenChange={setShowDelete}
          title="Delete customer?"
          description="This will remove the customer permanently. Existing work orders will retain a reference but show the customer as missing."
          variant="danger"
          confirmText="Delete"
          loading={deleting}
          onConfirm={handleDelete}
        />
      )}
    </form>
  );
}
