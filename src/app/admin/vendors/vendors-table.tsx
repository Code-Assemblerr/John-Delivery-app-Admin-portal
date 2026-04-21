"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Building2, Plus, MapPin, Link2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Vendor } from "@/types/database";
import { formatCurrency } from "@/lib/utils";

export function VendorsTable({ data }: { data: Vendor[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.address?.toLowerCase().includes(q),
    );
  }, [data, search]);

  const columns: ColumnDef<Vendor, any>[] = [
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
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="max-w-md truncate text-[var(--foreground-muted)]">
          {row.original.address}
        </div>
      ),
    },
    {
      id: "pricing",
      header: "Pricing",
      cell: ({ row }) => (
        <div className="text-xs">
          <span className="text-[var(--foreground)]">
            {row.original.distance_free_limit} mi free
          </span>{" "}
          <span className="text-[var(--foreground-subtle)]">·</span>{" "}
          <span className="text-[var(--foreground-muted)]">
            {formatCurrency(row.original.distance_rate)}/mi
          </span>
        </div>
      ),
    },
    {
      id: "account",
      header: "Account",
      cell: ({ row }) =>
        row.original.user_id ? (
          <Badge variant="success">
            <Link2 className="h-3 w-3" />
            Linked
          </Badge>
        ) : (
          <Badge variant="secondary">—</Badge>
        ),
    },
    {
      id: "geocoded",
      header: "Geocoded",
      cell: ({ row }) =>
        row.original.latitude != null ? (
          <Badge variant="info">
            <MapPin className="h-3 w-3" />
            Yes
          </Badge>
        ) : (
          <Badge variant="secondary">No</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search vendors..."
      />
      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(v) => router.push(`/admin/vendors/${v.id}`)}
        emptyState={
          <EmptyState
            icon={Building2}
            title={search ? "No matching vendors" : "No vendors yet"}
            description={
              search ? "Try a different search." : "Add your first vendor."
            }
            action={
              !search && (
                <Link href="/admin/vendors/new">
                  <Button variant="gradient">
                    <Plus className="h-4 w-4" />
                    New Vendor
                  </Button>
                </Link>
              )
            }
          />
        }
      />
    </div>
  );
}
