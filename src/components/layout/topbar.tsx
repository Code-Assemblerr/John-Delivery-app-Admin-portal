"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, User2 } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { initials } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

export function Topbar({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.replace("/login");
    router.refresh();
  }

  function openMobileSidebar() {
    window.dispatchEvent(new Event("sidebar:open"));
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--sidebar-border)] bg-[var(--sidebar)] backdrop-blur-xl px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={openMobileSidebar}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] px-2 py-1.5 text-sm transition-colors hover:bg-[var(--sidebar-item-hover)] cursor-pointer"
            aria-label="Account menu"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-semibold text-white">
              {initials(user.name)}
            </div>
            <span className="hidden md:inline text-[var(--foreground)]">
              {user.name}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[var(--foreground)]">
                {user.name}
              </span>
              <span className="truncate text-xs text-[var(--foreground-subtle)]">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              router.push(user.role === "admin" ? "/admin/settings" : "/vendor/profile")
            }
          >
            <User2 className="h-4 w-4" />
            {user.role === "admin" ? "Settings" : "Profile"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="danger"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
