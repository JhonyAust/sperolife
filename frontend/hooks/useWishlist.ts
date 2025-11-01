// ============================================================================
// Helper Hooks - frontend/hooks/useWishlist.ts
// ============================================================================
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { 
  addToWishlist, 
  removeFromWishlist,
  toggleWishlistItem,
  fetchWishlist
} from "@/lib/redux/slices/wishlistSlice";
import { toast } from "sonner";

export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const toggleItem = async (product: any) => {
    try {
      const isInWishlist = items.some((item) => item._id === product._id);

      if (isAuthenticated && user) {
        await dispatch(toggleWishlistItem({ 
          userId: user._id, 
          productId: product._id 
        })).unwrap();
        
        toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist");
      } else {
        if (isInWishlist) {
          dispatch(removeFromWishlist(product._id));
          toast.success("Removed from wishlist");
        } else {
          dispatch(addToWishlist(product));
          toast.success("Added to wishlist");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update wishlist");
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item._id === productId);
  };

  return {
    items,
    loading,
    toggleItem,
    isInWishlist,
  };
};