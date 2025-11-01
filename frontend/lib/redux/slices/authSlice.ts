// frontend/lib/redux/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import api from "@/lib/api";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  guestId: string | null;
  loading: boolean;
  error: string | null;
}

// Generate guest ID
const generateGuestId = () => {
  return `guest_${Math.random().toString(36).substring(7)}_${Date.now()}`;
};

// Load initial state from localStorage
const loadAuthState = (): Partial<AuthState> => {
  if (typeof window === "undefined") return {};
  
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const guestId = localStorage.getItem("guestId") || generateGuestId();
  
  if (!localStorage.getItem("guestId")) {
    localStorage.setItem("guestId", guestId);
  }
  
  return {
    token,
    user: userStr ? JSON.parse(userStr) : null,
    isAuthenticated: !!token,
    isGuest: !token,
    guestId,
  };
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isGuest: true,
  guestId: null,
  loading: false,
  error: null,
  ...loadAuthState(),
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Register user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// Login user
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      
      // Save to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("guestId");
      
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

// Google login
export const loginWithGoogle = createAsyncThunk(
  "auth/googleLogin",
  async (_, { rejectWithValue }) => {
    try {
      // Firebase Google sign-in
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Send token to backend
      const { data } = await api.post("/auth/google", { idToken });
      
      // Save to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("guestId");
      
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Google login failed"
      );
    }
  }
);

// Logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
      
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Generate new guest ID
      const newGuestId = generateGuestId();
      localStorage.setItem("guestId", newGuestId);
      
      return { guestId: newGuestId };
    } catch (error: any) {
      // Still clear local data even if API call fails
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      const newGuestId = generateGuestId();
      localStorage.setItem("guestId", newGuestId);
      
      return { guestId: newGuestId };
    }
  }
);

// Forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reset email"
      );
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { token, password }: { token: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post("/auth/reset-password", {
        token,
        password,
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

// Verify user (check if token is still valid)
export const verifyUser = createAsyncThunk(
  "auth/verify",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/verify");
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      
      return data;
    } catch (error: any) {
      // Clear invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      return rejectWithValue("Session expired");
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set guest ID manually
    setGuestId: (state, action: PayloadAction<string>) => {
      state.guestId = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("guestId", action.payload);
      }
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isGuest = false;
        state.guestId = null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Google Login
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isGuest = false;
        state.guestId = null;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isGuest = true;
        state.guestId = action.payload.guestId;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        // Still clear user data
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isGuest = true;
      });

    // Verify User
    builder
      .addCase(verifyUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isGuest = false;
      })
      .addCase(verifyUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isGuest = true;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setGuestId, clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;