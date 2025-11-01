// ============================================================================
// Helper Hooks - frontend/hooks/useCart.ts
// ============================================================================
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

import { 
  addToCart, 
  removeFromCart, 
  updateQuantity,
  addToCartDB,
  removeFromCartDB,
  updateCartItemDB,
  fetchCartItems
} from "@/lib/redux/slices/cartSlice";
import { toast } from "sonner";

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { items, total, loading } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const addItem = async (item: any) => {
    try {
      if (isAuthenticated && user) {
        await dispatch(addToCartDB({
          userId: user._id,
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })).unwrap();
      } else {
        dispatch(addToCart(item));
      }
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      if (isAuthenticated && user) {
        await dispatch(removeFromCartDB({ userId: user._id, itemId })).unwrap();
      } else {
        dispatch(removeFromCart(itemId));
      }
      toast.success("Removed from cart");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove from cart");
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    try {
      if (isAuthenticated && user) {
        await dispatch(updateCartItemDB({ userId: user._id, itemId, quantity })).unwrap();
      } else {
        dispatch(updateQuantity({ id: itemId, quantity }));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update quantity");
    }
  };

  return {
    items,
    total,
    loading,
    addItem,
    removeItem,
    updateItemQuantity,
  };
};