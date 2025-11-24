import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { Product } from "@/types";

interface WishlistState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

// LocalStorage helpers
const WISHLIST_STORAGE_KEY = "guestWishlist";

const loadWishlistFromStorage = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading wishlist from storage:", error);
    return [];
  }
};

const saveWishlistToStorage = (productIds: string[]) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(productIds));
    } catch (error) {
      console.error("Error saving wishlist to storage:", error);
    }
  }
};

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Fetch wishlist (authenticated)
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/wishlist/${userId}`);
      return data.products || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch wishlist"
      );
    }
  }
);

// Toggle wishlist item (authenticated)
export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggle",
  async (
    { userId, productId }: { userId: string; productId: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/wishlist/toggle", { userId, productId });
      return data.products || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update wishlist"
      );
    }
  }
);

// Merge guest wishlist
export const mergeGuestWishlist = createAsyncThunk(
  "wishlist/merge",
  async (
    { userId, items }: { userId: string; items: string[] },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/wishlist/merge", { userId, productIds: items });
      return data.products || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to merge wishlist"
      );
    }
  }
);
export const clearWishlistAsync = createAsyncThunk(
  "wishlist/clear",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/wishlist/${userId}`);
      return data.products || [];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear wishlist"
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Guest wishlist actions (localStorage)
    addToWishlist: (state, action: PayloadAction<Product>) => {
      const exists = state.items.find((item) => item._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
        const productIds = state.items.map((item) => item._id);
        saveWishlistToStorage(productIds);
      }
    },

    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      const productIds = state.items.map((item) => item._id);
      saveWishlistToStorage(productIds);
    },

    clearWishlist: (state) => {
      state.items = [];
      saveWishlistToStorage([]);
    },

    setWishlist: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      const productIds = action.payload.map((item) => item._id);
      saveWishlistToStorage(productIds);
    },

    // Initialize guest wishlist from localStorage
    initializeGuestWishlist: (state, action: PayloadAction<Product[]>) => {
      const savedIds = loadWishlistFromStorage();
      state.items = action.payload.filter((product) => 
        savedIds.includes(product._id)
      );
    },
  },
  extraReducers: (builder) => {
    // Fetch Wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle Wishlist
    builder
      .addCase(toggleWishlistItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Merge Wishlist
    builder
      .addCase(mergeGuestWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(mergeGuestWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
        // Clear localStorage after successful merge
        if (typeof window !== "undefined") {
          localStorage.removeItem(WISHLIST_STORAGE_KEY);
        }
      })
      .addCase(mergeGuestWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
      builder
  .addCase(clearWishlistAsync.pending, (state) => {
    state.loading = true;
  })
  .addCase(clearWishlistAsync.fulfilled, (state, action) => {
    state.loading = false;
    state.items = [];
    state.error = null;
  })
  .addCase(clearWishlistAsync.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload as string;
  });
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlist,
  initializeGuestWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;