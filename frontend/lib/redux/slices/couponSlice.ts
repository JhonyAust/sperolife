import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { toast } from 'sonner';

// Fetch all coupons (Admin)
export const fetchCoupons = createAsyncThunk(
  'coupon/fetchCoupons',
  async ({ status, search, sort } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      
      const { data } = await api.get(`/coupon/admin?${params.toString()}`);
      return data.coupons;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupons');
    }
  }
);

// Fetch coupon statistics
export const fetchCouponStats = createAsyncThunk(
  'coupon/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/coupon/admin/stats');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

// Create new coupon
export const createCoupon = createAsyncThunk(
  'coupon/createCoupon',
  async (couponData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/coupon/admin', couponData);
      toast.success('Coupon created successfully!');
      return data.coupon;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create coupon';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update coupon
export const updateCoupon = createAsyncThunk(
  'coupon/updateCoupon',
  async ({ id, couponData }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/coupon/admin/${id}`, couponData);
      toast.success('Coupon updated successfully!');
      return data.coupon;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update coupon';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete coupon
export const deleteCoupon = createAsyncThunk(
  'coupon/deleteCoupon',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/coupon/admin/${id}`);
      toast.success('Coupon deleted successfully!');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete coupon';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Toggle coupon status
export const toggleCouponStatus = createAsyncThunk(
  'coupon/toggleStatus',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/coupon/admin/${id}/toggle-status`);
      toast.success(data.message);
      return data.coupon;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to toggle coupon status';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Apply coupon (Checkout)
export const applyCoupon = createAsyncThunk(
  'coupon/applyCoupon',
  async ({ couponCode, orderAmount, userId, cartItems }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/coupon/validate', {
        couponCode,
        orderAmount,
        userId,
        cartItems,
      });
      toast.success('Coupon applied successfully!');
      return data.coupon;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to apply coupon';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const couponSlice = createSlice({
  name: 'coupon',
  initialState: {
    coupons: [],
    stats: {
      total: 0,
      active: 0,
      expired: 0,
      inactive: 0,
    },
    mostUsed: [],
    recent: [],
    appliedCoupon: null,
    loading: false,
    error: null,
    filters: {
      status: 'all',
      search: '',
      sort: '-createdAt',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Stats
      .addCase(fetchCouponStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCouponStats.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the response structure correctly
        if (action.payload.stats) {
          state.stats = action.payload.stats;
        }
        state.mostUsed = action.payload.mostUsed || [];
        state.recent = action.payload.recent || [];
      })
      .addCase(fetchCouponStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Keep default stats on error
        state.stats = {
          total: 0,
          active: 0,
          expired: 0,
          inactive: 0,
        };
      })
      
      // Create Coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons.unshift(action.payload);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Coupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.coupons.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = state.coupons.filter(c => c._id !== action.payload);
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle Status
      .addCase(toggleCouponStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleCouponStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.coupons.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      })
      .addCase(toggleCouponStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Apply Coupon
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.appliedCoupon = action.payload;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.appliedCoupon = null;
      });
  },
});

export const { setFilters, clearAppliedCoupon, clearError } = couponSlice.actions;
export default couponSlice.reducer;