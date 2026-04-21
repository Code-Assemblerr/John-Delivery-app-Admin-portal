"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNav, vendorNav, type NavItem } from "./nav-config";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  portal: "admin" | "vendor";
  portalLabel: string;
  portalColor: string;
}

export function Sidebar({ portal, portalLabel, portalColor }: SidebarProps) {
  const nav = portal === "admin" ? adminNav : vendorNav;
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const groups = React.useMemo(() => {
    const map = new Map<string, NavItem[]>();
    for (const item of nav) {
      const g = item.group ?? "General";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }
    return Array.from(map.entries());
  }, [nav]);

  function isActive(href: string) {
    if (href === pathname) return true;

    if (pathname.startsWith(href + "/")) return true;
    return false;
  }

  return (
    <>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-200",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] backdrop-blur-xl transition-all duration-300",
          "md:sticky md:top-0 md:translate-x-0",
          collapsed ? "md:w-[72px]" : "md:w-64",
          mobileOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">

          <div
            className={cn(
              "flex items-center gap-3 px-4 h-16 border-b border-[var(--sidebar-border)]",
              collapsed && "md:justify-center md:px-2",
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-[0_4px_16px_-4px_var(--accent-glow)]">
              <Package2 className="h-5 w-5 text-white" />
            </div>
            <div
              className={cn(
                "flex flex-col min-w-0 transition-opacity",
                collapsed && "md:hidden",
              )}
            >
              <span className="truncate text-sm font-semibold text-[var(--foreground)]">
                John Delivery
              </span>
              <span className={cn("text-xs truncate", portalColor)}>
                {portalLabel}
              </span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {groups.map(([groupName, items]) => (
              <div key={groupName}>
                <div
                  className={cn(
                    "px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-subtle)]",
                    collapsed && "md:hidden",
                  )}
                >
                  {groupName}
                </div>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all duration-200",
                            active
                              ? "bg-[var(--sidebar-item-active)] text-[var(--accent)] font-medium"
                              : "text-[var(--foreground-muted)] hover:bg-[var(--sidebar-item-hover)] hover:text-[var(--foreground)]",
                            collapsed && "md:justify-center md:px-0",
                          )}
                        >
                          {active && (
                            <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-x-3 -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                          )}
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              active && "text-[var(--accent)]",
                            )}
                          />
                          <span
                            className={cn(
                              "truncate",
                              collapsed && "md:hidden",
                            )}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="hidden md:block border-t border-[var(--sidebar-border)] p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed((c) => !c)}
              className={cn(
                "w-full justify-start gap-2",
                collapsed && "justify-center px-0",
              )}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "rotate-180",
                )}
              />
              <span className={cn(collapsed && "hidden")}>Collapse</span>
            </Button>
          </div>
        </div>
      </aside>

      <SidebarMobileTriggerMount setMobileOpen={setMobileOpen} />
    </>
  );
}

function SidebarMobileTriggerMount({
  setMobileOpen,
}: {
  setMobileOpen: (v: boolean) => void;
}) {
  React.useEffect(() => {
    function handler() {
      setMobileOpen(true);
    }
    window.addEventListener("sidebar:open", handler);
    return () => window.removeEventListener("sidebar:open", handler);
  }, [setMobileOpen]);
  return null;
}
