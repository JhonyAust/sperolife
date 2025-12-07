"use client";

import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { 
  updateQuantity, 
  removeFromCart,
  updateCartItemDB,
  removeFromCartDB 
} from "@/lib/redux/slices/cartSlice";
import { useState } from "react";

interface CartItemContentProps {
  cartItem: {
    _id: string;
    product: string;
    name: string;
    price: number;
    image: string;
    size: string;
    quantity: number;
    subCategory: string;
    stock: number;
  };
}

export default function CartItemContent({ cartItem }: CartItemContentProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // 🔥 FIX: Check if this is a guest cart item (custom ID format) or DB item (MongoDB ObjectId)
  const isGuestCartItem = cartItem._id.includes('-'); // Guest IDs are like "productId-size"
  
  const handleUpdateQuantity = async (type: "plus" | "minus") => {
    const newQuantity = type === "plus" ? cartItem.quantity + 1 : cartItem.quantity - 1;

    // Prevent going below 1
    if (newQuantity < 1) {
      return;
    }

    // Check stock limit for increment
    if (type === "plus" && newQuantity > cartItem.stock) {
      alert(`Only ${cartItem.stock} items available in stock`);
      return;
    }

    setIsUpdating(true);

    try {
      if (isAuthenticated && user && !isGuestCartItem) {
        // 🔥 FIX: Only call DB API for authenticated users with DB cart items
        await dispatch(updateCartItemDB({ 
          userId: user._id, 
          itemId: cartItem._id, 
          quantity: newQuantity 
        })).unwrap();
      } else {
        // 🔥 FIX: For guest cart or local items, always use local update
        dispatch(updateQuantity({ id: cartItem._id, quantity: newQuantity }));
      }
    } catch (error: any) {
      console.error("Failed to update quantity:", error);
      // If DB update fails, try local update as fallback
      dispatch(updateQuantity({ id: cartItem._id, quantity: newQuantity }));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);

    try {
      if (isAuthenticated && user && !isGuestCartItem) {
        // 🔥 FIX: Only call DB API for authenticated users with DB cart items
        await dispatch(removeFromCartDB({ 
          userId: user._id, 
          itemId: cartItem._id 
        })).unwrap();
      } else {
        // 🔥 FIX: For guest cart or local items, always use local removal
        dispatch(removeFromCart(cartItem._id));
      }
    } catch (error: any) {
      console.error("Failed to remove item:", error);
      // If DB removal fails, try local removal as fallback
      dispatch(removeFromCart(cartItem._id));
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex items-start gap-4 p-3 border rounded-xl bg-white hover:shadow-md transition-shadow duration-300">
      <img
        src={cartItem.image || "/placeholder.jpg"}
        alt={cartItem.name}
        className="w-20 h-24 object-cover rounded-lg flex-shrink-0"
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Title and Remove Button */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 truncate" title={cartItem.name}>
              {cartItem.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Size: {cartItem.size}</p>
          </div>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRemoving ? (
              <div className="w-[18px] h-[18px] border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <X size={18} />
            )}
          </button>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-1 py-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cartItem.quantity === 1 || isUpdating}
              onClick={() => handleUpdateQuantity("minus")}
            >
              <Minus className="w-3 h-3 text-gray-900" />
            </Button>
            <span className="text-sm text-gray-900 font-semibold min-w-[20px] text-center">
              {isUpdating ? "..." : cartItem.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-green-100 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cartItem.quantity >= cartItem.stock || isUpdating}
              onClick={() => handleUpdateQuantity("plus")}
            >
              <Plus className="w-3 h-3 text-gray-900" />
            </Button>
          </div>
          
          {cartItem.subCategory !== "Sneakers" && cartItem.stock < 10 &&  (
            <span className="text-xs text-orange-600 font-medium">
              Only {cartItem.stock} left
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
        <p className="text-base font-bold text-red-600">
          ৳{((cartItem.salePrice || cartItem.price) * cartItem.quantity).toFixed(2)}
        </p>
        {cartItem.salePrice && cartItem.salePrice < cartItem.price && (
          <span className="text-xs text-gray-400 line-through">
            ৳{(cartItem.price * cartItem.quantity).toFixed(2)}
          </span>
        )}
</div>
      </div>
    </div>
  );
}