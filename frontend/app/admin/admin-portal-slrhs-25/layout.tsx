// app/admin/admin-portal-slrhs-25/layout.tsx
"use client";

import { useState } from "react";
import AdminAuthCheck from "@/components/admin/AdminAuthCheck";
import AdminSideBar from "@/components/admin/AdminSideBar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <AdminAuthCheck>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-purple-50/20">
        {/* Admin Sidebar */}
        <AdminSideBar open={openSidebar} setOpen={setOpenSidebar} />
        
        <div className="flex flex-1 flex-col">
          {/* Admin Header */}
          <AdminHeader setOpen={setOpenSidebar} />
          
          {/* Main Content */}
          <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthCheck>
  );
}