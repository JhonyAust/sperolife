// lib/redux/slices/adminOrderSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

interface OrderItem {
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
  updatedBy?: {
    _id: string;
    name: string;
  };
}

interface Order {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
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
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  pendingRevenue: number;
  recentOrders: number;
  paymentMethodStats: Array<{
    _id: string;
    count: number;
    total: number;
  }>;
}

interface AdminOrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  stats: OrderStats | null;
  filters: {
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    search: string;
    startDate: string;
    endDate: string;
    sortBy: string;
    sortOrder: string;
  };
}

const initialState: AdminOrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  actionLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
    limit: 20
  },
  stats: null,
  filters: {
    status: 'all',
    paymentStatus: 'all',
    paymentMethod: 'all',
    search: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Fetch all orders with filters
export const fetchAllOrders = createAsyncThunk(
  "adminOrder/fetchAll",
  async (params: {
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const { data } = await api.get(`/admin/orders?${queryParams.toString()}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

// Fetch single order
export const fetchOrderById = createAsyncThunk(
  "adminOrder/fetchById",
  async (orderId: string, { rejectWithValue }) => {
    try {
      console.log('📡 Redux - Fetching order:', orderId);
      const { data } = await api.get(`/admin/orders/${orderId}`);
      console.log('✅ Redux - Order received:', data.order?.orderNumber);
      return data.order;
    } catch (error: any) {
      console.error('❌ Redux - Fetch error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch order");
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "adminOrder/updateStatus",
  async (params: {
    orderId: string;
    status: string;
    note?: string;
    trackingNumber?: string;
    courierService?: string;
  }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/orders/${params.orderId}/status`, {
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

// Update payment status
export const updatePaymentStatus = createAsyncThunk(
  "adminOrder/updatePaymentStatus",
  async (params: {
    orderId: string;
    paymentStatus: string;
    note?: string;
  }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/orders/${params.orderId}/payment-status`, {
        paymentStatus: params.paymentStatus,
        note: params.note
      });
      return data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update payment status");
    }
  }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  "adminOrder/cancel",
  async (params: { orderId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/orders/${params.orderId}/cancel`, {
        reason: params.reason
      });
      return data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to cancel order");
    }
  }
);

// Delete order
export const deleteOrder = createAsyncThunk(
  "adminOrder/delete",
  async (params: { orderId: string; permanent?: boolean }, { rejectWithValue }) => {
    try {
      const queryParams = params.permanent ? '?permanent=true' : '';
      await api.delete(`/admin/orders/${params.orderId}${queryParams}`);
      return params.orderId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete order");
    }
  }
);

// Update admin notes
export const updateOrderNotes = createAsyncThunk(
  "adminOrder/updateNotes",
  async (params: { orderId: string; adminNotes: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/admin/orders/${params.orderId}/notes`, {
        adminNotes: params.adminNotes
      });
      return data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update notes");
    }
  }
);

// Fetch order statistics
export const fetchOrderStats = createAsyncThunk(
  "adminOrder/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/orders/stats");
      return data.stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch statistics");
    }
  }
);

// Download invoice
export const downloadInvoice = createAsyncThunk(
  "adminOrder/downloadInvoice",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return orderId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to download invoice");
    }
  }
);

// Bulk update orders
export const bulkUpdateOrders = createAsyncThunk(
  "adminOrder/bulkUpdate",
  async (params: { orderIds: string[]; status: string; note?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/admin/orders/bulk-update", params);
      return data.orders;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update orders");
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const adminOrderSlice = createSlice({
  name: "adminOrder",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch All Orders
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Order By ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Order Status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedOrder = action.payload;
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Update Payment Status
    builder
      .addCase(updatePaymentStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedOrder = action.payload;
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Cancel Order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedOrder = action.payload;
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Delete Order
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.orders = state.orders.filter(order => order._id !== action.payload);
        if (state.selectedOrder?._id === action.payload) {
          state.selectedOrder = null;
        }
        state.pagination.total -= 1;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Update Notes
    builder
      .addCase(updateOrderNotes.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateOrderNotes.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedOrder = action.payload;
        const index = state.orders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrderNotes.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Stats
    builder
      .addCase(fetchOrderStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Download Invoice
    builder
      .addCase(downloadInvoice.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(downloadInvoice.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(downloadInvoice.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Bulk Update
    builder
      .addCase(bulkUpdateOrders.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(bulkUpdateOrders.fulfilled, (state, action) => {
        state.actionLoading = false;
        action.payload.forEach((updatedOrder: Order) => {
          const index = state.orders.findIndex(order => order._id === updatedOrder._id);
          if (index !== -1) {
            state.orders[index] = updatedOrder;
          }
        });
      })
      .addCase(bulkUpdateOrders.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  setFilters, 
  resetFilters, 
  clearSelectedOrder, 
  clearError,
  setPage 
} = adminOrderSlice.actions;

export default adminOrderSlice.reducer;