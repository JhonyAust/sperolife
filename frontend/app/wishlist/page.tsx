"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { 
  Heart, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  Gift,
  Trash2,
  Package
} from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { 
  fetchWishlist, 
  clearWishlist,
  clearWishlistAsync,
  mergeGuestWishlist
} from "@/lib/redux/slices/wishlistSlice";
import { AppDispatch, RootState } from "@/lib/redux/store";
import api from "@/lib/api";

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isVisible, setIsVisible] = useState(false);
  const [hasMerged, setHasMerged] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items: wishlistItems, loading } = useSelector((state: RootState) => state.wishlist);

  // Load guest wishlist helper
  const loadGuestWishlist = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("guestWishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // Initialize wishlist on mount
  useEffect(() => {
    const initWishlist = async () => {
      if (isInitialized) return;

      if (isAuthenticated && user) {
        // For authenticated users
        const guestItems = loadGuestWishlist();
        if (guestItems.length > 0 && !hasMerged) {
          await dispatch(mergeGuestWishlist({ userId: user._id, items: guestItems }));
          setHasMerged(true);
        } else if (!hasMerged) {
          await dispatch(fetchWishlist(user._id));
        }
      } else {
        // For guest users - fetch products by IDs from localStorage
        const guestProductIds = loadGuestWishlist();
        
        if (guestProductIds.length > 0) {
          try {
            // Fetch all products and filter by saved IDs
            const { data } = await api.get('/products');
            
            if (data?.products) {
              const guestProducts = data.products.filter((product: any) => 
                guestProductIds.includes(product._id)
              );
              
              // Manually update Redux state
              dispatch({ 
                type: 'wishlist/setWishlist', 
                payload: guestProducts 
              });
            }
          } catch (error) {
            console.error('Error loading guest wishlist:', error);
          }
        }
      }
      
      setIsInitialized(true);
    };

    initWishlist();
  }, [isAuthenticated, user, dispatch, hasMerged, isInitialized]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClearWishlist = () => {
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      if (isAuthenticated && user) {
        dispatch(clearWishlistAsync(user._id));
      } else {
        dispatch(clearWishlist());
      }
    }
  };

  const wishlistCount = wishlistItems?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50/30 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(25)].map((_, i) => {
          const isHeart = i % 3 === 0;
          return (
            <div
              key={i}
              className={`absolute ${isHeart ? 'animate-float-heart' : 'animate-float-slow'}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: isHeart ? '18px' : '10px',
                opacity: isHeart ? 0.12 : 0.25,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
                color: i % 4 === 0 ? '#f43f5e' : i % 4 === 1 ? '#ec4899' : i % 4 === 2 ? '#f97316' : '#fbbf24'
              }}
            >
              {isHeart ? '❤️' : '✨'}
            </div>
          );
        })}
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        {/* Header Section */}
        <div className={`text-center mb-10 pt-4 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Animated Heart Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Pulse Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-rose-400/20 animate-ping-slow"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center animation-delay-500">
                <div className="w-32 h-32 rounded-full bg-rose-400/10 animate-ping-slow"></div>
              </div>
              
              {/* Heart Icon */}
              <div className="relative w-14 h-14 bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-xl animate-scale-in">
                <Heart className="w-7 h-7 text-white fill-white animate-heartbeat" strokeWidth={2} />
              </div>

              {/* Counter Badge */}
              {wishlistCount > 0 && (
                <div className="absolute -top-2 -right-2 w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg animate-bounce-in">
                  {wishlistCount}
                </div>
              )}
            </div>
          </div>

          {/* Title Section */}
          <div className="animate-fade-in animation-delay-300">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-rose-600 animate-pulse" />
              <span className="text-rose-600 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                Your Favorites
              </span>
              <Sparkles className="w-4 h-4 text-rose-600 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
              My Wishlist
            </h1>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
              {wishlistCount > 0
                ? `You have ${wishlistCount} amazing ${wishlistCount === 1 ? 'item' : 'items'} saved for later`
                : "Save your favorite items and never lose track of what you love"}
            </p>
          </div>
        </div>

        {/* Content Section */}
        {(loading || !isInitialized) ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600 font-medium">Loading your wishlist...</p>
          </div>
        ) : wishlistCount === 0 ? (
          /* Empty Wishlist State */
          <div className={`flex flex-col items-center justify-center py-16 sm:py-20 animate-fade-in ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
            {/* Animated Empty Icon */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
              <div className="relative bg-gradient-to-br from-white to-rose-50/50 rounded-full p-10 sm:p-12 border-2 border-rose-200/50 shadow-2xl backdrop-blur-sm">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-rose-300 stroke-2" />
              </div>
            </div>

            {/* Empty State Content */}
            <div className="text-center max-w-md px-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
                Your Wishlist is Empty
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8">
                Start exploring our amazing collection and save your favorite items. Click the heart icon on any product to add it here!
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/products")}
                  className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold group"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Start Shopping
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="mt-12 flex gap-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-rose-300 via-pink-300 to-purple-300 opacity-40 animate-bounce-subtle"
                  style={{ animationDelay: `${i * 150}ms` }}
                ></div>
              ))}
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className={`transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
            {/* Stats Card */}
            <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-rose-200/50 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">Your Collection</h3>
                    <p className="text-xs sm:text-sm text-slate-600">{wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} you absolutely love</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => router.push("/products")}
                    variant="outline"
                    className="flex-1 sm:flex-none border-2 border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 rounded-xl h-10 px-4 sm:px-5 font-semibold text-sm transition-all duration-300"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    <span className="hidden xs:inline">Explore More</span>
                    <span className="xs:hidden">More</span>
                  </Button>
                  {wishlistCount > 0 && (
                    <Button
                      onClick={handleClearWishlist}
                      variant="outline"
                      className="border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 rounded-xl h-10 px-4 font-semibold text-sm transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid with Staggered Animation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from(new Map(wishlistItems.map(item => [item._id, item])).values()).map((product: any, index: number) => (
                    <div
                    key={product._id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                    >
                    <ProductCard product={product} />
                    </div>
                ))}
                </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(12px); }
          50% { transform: translateY(-40px) translateX(-12px); }
          75% { transform: translateY(-20px) translateX(12px); }
        }

        @keyframes float-heart {
          0%, 100% { transform: translateY(0px) scale(1); }
          25% { transform: translateY(-15px) scale(1.08); }
          50% { transform: translateY(-30px) scale(1); }
          75% { transform: translateY(-15px) scale(0.92); }
        }

        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 1; }
          80%, 100% { transform: scale(1.4); opacity: 0; }
        }

        @keyframes scale-in {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.12) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          10%, 30% { transform: scale(1.08); }
          20% { transform: scale(0.96); }
        }

        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.85; }
        }

        .animate-float-slow { animation: float-slow ease-in-out infinite; }
        .animate-float-heart { animation: float-heart ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-scale-in { animation: scale-in 0.6s ease-out; }
        .animate-heartbeat { animation: heartbeat 1.4s ease-in-out infinite; }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out 0.3s backwards; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; opacity: 0; }
        .animate-bounce-subtle { animation: bounce-subtle 1.8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 2.5s ease-in-out infinite; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-500 { animation-delay: 0.5s; }
      `}</style>
    </div>
  );
}