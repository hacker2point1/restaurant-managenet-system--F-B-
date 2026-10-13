"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { authLogout, getProfile, logout } from "@/redux/slice/authSlice";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] =
    useState(false);
  const user = useAppSelector((state) => {
    const auth = state.auth as unknown as {
      user?: {
        name?: string;
        firstName?: string;
        lastName?: string;
        username?: string;
        email?: string;
        role?: string;
      } | null;
    };
    return auth.user ?? null;
  });
  const [profileResolved, setProfileResolved] = useState(false);

  useEffect(() => {
    let mounted = true;

    dispatch(getProfile()).finally(() => {
      if (mounted) setProfileResolved(true);
    });

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  const userName =
    user?.name?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.email?.split("@")[0] ||
    null;
  const userInitial = userName?.charAt(0).toUpperCase() || "";
  const isUserLoading = !profileResolved && !userName;

  const handleLogout = async () => {
    try {
      await dispatch(authLogout()).unwrap();
    } catch (error) {
      console.error("Server logout failed:", error);
    } finally {
      dispatch(logout());
      router.replace("/auth/signIn");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f6]">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userName={userName}
        userInitial={userInitial}
        isUserLoading={isUserLoading}
      />

      <div className="lg:pl-[232px]">
        <AdminTopbar
          onMenuClick={() => setMobileOpen(true)}
          userName={userName}
          userEmail={user?.email ?? null}
          userInitial={userInitial}
          isUserLoading={isUserLoading}
          onLogout={handleLogout}
        />

        <main className="min-h-[calc(100vh-72px)] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}