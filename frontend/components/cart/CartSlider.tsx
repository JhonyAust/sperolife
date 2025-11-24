// components/cart/CartSlider.tsx
"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowRight, Sparkles, Package, X } from "lucide-react";
import { MdRemoveShoppingCart } from "react-icons/md";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppSelector } from "@/lib/redux/hooks";
import CartItemContent from "./CartItemContent";

interface CartSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSlider({ isOpen, onClose }: CartSliderProps) {
  const router = useRouter();
  const { items: cartItems } = useAppSelector((state) => state.cart);

  const totalCartAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md flex flex-col h-full bg-gradient-to-b from-white to-slate-50/30 border-l border-slate-200/50 p-0">
        {/* Modern Header with Gradient */}
        <SheetHeader className="relative pb-4 border-b border-slate-200/50 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-700 rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                {cartItems.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md animate-bounce-subtle">
                    {cartItems.length}
                  </div>
                )}
              </div>
              <div>
                <SheetTitle className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Shopping Cart
                </SheetTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {cartItems.length > 0 ? `${cartItems.length} item${cartItems.length > 1 ? 's' : ''}` : 'Empty cart'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </SheetHeader>

        {cartItems.length > 0 ? (
          <>
            {/* Cart Items with Custom Scrollbar */}
            <div className="mt-6 space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 px-6">
              {cartItems.map((item, index) => (
                <div
                  key={item._id}
                  className="animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CartItemContent cartItem={item} />
                </div>
              ))}
            </div>

            {/* Subtotal Section with Modern Design */}
            <div className="mt-6 space-y-4 pt-4 border-t border-slate-200/50 px-6 pb-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 border border-slate-200/50 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Subtotal
                  </span>
                  <span className="text-xs text-slate-500">{cartItems.length} items</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-slate-800">Total</span>
                  <div className="text-right">
                    <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-700 bg-clip-text text-transparent">
                      ৳{totalCartAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modern Checkout Button with Hover Effect */}
              <Button
                onClick={handleCheckout}
                className="w-full h-11 text-white btn-primary rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              </Button>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
                <div className="w-1.5 h-1.5 sm:h-2 sm:w-2 bg-green-600 rounded-full animate-pulse"></div>
                <span>Secure checkout guaranteed</span>
              </div>
            </div>
          </>
        ) : (
          /* Empty Cart State with Modern Design */
          <div className="flex flex-col items-center justify-center flex-1 text-center px-6 animate-fade-in">
            {/* Animated Empty Cart Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-pink-100 rounded-full blur-2xl opacity-50 animate-pulse-slow"></div>
              <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-full p-8 border-2 border-slate-200/50 shadow-lg">
                <MdRemoveShoppingCart className="w-24 h-24 text-slate-300" />
              </div>
            </div>

            {/* Empty State Text */}
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Your cart is empty
            </h3>
            <p className="text-xs text-slate-500 mb-8 max-w-xs leading-relaxed">
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>

            {/* Return to Shop Button */}
            <Button
              onClick={() => {
                router.push("/products");
                onClose();
              }}
              className="bg-gradient-to-r from-red-600 to-pink-700 text-white hover:from-red-700 hover:to-pink-800 h-10 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold text-sm group"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Start Shopping
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>

            {/* Decorative Elements */}
            <div className="mt-8 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-red-300 to-pink-300 opacity-30"
                  style={{ animationDelay: `${i * 200}ms` }}
                ></div>
              ))}
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes slide-in {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes bounce-subtle {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }

          @keyframes pulse-slow {
            0%, 100% {
              opacity: 0.5;
            }
            50% {
              opacity: 0.8;
            }
          }

          .animate-slide-in {
            animation: slide-in 0.4s ease-out forwards;
            opacity: 0;
          }

          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }

          .animate-bounce-subtle {
            animation: bounce-subtle 2s ease-in-out infinite;
          }

          .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #dc2626, #ec4899);
            border-radius: 10px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #b91c1c, #db2777);
          }
        `}</style>
      </SheetContent>
    </Sheet>
  );
}