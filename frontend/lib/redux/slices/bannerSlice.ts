// frontend/lib/redux/slices/bannerSlice.ts
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

interface BannerState {
  banners: Banner[];
  loading: boolean;
  error: string | null;
}

const initialState: BannerState = {
  banners: [],
  loading: false,
  error: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Get active banners
export const getActiveBanners = createAsyncThunk(
  "banner/getActive",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/banners");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch banners"
      );
    }
  }
);

// Get single banner
export const getBannerById = createAsyncThunk(
  "banner/getById",
  async (bannerId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/banners/${bannerId}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch banner"
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get active banners
    builder
      .addCase(getActiveBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.data;
        state.error = null;
      })
      .addCase(getActiveBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get banner by ID
    builder
      .addCase(getBannerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBannerById.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getBannerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = bannerSlice.actions;
export default bannerSlice.reducer;
