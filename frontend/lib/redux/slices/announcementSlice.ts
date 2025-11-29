// frontend/lib/redux/slices/announcementSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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

interface AnnouncementState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
}

const initialState: AnnouncementState = {
  announcements: [],
  loading: false,
  error: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Get active announcements
export const getActiveAnnouncements = createAsyncThunk(
  "announcement/getActive",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/announcements");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch announcements"
      );
    }
  }
);

// Get single announcement
export const getAnnouncementById = createAsyncThunk(
  "announcement/getById",
  async (announcementId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/announcements/${announcementId}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch announcement"
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const announcementSlice = createSlice({
  name: "announcement",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get active announcements
    builder
      .addCase(getActiveAnnouncements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.announcements = action.payload.data;
        state.error = null;
      })
      .addCase(getActiveAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get announcement by ID
    builder
      .addCase(getAnnouncementById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnnouncementById.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getAnnouncementById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = announcementSlice.actions;
export default announcementSlice.reducer;