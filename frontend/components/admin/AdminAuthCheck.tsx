// components/admin/AdminAuthCheck.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { Loader2 } from "lucide-react";

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

export default function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait a bit for auth state to load
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!isAuthenticated) {
        // Not authenticated, redirect to home
        router.push("/");
        return;
      }

      if (user?.role !== "admin") {
        // Not an admin, redirect to home
        router.push("/");
        return;
      }

      // User is authenticated and is admin
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, user, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
          <p className="text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}