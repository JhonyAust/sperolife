import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  userId?: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 0
  }
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Fetch all notifications
export const fetchNotifications = createAsyncThunk(
  "notification/fetchAll",
  async (params: { page?: number; limit?: number; isRead?: boolean }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());

      const { data } = await api.get(`/notifications?${queryParams.toString()}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch notifications");
    }
  }
);

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      return data.unreadCount;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch unread count");
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/notifications/${notificationId}/read`);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark as read");
    }
  }
);

// Mark all as read
export const markAllAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/notifications/read-all");
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark all as read");
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  "notification/delete",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete notification");
    }
  }
);

// Clear read notifications
export const clearReadNotifications = createAsyncThunk(
  "notification/clearRead",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/notifications/clear-read");
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to clear notifications");
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Unread Count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });

    // Mark as Read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload.notification._id);
        if (notification) {
          notification.isRead = true;
        }
        state.unreadCount = action.payload.unreadCount;
      });

    // Mark All as Read
    builder
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      });

    // Delete Notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
      });

    // Clear Read Notifications
    builder
      .addCase(clearReadNotifications.fulfilled, (state) => {
        state.notifications = state.notifications.filter(n => !n.isRead);
      });
  }
});

export const { addNotification, setUnreadCount, clearError } = notificationSlice.actions;
export default notificationSlice.reducer;