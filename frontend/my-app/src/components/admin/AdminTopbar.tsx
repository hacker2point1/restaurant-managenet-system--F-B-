
"use client";

import { useState } from "react";
import {
  Bell,
  Menu,
  Search,
  ChevronDown,
  UserRound,
  LogOut,
  Mail,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdminTopbarProps {
  onMenuClick?: () => void;
  userName: string | null;
  userEmail: string | null;
  userInitial: string;
  isUserLoading: boolean;
  onLogout?: () => void;
}

export default function AdminTopbar({
  onMenuClick,
  userName,
  userEmail,
  userInitial,
  isUserLoading,
  onLogout,
}: AdminTopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b bg-white px-4 md:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <h2 className="text-lg font-semibold text-[#1f2928]">
          Dashboard
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Branch */}
        <button className="hidden items-center gap-3 rounded-lg border bg-white px-4 py-2 text-sm md:flex">
          <span className="text-gray-500">Branch:</span>

          <span className="font-medium">All Branches</span>

          <ChevronDown size={16} />
        </button>

        {/* Search */}
        <div className="hidden h-10 w-[230px] items-center gap-2 rounded-lg border bg-[#f8f9f9] px-3 lg:flex">
          <Search size={17} className="text-gray-400" />

          <input
            placeholder="Global search..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Notification */}
        <button
          aria-label="Notifications"
          className="relative rounded-lg border p-2.5 hover:bg-gray-50"
        >
          <Bell size={18} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Logged-in User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            aria-label="Open user menu"
            className="flex items-center gap-2 rounded-lg py-1.5 pl-2 pr-1 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9b6b2f]"
          >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#9b6b2f] text-sm font-semibold text-white">
                {userInitial || <UserRound className="size-4" />}
              </div>

              <div className="hidden text-left md:block">
                {userName ? (
                  <p className="max-w-[140px] truncate text-sm font-semibold text-[#1f2928]">
                    {userName}
                  </p>
                ) : isUserLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">
                    Profile unavailable
                  </p>
                )}
              </div>

              <ChevronDown
                size={16}
                className="hidden text-gray-500 md:block"
              />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                {userName ? (
                  <>
                    <p className="text-sm font-semibold">{userName}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      Signed in
                    </p>
                  </>
                ) : isUserLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <p className="text-sm font-medium">Profile unavailable</p>
                )}
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setProfileOpen(true)}
              className="cursor-pointer"
            >
              <UserRound className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
            >
              <LogOut className="mr-2 size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>Your signed-in account details.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#9b6b2f] font-semibold text-white">
              {userInitial || <UserRound className="size-4" />}
            </div>
            <p className="font-medium">{userName || "Profile unavailable"}</p>
          </div>
          {userEmail && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4" />
              {userEmail}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
