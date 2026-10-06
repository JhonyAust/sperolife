import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

interface OrderItem {
  isPreorder?: boolean;
  preorderNote?: string;
  product: string;
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color?: string;
}

interface AddressInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes?: string;
}

interface StatusHistory {
  status: string;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

interface Order {
  isPreorder?: boolean;
  _id: string;
  userId?: string;
  orderNumber: string;
  cartItems: OrderItem[];
  addressInfo: AddressInfo;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingCharge: number;
  shippingType: string;
  totalAmount: number;
  couponCode?: string;
  discountAmount: number;
  trackingNumber?: string;
  courierService?: string;
  adminNotes?: string;
  statusHistory: StatusHistory[];
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  userOrders: Order[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  stats: {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
  } | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  userOrders: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 0
  },
  stats: null
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Create order
export const createOrder = createAsyncThunk(
  "order/create",
  async (orderData: any, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/order", orderData);
      return data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create order");
    }
  }
);

// Get all orders (Admin)
export const fetchAllOrders = createAsyncThunk(
  "order/fetchAll",
  async (params: { status?: string; page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);

      const { data } = await api.get(`/order/admin/all?${queryParams.toString()}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

// Get user orders
export const fetchUserOrders = createAsyncThunk(
  "order/fetchUserOrders",
  async (params: { userId: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const { data } = await api.get(`/order/user/${params.userId}?${queryParams.toString()}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

// Get order by ID
export const fetchOrderById = createAsyncThunk(
  "order/fetchById",
  async (arg: string | { orderId: string; token?: string | null }, { rejectWithValue }) => {
    try {
      // Guests pass the access token returned when the order was placed
      const { orderId, token } = typeof arg === "string" ? { orderId: arg, token: null } : arg;
      const { data } = await api.get(`/order/${orderId}`, { params: token ? { token } : undefined });
      return data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "order/updateStatus",
  async (params: { orderId: string; status: string; note?: string; trackingNumber?: string; courierService?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/order/${params.orderId}/status`, {
        status: params.status,
        note: params.note,
        trackingNumber: params.trackingNumber,
        courierService: params.courierService
      });
      return data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update order status");
    }
  }
);

// Update admin notes
export const updateOrderNotes = createAsyncThunk(
  "order/updateNotes",
  async (params: { orderId: string; adminNotes: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/order/${params.orderId}/notes`, {
        adminNotes: params.adminNotes
      });
      return data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update notes");
    }
  }
);

// Delete order
export const deleteOrder = createAsyncThunk(
  "order/delete",
  async (orderId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/order/${orderId}`);
      return orderId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete order");
    }
  }
);

// Get order statistics
export const fetchOrderStats = createAsyncThunk(
  "order/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/order/admin/stats");
      return data.stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch statistics");
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch All Orders
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch User Orders
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload.orders;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Order By ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Order Status
    builder
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });

    // Update Order Notes
    builder
      .addCase(updateOrderNotes.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      });

    // Delete Order
    builder
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter(order => order._id !== action.payload);
        if (state.currentOrder?._id === action.payload) {
          state.currentOrder = null;
        }
      });

    // Fetch Stats
    builder
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { clearCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer;