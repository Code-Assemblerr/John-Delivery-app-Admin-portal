import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleBadge } from "@/components/ui/status-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Mail, User, Shield } from "lucide-react";

export default async function SettingsPage() {
  const user = await requireAdmin();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Your portal preferences and account information."
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
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[var(--foreground)]">
                  Theme
                </div>
                <div className="text-xs text-[var(--foreground-muted)]">
                  Toggle between dark and light modes.
                </div>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[var(--foreground-muted)]">
          <p>
            Delivery Admin Portal — operations control center for admins
            and vendors.
          </p>
          <p>
            Drivers use the companion mobile app for deliveries, photo &amp;
            signature capture.
          </p>
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
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent-soft)]">
        <Icon className="h-4 w-4 text-[var(--accent)]" />
      </div>
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-subtle)]">
          {label}
        </div>
        <div className="text-sm font-medium text-[var(--foreground)]">
          {value}
        </div>
      </div>
    </div>
  );
}
