// frontend/lib/redux/slices/adminAnnouncementSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Types
interface Announcement {
  _id: string;
  text: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  backgroundColor?: string;
  textColor?: string;
  icon?: string;
  link?: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementStats {
  totalAnnouncements: number;
  activeAnnouncements: number;
  inactiveAnnouncements: number;
  scheduledAnnouncements: number;
  linkedAnnouncements: number;
}

interface AnnouncementState {
  announcements: Announcement[];
  selectedAnnouncement: Announcement | null;
  announcementStats: AnnouncementStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnnouncementState = {
  announcements: [],
  selectedAnnouncement: null,
  announcementStats: null,
  loading: false,
  error: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Create announcement
export const createAnnouncement = createAsyncThunk(
  "adminAnnouncement/create",
  async (announcementData: Partial<Announcement>, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/admin/announcements", announcementData);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create announcement"
      );
    }
  }
);

// Get all announcements
export const getAllAnnouncements = createAsyncThunk(
  "adminAnnouncement/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/announcements");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch announcements"
      );
    }
  }
);

// Get announcement statistics
export const getAnnouncementStats = createAsyncThunk(
  "adminAnnouncement/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/announcements/stats");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch announcement statistics"
      );
    }
  }
);

// Get single announcement
export const getAnnouncementById = createAsyncThunk(
  "adminAnnouncement/getById",
  async (announcementId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/announcements/${announcementId}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch announcement"
      );
    }
  }
);

// Update announcement
export const updateAnnouncement = createAsyncThunk(
  "adminAnnouncement/update",
  async (
    { announcementId, announcementData }: { announcementId: string; announcementData: Partial<Announcement> },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/admin/announcements/${announcementId}`, announcementData);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update announcement"
      );
    }
  }
);

// Delete announcement
export const deleteAnnouncement = createAsyncThunk(
  "adminAnnouncement/delete",
  async (announcementId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/announcements/${announcementId}`);
      return { ...data, announcementId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete announcement"
      );
    }
  }
);

// Toggle announcement status
export const toggleAnnouncementStatus = createAsyncThunk(
  "adminAnnouncement/toggleStatus",
  async (announcementId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/announcements/${announcementId}/toggle-status`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update announcement status"
      );
    }
  }
);

// Reorder announcements
export const reorderAnnouncements = createAsyncThunk(
  "adminAnnouncement/reorder",
  async (announcementIds: string[], { rejectWithValue }) => {
    try {
      const { data } = await api.patch("/admin/announcements/reorder", { announcementIds });
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reorder announcements"
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const adminAnnouncementSlice = createSlice({
  name: "adminAnnouncement",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedAnnouncement: (state) => {
      state.selectedAnnouncement = null;
    },
    setSelectedAnnouncement: (state, action: PayloadAction<Announcement>) => {
      state.selectedAnnouncement = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Create announcement
    builder
      .addCase(createAnnouncement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements.push(action.payload.data);
        state.error = null;
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get all announcements
    builder
      .addCase(getAllAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload.data;
        state.error = null;
      })
      .addCase(getAllAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get announcement stats
    builder
      .addCase(getAnnouncementStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAnnouncementStats.fulfilled, (state, action) => {
        state.loading = false;
        state.announcementStats = action.payload.data;
      })
      .addCase(getAnnouncementStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get announcement by ID
    builder
      .addCase(getAnnouncementById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAnnouncementById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAnnouncement = action.payload.data;
      })
      .addCase(getAnnouncementById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update announcement
    builder
      .addCase(updateAnnouncement.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAnnouncement = action.payload.data;
        const index = state.announcements.findIndex((a) => a._id === updatedAnnouncement._id);
        if (index !== -1) {
          state.announcements[index] = updatedAnnouncement;
        }
        if (state.selectedAnnouncement?._id === updatedAnnouncement._id) {
          state.selectedAnnouncement = updatedAnnouncement;
        }
      })
      .addCase(updateAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete announcement
    builder
      .addCase(deleteAnnouncement.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = state.announcements.filter((a) => a._id !== action.payload.announcementId);
        if (state.selectedAnnouncement?._id === action.payload.announcementId) {
          state.selectedAnnouncement = null;
        }
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle status
    builder
      .addCase(toggleAnnouncementStatus.fulfilled, (state, action) => {
        const updatedAnnouncement = action.payload.data;
        const index = state.announcements.findIndex((a) => a._id === updatedAnnouncement._id);
        if (index !== -1) {
          state.announcements[index] = updatedAnnouncement;
        }
      });

    // Reorder announcements
    builder
      .addCase(reorderAnnouncements.fulfilled, (state, action) => {
        state.announcements = action.payload.data;
      });
  },
});

export const {
  clearError,
  clearSelectedAnnouncement,
  setSelectedAnnouncement,
} = adminAnnouncementSlice.actions;

export default adminAnnouncementSlice.reducer;