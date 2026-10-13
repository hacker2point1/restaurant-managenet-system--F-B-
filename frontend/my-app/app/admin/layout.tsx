import AdminLayout from "@/src/components/admin/AdminLayout";
import React from "react";



export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}