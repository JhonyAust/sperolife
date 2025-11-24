import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

interface Address {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  selectedAddress: null,
  loading: false,
  error: null
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Fetch user addresses
export const fetchAddresses = createAsyncThunk(
  "address/fetchAll",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/address/${userId}`);
      return data.addresses;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch addresses");
    }
  }
);

// Create address
export const createAddress = createAsyncThunk(
  "address/create",
  async (addressData: {
    userId: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    notes?: string;
    isDefault?: boolean;
  }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/address", addressData);
      return data.address;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create address");
    }
  }
);

// Update address
export const updateAddress = createAsyncThunk(
  "address/update",
  async (params: {
    addressId: string;
    userId: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    notes?: string;
    isDefault?: boolean;
  }, { rejectWithValue }) => {
    try {
      const { addressId, ...addressData } = params;
      const { data } = await api.put(`/address/${addressId}`, addressData);
      return data.address;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update address");
    }
  }
);

// Delete address
export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (params: { addressId: string; userId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/address/${params.addressId}`, {
        data: { userId: params.userId }
      });
      return params.addressId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete address");
    }
  }
);

// Set default address
export const setDefaultAddress = createAsyncThunk(
  "address/setDefault",
  async (params: { addressId: string; userId: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/address/${params.addressId}/default`, {
        userId: params.userId
      });
      return data.address;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to set default address");
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    selectAddress: (state, action: PayloadAction<Address>) => {
      state.selectedAddress = action.payload;
    },
    clearSelectedAddress: (state) => {
      state.selectedAddress = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Addresses
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
        // Auto-select default address if exists
        const defaultAddress = action.payload.find((addr: Address) => addr.isDefault);
        if (defaultAddress && !state.selectedAddress) {
          state.selectedAddress = defaultAddress;
        }
        state.error = null;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Address
    builder
      .addCase(createAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.push(action.payload);
        // If it's the only address or marked as default, select it
        if (state.addresses.length === 1 || action.payload.isDefault) {
          state.selectedAddress = action.payload;
        }
        state.error = null;
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Address
    builder
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex(addr => addr._id === action.payload._id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        if (state.selectedAddress?._id === action.payload._id) {
          state.selectedAddress = action.payload;
        }
      });

    // Delete Address
    builder
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(addr => addr._id !== action.payload);
        if (state.selectedAddress?._id === action.payload) {
          state.selectedAddress = state.addresses[0] || null;
        }
      });

    // Set Default Address
    builder
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        // Update all addresses - remove default from others
        state.addresses = state.addresses.map(addr => ({
          ...addr,
          isDefault: addr._id === action.payload._id
        }));
        state.selectedAddress = action.payload;
      });
  }
});

export const { selectAddress, clearSelectedAddress, clearError } = addressSlice.actions;
export default addressSlice.reducer;