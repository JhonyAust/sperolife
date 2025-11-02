import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  firebaseUid?: string;
}

interface UserStats {
  totalUsers: number;
  newUsersThisWeek: number;
  newUsersLastWeek: number;
  percentChange: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: {
    user: number;
    admin: number;
  };
  registrationsByDay: Array<{
    date: string;
    count: number;
  }>;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}

interface AdminState {
  users: User[];
  selectedUser: User | null;
  userStats: UserStats | null;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    role: string;
    isActive: string;
    page: number;
    limit: number;
  };
}

const initialState: AdminState = {
  users: [],
  selectedUser: null,
  userStats: null,
  pagination: null,
  loading: false,
  error: null,
  filters: {
    search: "",
    role: "",
    isActive: "",
    page: 1,
    limit: 10,
  },
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Get all users with filters
export const getAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async (filters?: Partial<AdminState["filters"]>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.role) params.append("role", filters.role);
      if (filters?.isActive) params.append("isActive", filters.isActive);

      const { data } = await api.get(`/admin/users?${params.toString()}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

// Get user statistics
export const getUserStats = createAsyncThunk(
  "admin/getUserStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/users/stats");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user statistics"
      );
    }
  }
);

// Get single user
export const getUserById = createAsyncThunk(
  "admin/getUserById",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user details"
      );
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async (
    { userId, userData }: { userId: string; userData: Partial<User> },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}`, userData);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user"
      );
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/users/${userId}`);
      return { ...data, userId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete user"
      );
    }
  }
);

// Toggle user status
export const toggleUserStatus = createAsyncThunk(
  "admin/toggleUserStatus",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle-status`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user status"
      );
    }
  }
);

// Bulk delete users
export const bulkDeleteUsers = createAsyncThunk(
  "admin/bulkDeleteUsers",
  async (userIds: string[], { rejectWithValue }) => {
    try {
      const { data } = await api.post("/admin/users/bulk-delete", { userIds });
      return { ...data, userIds };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete users"
      );
    }
  }
);

// Export users
export const exportUsers = createAsyncThunk(
  "admin/exportUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/users/export");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to export users"
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    // Update filters
    setFilters: (state, action: PayloadAction<Partial<AdminState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear selected user
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    // Get all users
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get user stats
    builder
      .addCase(getUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.userStats = action.payload.data;
        state.error = null;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get user by ID
    builder
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload.data;
        state.error = null;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.data;
        // Update in users array
        const index = state.users.findIndex((u) => u._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        // Update selected user if it's the same
        if (state.selectedUser?._id === updatedUser._id) {
          state.selectedUser = updatedUser;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u._id !== action.payload.userId);
        if (state.selectedUser?._id === action.payload.userId) {
          state.selectedUser = null;
        }
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle user status
    builder
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.data;
        const index = state.users.findIndex((u) => u._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.selectedUser?._id === updatedUser._id) {
          state.selectedUser = updatedUser;
        }
        state.error = null;
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Bulk delete users
    builder
      .addCase(bulkDeleteUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkDeleteUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(
          (u) => !action.payload.userIds.includes(u._id)
        );
        state.error = null;
      })
      .addCase(bulkDeleteUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Export users
    builder
      .addCase(exportUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportUsers.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(exportUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, resetFilters, clearError, clearSelectedUser } =
  adminSlice.actions;

export default adminSlice.reducer;