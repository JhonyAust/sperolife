// components/admin/AdminSideBar.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  Tags,
  X,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSideBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/admin-portal-slrhs-25/dashboard",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Products",
    icon: Package,
    href: "/admin/admin-portal-slrhs-25/products",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/admin/admin-portal-slrhs-25/orders",
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Customers",
    icon: Users,
    href: "/admin/admin-portal-slrhs-25/customers",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Categories",
    icon: Tags,
    href: "/admin/admin-portal-slrhs-25/categories",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/admin/admin-portal-slrhs-25/analytics",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/admin-portal-slrhs-25/settings",
    gradient: "from-gray-500 to-slate-500",
  },
];

export default function AdminSideBar({ open, setOpen }: AdminSideBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          open ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div
              className={cn(
                "flex items-center gap-3 transition-all duration-300",
                !open && "lg:justify-center lg:w-full"
              )}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              
              {open && (
                <div className="overflow-hidden">
                  <h2 className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    SperoLife
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">Admin Portal</p>
                </div>
              )}
            </div>

            {/* Close button (mobile) */}
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Collapse button (desktop) */}
            {open && (
              <button
                onClick={() => setOpen(false)}
                className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item, index) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50",
                      isActive && item.gradient,
                      !open && "lg:justify-center lg:px-3"
                    )}
                    style={{
                      animation: `slideIn 0.3s ease-out forwards`,
                      animationDelay: `${index * 0.05}s`,
                    }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                    )}

                    {/* Icon */}
                    <div className={cn(
                      "relative z-10 transition-transform duration-300",
                      isActive && "scale-110"
                    )}>
                      <Icon className="w-5 h-5" strokeWidth={2.5} />
                    </div>

                    {/* Label */}
                    {open && (
                      <span className="relative z-10 font-semibold text-sm">
                        {item.title}
                      </span>
                    )}

                    {/* Hover effect */}
                    {!isActive && (
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                        item.gradient
                      )}></div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div
              className={cn(
                "bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 transition-all duration-300",
                !open && "lg:p-3"
              )}
            >
              {open ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs font-bold text-purple-900">System Status</p>
                  </div>
                  <p className="text-xs text-gray-600">All systems operational</p>
                  <div className="flex gap-1 mt-2">
                    <div className="h-1 flex-1 bg-green-500 rounded-full"></div>
                    <div className="h-1 flex-1 bg-green-500 rounded-full"></div>
                    <div className="h-1 flex-1 bg-green-500 rounded-full"></div>
                    <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ) : (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto"></div>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>
      </aside>
    </>
  );
}