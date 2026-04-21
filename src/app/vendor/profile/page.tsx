import { requireVendor } from "@/lib/auth";
import { getVendorForUser } from "@/lib/queries/vendor";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleBadge } from "@/components/ui/status-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Mail,
  User,
  Shield,
  Building2,
  MapPin,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function VendorProfilePage() {
  const user = await requireVendor();
  const vendor = await getVendorForUser(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your account and vendor information."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field icon={User} label="Name" value={user.name} />
            <Field icon={Mail} label="Email" value={user.email} />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent-soft)]">
                <Shield className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-subtle)]">
                  Role
                </div>
                <RoleBadge role={user.role} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--foreground)]">
                Theme
              </div>
              <div className="text-xs text-[var(--foreground-muted)]">
                Toggle between dark and light.
              </div>
            </div>
            <ThemeToggle />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Vendor Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!vendor ? (
            <EmptyState
              icon={Building2}
              title="Not linked"
              description="Contact the admin to link your account to a vendor record."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Field icon={Building2} label="Name" value={vendor.name} />
              <Field icon={MapPin} label="Address" value={vendor.address} />
              <Field
                icon={DollarSign}
                label="Free Distance"
                value={`${vendor.distance_free_limit} mi`}
              />
              <Field
                icon={DollarSign}
                label="Rate per Extra Mile"
                value={formatCurrency(vendor.distance_rate)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--accent-soft)]">
        <Icon className="h-4 w-4 text-[var(--accent)]" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-subtle)]">
          {label}
        </div>
        <div className="truncate text-sm font-medium text-[var(--foreground)]">
          {value}
        </div>
      </div>
    </div>
  );
}
