"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  Store,
  Users,
  UserRound,
  Table2,
  CalendarDays,
  UtensilsCrossed,
  Boxes,
  Tags,
  Star,
  BarChart3,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Package,
  ReceiptText,
  X,
  GitBranch,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  userName: string | null;
  userInitial: string;
  isUserLoading: boolean;
}

const mainNavigation = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },

  {
    title: "Restaurants",
    href: "/admin/restaurent",
    icon: Store,
  },
  {
    title: "Branches",
    href: "/admin/branches",
    icon: GitBranch,
  },

  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },

  {
    title: "Customers",
    href: "/admin/customers",
    icon: UserRound,
  },

  {
    title: "Tables",
    href: "/admin/tables",
    icon: Table2,
  },

  {
    title: "Reservations",
    href: "/admin/reservations",
    icon: CalendarDays,
  },
];

const menuNavigation = [
  {
    title: "Categories",
    href: "/admin/menu/categories",
    icon: Tags,
  },

  {
    title: "Menu Items",
    href: "/admin/menu/items",
    icon: UtensilsCrossed,
  },
];

const inventoryNavigation = [
  {
    title: "Items",
    href: "/admin/inventory/items",
    icon: Package,
  },

  {
    title: "Transactions",
    href: "/admin/inventory/transactions",
    icon: ReceiptText,
  },
];

const bottomNavigation = [
  {
    title: "Coupons",
    href: "/admin/coupons",
    icon: Tags,
  },

  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: Star,
  },

  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

export default function AdminSidebar({
  mobileOpen = false,
  onClose,
  userName,
  userInitial,
  isUserLoading,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(true);

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  const inventoryActive =
    pathname.startsWith("/admin/items") ||
    pathname.startsWith("/admin/inventory");

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[232px] flex-col bg-[#101c1b] text-white transition-transform duration-300",
          "lg:translate-x-0",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-[124px] items-center border-b border-white/5 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9b6b2f] text-lg font-bold">
              R
            </div>

            <div>
              <h1 className="text-[17px] font-semibold tracking-tight">
                RestroSuite
              </h1>

              <p className="text-[11px] text-gray-400">
                Management Platform
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="ml-auto rounded-md p-1 text-gray-400 hover:bg-white/10 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-5">
          <nav className="space-y-1">
            {mainNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#9b6b2f] text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={19} strokeWidth={1.8} />

                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Menu */}
          <div className="mt-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-gray-400"
            >
              <div className="flex items-center gap-3">
                <UtensilsCrossed size={19} />
                <span>Menu</span>
              </div>

              {menuOpen ? (
                <ChevronDown size={15} />
              ) : (
                <ChevronRight size={15} />
              )}
            </button>

            {menuOpen && (
              <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-4">
                {menuNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "block rounded-md px-2 py-2 text-[13px]",
                      isActive(item.href)
                        ? "text-white"
                        : "text-gray-500 hover:text-white"
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="mt-3">
            <div
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium",
                inventoryActive
                  ? "bg-[#9b6b2f] text-white"
                  : "text-gray-400"
              )}
            >
                 <Boxes size={19} />
                <span>Inventory</span>
              {/* <Link
                href="/admin/items"
                onClick={onClose}
                className="flex min-w-0 flex-1 items-center gap-3 hover:text-white"
              >
               
              </Link> */}

              <button
                type="button"
                onClick={() => setInventoryOpen(!inventoryOpen)}
                aria-label={inventoryOpen ? "Collapse inventory links" : "Expand inventory links"}
                aria-expanded={inventoryOpen}
                className="ml-2 rounded p-1 hover:bg-white/10"
              >
                {inventoryOpen ? (
                  <ChevronDown size={15} />
                ) : (
                  <ChevronRight size={15} />
                )}
              </button>
            </div>

            {inventoryOpen && (
              <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-4">
                {inventoryNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "block rounded-md px-2 py-2 text-[13px]",
                      isActive(item.href)
                        ? "text-white"
                        : "text-gray-500 hover:text-white"
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Other */}
          <div className="mt-4 space-y-1">
            {bottomNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium",
                    isActive(item.href)
                      ? "bg-[#9b6b2f] text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={19} />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Help */}
        <div className="border-t border-white/10 px-3 py-3">
          <Link
            href="/admin/help"
            className="flex h-10 items-center gap-3 rounded-lg px-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <HelpCircle size={19} />
            Help & Support
          </Link>
        </div>

        {/* User */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9b6b2f] font-semibold">
              {userInitial || <UserRound size={18} />}
            </div>

            <div className="min-w-0">
              {userName ? (
                <p className="truncate text-sm font-medium">{userName}</p>
              ) : isUserLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <p className="truncate text-sm text-gray-400">
                  Profile unavailable
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}