// frontend/lib/redux/slices/adminBannerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Types
interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  linkText?: string;
  position: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  createdAt: string;
  updatedAt: string;
}

interface BannerStats {
  totalBanners: number;
  activeBanners: number;
  inactiveBanners: number;
  scheduledBanners: number;
}

interface BannerState {
  banners: Banner[];
  selectedBanner: Banner | null;
  bannerStats: BannerStats | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

const initialState: BannerState = {
  banners: [],
  selectedBanner: null,
  bannerStats: null,
  loading: false,
  uploading: false,
  error: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Upload banner image
export const uploadBannerImage = createAsyncThunk(
  "adminBanner/uploadImage",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("my_file", file);

      const { data } = await api.post("/admin/banners/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload image"
      );
    }
  }
);

// Create banner
export const createBanner = createAsyncThunk(
  "adminBanner/create",
  async (bannerData: Partial<Banner>, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/admin/banners", bannerData);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create banner"
      );
    }
  }
);

// Get all banners
export const getAllBanners = createAsyncThunk(
  "adminBanner/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/banners");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch banners"
      );
    }
  }
);

// Get banner statistics
export const getBannerStats = createAsyncThunk(
  "adminBanner/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/banners/stats");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch banner statistics"
      );
    }
  }
);

// Get single banner
export const getBannerById = createAsyncThunk(
  "adminBanner/getById",
  async (bannerId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/banners/${bannerId}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch banner"
      );
    }
  }
);

// Update banner
export const updateBanner = createAsyncThunk(
  "adminBanner/update",
  async (
    { bannerId, bannerData }: { bannerId: string; bannerData: Partial<Banner> },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/admin/banners/${bannerId}`, bannerData);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update banner"
      );
    }
  }
);

// Delete banner
export const deleteBanner = createAsyncThunk(
  "adminBanner/delete",
  async (bannerId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/banners/${bannerId}`);
      return { ...data, bannerId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete banner"
      );
    }
  }
);

// Toggle banner status
export const toggleBannerStatus = createAsyncThunk(
  "adminBanner/toggleStatus",
  async (bannerId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/banners/${bannerId}/toggle-status`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update banner status"
      );
    }
  }
);

// Reorder banners
export const reorderBanners = createAsyncThunk(
  "adminBanner/reorder",
  async (bannerIds: string[], { rejectWithValue }) => {
    try {
      const { data } = await api.patch("/admin/banners/reorder", { bannerIds });
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reorder banners"
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const adminBannerSlice = createSlice({
  name: "adminBanner",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedBanner: (state) => {
      state.selectedBanner = null;
    },
    setSelectedBanner: (state, action: PayloadAction<Banner>) => {
      state.selectedBanner = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Upload image
    builder
      .addCase(uploadBannerImage.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadBannerImage.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(uploadBannerImage.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      });

    // Create banner
    builder
      .addCase(createBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners.push(action.payload.data);
        state.error = null;
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get all banners
    builder
      .addCase(getAllBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.data;
        state.error = null;
      })
      .addCase(getAllBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get banner stats
    builder
      .addCase(getBannerStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBannerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.bannerStats = action.payload.data;
      })
      .addCase(getBannerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get banner by ID
    builder
      .addCase(getBannerById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBannerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBanner = action.payload.data;
      })
      .addCase(getBannerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update banner
    builder
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBanner = action.payload.data;
        const index = state.banners.findIndex((b) => b._id === updatedBanner._id);
        if (index !== -1) {
          state.banners[index] = updatedBanner;
        }
        if (state.selectedBanner?._id === updatedBanner._id) {
          state.selectedBanner = updatedBanner;
        }
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete banner
    builder
      .addCase(deleteBanner.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = state.banners.filter((b) => b._id !== action.payload.bannerId);
        if (state.selectedBanner?._id === action.payload.bannerId) {
          state.selectedBanner = null;
        }
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle status
    builder
      .addCase(toggleBannerStatus.fulfilled, (state, action) => {
        const updatedBanner = action.payload.data;
        const index = state.banners.findIndex((b) => b._id === updatedBanner._id);
        if (index !== -1) {
          state.banners[index] = updatedBanner;
        }
      });

    // Reorder banners
    builder
      .addCase(reorderBanners.fulfilled, (state, action) => {
        state.banners = action.payload.data;
      });
  },
});

export const {
  clearError,
  clearSelectedBanner,
  setSelectedBanner,
} = adminBannerSlice.actions;

export default adminBannerSlice.reducer;