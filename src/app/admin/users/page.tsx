import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { UsersManager } from "./users-manager";
import type { User } from "@/types/database";

export default async function UsersPage() {
  const currentUser = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Admins, drivers, and vendors with portal access."
      />
      <UsersManager
        data={(data as User[]) ?? []}
        currentUserId={currentUser.id}
      />
    </div>
  );
}
