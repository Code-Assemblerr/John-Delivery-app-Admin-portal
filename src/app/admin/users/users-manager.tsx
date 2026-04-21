"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { UserCog, Trash2, ChevronDown } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, initials } from "@/lib/utils";
import { updateUserRole, deleteUserProfile } from "./actions";
import type { User, UserRole } from "@/types/database";

export function UsersManager({
  data,
  currentUserId,
}: {
  data: User[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q),
    );
  }, [data, search]);

  async function changeRole(user: User, role: UserRole) {
    const res = await updateUserRole(user.id, role);
    if ("error" in res && res.error) {
      toast.error("Update failed", { description: res.error });
    } else {
      toast.success(`${user.name} is now ${role}`);
      router.refresh();
    }
  }

  const columns: ColumnDef<User, any>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-semibold text-white">
            {initials(row.original.name)}
          </div>
          <div>
            <div className="font-medium text-[var(--foreground)]">
              {row.original.name || "—"}
              {row.original.id === currentUserId && (
                <span className="ml-2 text-xs text-[var(--accent)]">(you)</span>
              )}
            </div>
            <div className="text-xs text-[var(--foreground-subtle)]">
              {row.original.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => (
        <div className="tabular-nums text-[var(--foreground-muted)]">
          {formatDate(row.original.created_at)}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = user.id === currentUserId;
        return (
          <div className="flex items-center justify-end gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ChevronDown className="h-3.5 w-3.5" />
                  Role
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(["admin", "vendor", "driver"] as UserRole[]).map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => changeRole(user, r)}
                    disabled={user.role === r || (isSelf && r !== "admin")}
                  >
                    <RoleBadge role={r} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteTarget(user)}
              disabled={isSelf}
              className="text-[var(--danger)] hover:bg-[var(--danger-soft)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search users by name, email, role..."
        />
        <DataTable
          columns={columns}
          data={filtered}
          emptyState={
            <EmptyState
              icon={UserCog}
              title={search ? "No matching users" : "No users yet"}
              description="Users sign up via the mobile app or web login."
            />
          }
        />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete user profile?"
        description={
          deleteTarget
            ? `Remove profile for ${deleteTarget.name || deleteTarget.email}. The auth account will remain — contact Supabase admin to revoke login.`
            : ""
        }
        variant="danger"
        confirmText="Delete"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const res = await deleteUserProfile(deleteTarget.id);
          if ("error" in res && res.error)
            toast.error("Delete failed", { description: res.error });
          else {
            toast.success("User profile deleted");
            router.refresh();
          }
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
