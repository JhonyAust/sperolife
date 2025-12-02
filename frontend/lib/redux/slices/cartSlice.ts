import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

// LocalStorage helpers
const CART_STORAGE_KEY = "guestCart";

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading cart from storage:", error);
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart to storage:", error);
    }
  }
};

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  total: 0,
  loading: false,
  error: null,
};
initialState.total = calculateTotal(initialState.items);

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Fetch cart items (authenticated users)
export const fetchCartItems = createAsyncThunk(
  "cart/fetchItems",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/cart/${userId}`);
      // ✅ FIX: Backend returns data.cart.items, not data.items
      return data.cart?.items || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
    }
  }
);

// Add item to cart (authenticated)
export const addToCartDB = createAsyncThunk(
  "cart/addToDB",
  async (
    {
      userId,
      productId,
      quantity,
      subCategory,
      size,
      color,
    }: {
      userId: string;
      productId: string;
      quantity: number;
      subCategory: string;
      size: string;
      color?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/cart", {
        userId,
        productId,
        quantity,
        subCategory,
        size,
        color,
      });
      // ✅ FIX: Return cart.items
      return data.cart?.items || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add to cart");
    }
  }
);

// Update cart item quantity (authenticated)
export const updateCartItemDB = createAsyncThunk(
  "cart/updateDB",
  async (
    { userId, itemId, quantity }: { userId: string; itemId: string; quantity: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { userId, quantity });
      // ✅ FIX: Return cart.items
      return data.cart?.items || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update cart");
    }
  }
);

// Remove item from cart (authenticated)
export const removeFromCartDB = createAsyncThunk(
  "cart/removeFromDB",
  async ({ userId, itemId }: { userId: string; itemId: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`, { data: { userId } });
      // ✅ FIX: Return cart.items
      return data.cart?.items || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove from cart");
    }
  }
);

// Clear cart (authenticated)
export const clearCartDB = createAsyncThunk(
  "cart/clearDB",
  async (userId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/cart/${userId}/clear`);
      return [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to clear cart");
    }
  }
);

// Merge guest cart with user cart
export const mergeGuestCart = createAsyncThunk(
  "cart/merge",
  async (
    { userId, items }: { userId: string; items: CartItem[] },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/cart/merge", { userId, items });
      // ✅ FIX: Backend returns data.cart.items, not data.items
      return data.cart?.items || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to merge cart");
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
 addToCart: (state, action: PayloadAction<CartItem>) => {
    // 🔥 FIX: Find existing item by matching product ID and size
    const existingItem = state.items.find(
      (item) =>
        item.product === action.payload.product &&
        item.size === action.payload.size
    );

    if (existingItem) {
      // 🔥 FIX: Check stock limit before increasing quantity
      const maxQuantity = action.payload.stock || 999;
      const newQuantity = existingItem.quantity + action.payload.quantity;
      
      if (newQuantity <= maxQuantity) {
        existingItem.quantity = newQuantity;
      } else {
        // Don't add more than available stock
        existingItem.quantity = maxQuantity;
        console.warn(`Cannot add more. Only ${maxQuantity} items available in stock.`);
      }
    } else {
      // Add new item to cart
      state.items.push(action.payload);
    }

    state.total = calculateTotal(state.items);
    saveCartToStorage(state.items);
  },

  removeFromCart: (state, action: PayloadAction<string>) => {
    // 🔥 FIX: Filter out the specific item by ID
    const itemToRemove = state.items.find(item => item._id === action.payload);
    
    if (itemToRemove) {
      console.log("Removing item:", itemToRemove.name, "ID:", action.payload);
      state.items = state.items.filter((item) => item._id !== action.payload);
      state.total = calculateTotal(state.items);
      saveCartToStorage(state.items);
    } else {
      console.warn("Item not found for removal:", action.payload);
    }
  },

  updateQuantity: (
    state,
    action: PayloadAction<{ id: string; quantity: number }>
  ) => {
    // 🔥 FIX: Find and update the specific item
    const item = state.items.find((item) => item._id === action.payload.id);
    
    if (item) {
      console.log("Updating quantity for:", item.name, "from", item.quantity, "to", action.payload.quantity);
      
      // Ensure quantity doesn't exceed stock
      const newQuantity = Math.min(action.payload.quantity, item.stock);
      item.quantity = Math.max(1, newQuantity); // At least 1
      
      state.total = calculateTotal(state.items);
      saveCartToStorage(state.items);
    } else {
      console.warn("Item not found for quantity update:", action.payload.id);
    }
  },

  clearCart: (state) => {
    state.items = [];
    state.total = 0;
    saveCartToStorage([]);
  },

  setCart: (state, action: PayloadAction<CartItem[]>) => {
    state.items = action.payload;
    state.total = calculateTotal(action.payload);
    saveCartToStorage(action.payload);
  },
},
  extraReducers: (builder) => {
    // Fetch Cart
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.total = calculateTotal(action.payload);
        state.error = null;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add to Cart DB
    builder
      .addCase(addToCartDB.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCartDB.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.total = calculateTotal(action.payload);
        state.error = null;
      })
      .addCase(addToCartDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Cart DB
    builder
      .addCase(updateCartItemDB.fulfilled, (state, action) => {
        state.items = action.payload;
        state.total = calculateTotal(action.payload);
      });

    // Remove from Cart DB
    builder
      .addCase(removeFromCartDB.fulfilled, (state, action) => {
        state.items = action.payload;
        state.total = calculateTotal(action.payload);
      });

    // Clear Cart DB
    builder
      .addCase(clearCartDB.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
      });

    // Merge Cart
    builder
      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.total = calculateTotal(action.payload);
        // Clear localStorage after merge
        if (typeof window !== "undefined") {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCart,
} = cartSlice.actions;

export default cartSlice.reducer;