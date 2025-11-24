"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchCartItems } from "@/lib/redux/slices/cartSlice";
import { fetchWishlist } from "@/lib/redux/slices/wishlistSlice";

export function OptimizedDataLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loadUserData = async () => {
      // Only for authenticated users
      if (!isAuthenticated || !user) {
        console.log("👤 Guest user - using localStorage");
        return;
      }

      // ✅ Only load once per component mount (not per navigation)
      // But WILL reload on page refresh (which is what we want!)
      if (hasLoadedRef.current) {
        console.log("✅ Already loaded this mount - skipping");
        return;
      }

      console.log("🔄 Loading cart and wishlist from database...");

      try {
        // Load cart and wishlist in parallel (faster!)
        await Promise.all([
          dispatch(fetchCartItems(user._id)).unwrap(),
          dispatch(fetchWishlist(user._id)).unwrap()
        ]);
        
        hasLoadedRef.current = true;
        console.log("✅ Cart and wishlist loaded successfully!");
      } catch (error) {
        console.error("❌ Failed to load user data:", error);
      }
    };

    loadUserData();
  }, [isAuthenticated, user, dispatch]);

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated) {
      hasLoadedRef.current = false;
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}