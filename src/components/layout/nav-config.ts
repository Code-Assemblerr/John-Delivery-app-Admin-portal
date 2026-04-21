import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Building2,
  Package,
  Plus,
  RotateCcw,
  CalendarOff,
  Receipt,
  BarChart3,
  UserCog,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group?: string;
}

export const adminNav: NavItem[] = [
  {
    group: "Overview",
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    group: "Operations",
    label: "Work Orders",
    href: "/admin/work-orders",
    icon: ClipboardList,
  },
  {
    group: "Operations",
    label: "Invoices",
    href: "/admin/invoices",
    icon: Receipt,
  },
  {
    group: "Operations",
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    group: "Directory",
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    group: "Directory",
    label: "Vendors",
    href: "/admin/vendors",
    icon: Building2,
  },
  {
    group: "Catalog",
    label: "Items",
    href: "/admin/items",
    icon: Package,
  },
  {
    group: "Catalog",
    label: "Add-ons",
    href: "/admin/addons",
    icon: Plus,
  },
  {
    group: "Catalog",
    label: "Returns",
    href: "/admin/returns",
    icon: RotateCcw,
  },
  {
    group: "Management",
    label: "Users",
    href: "/admin/users",
    icon: UserCog,
  },
  {
    group: "Management",
    label: "Blocked Dates",
    href: "/admin/blocked-dates",
    icon: CalendarOff,
  },
  {
    group: "Management",
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export const vendorNav: NavItem[] = [
  {
    group: "Overview",
    label: "Dashboard",
    href: "/vendor",
    icon: LayoutDashboard,
  },
  {
    group: "Operations",
    label: "Work Orders",
    href: "/vendor/work-orders",
    icon: ClipboardList,
  },
  {
    group: "Operations",
    label: "Invoices",
    href: "/vendor/invoices",
    icon: Receipt,
  },
  {
    group: "Account",
    label: "Profile",
    href: "/vendor/profile",
    icon: UserCog,
  },
];
