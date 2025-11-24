// frontend/lib/redux/slices/adminProductSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Types
interface SizeVariant {
  size: string;
  stock: number;
  price?: number;
  salePrice?: number;
  sku?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string; // SKU for non-variant products
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  category: string;
  subCategory?: string;
  brand?: string;
  images: string[];
  youtubeLink?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  tags?: string[];
  features?: string[];
  isActive: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  views?: number;
  sales?: number;
  discountPercentage?: number;
  stockStatus?: string;
  hasSizeVariants?: boolean;
  sizeVariants?: SizeVariant[];
  totalStock?: number;
  weight?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStock: number;
  lowStock: number;
  categories: Array<{ name: string; count: number }>;
  pricing: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
  };
  inventoryValue: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  productStats: ProductStats | null;
  pagination: Pagination | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
  filters: {
    search: string;
    category: string;
    isActive: string;
    sortBy: string;
    order: string;
    page: number;
    limit: number;
  };
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  productStats: null,
  pagination: null,
  loading: false,
  uploading: false,
  error: null,
  filters: {
    search: "",
    category: "",
    isActive: "",
    sortBy: "createdAt",
    order: "desc",
    page: 1,
    limit: 12,
  },
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Upload product image
export const uploadProductImage = createAsyncThunk(
  "adminProduct/uploadImage",
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("my_file", file);

      const { data } = await api.post("/admin/products/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload image"
      );
    }
  }
);

// Create product
export const createProduct = createAsyncThunk(
  "adminProduct/create",
  async (productData: Partial<Product>, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/admin/products", productData);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }
);

// Get all products
export const getAllProducts = createAsyncThunk(
  "adminProduct/getAll",
  async (filters?: Partial<ProductState["filters"]>, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.isActive) params.append("isActive", filters.isActive);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.order) params.append("order", filters.order);

      const { data } = await api.get(`/admin/products?${params.toString()}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// Get product statistics
export const getProductStats = createAsyncThunk(
  "adminProduct/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/products/stats");
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product statistics"
      );
    }
  }
);

// Get single product by ID
export const getProductById = createAsyncThunk(
  "adminProduct/getById",
  async (productId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/products/${productId}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product"
      );
    }
  }
);

// Get product by SKU
export const getProductBySKU = createAsyncThunk(
  "adminProduct/getBySKU",
  async (sku: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/products/sku/${sku}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product by SKU"
      );
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  "adminProduct/update",
  async (
    { productId, productData }: { productId: string; productData: Partial<Product> },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put(`/admin/products/${productId}`, productData);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "adminProduct/delete",
  async (productId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin/products/${productId}`);
      return { ...data, productId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

// Toggle product status
export const toggleProductStatus = createAsyncThunk(
  "adminProduct/toggleStatus",
  async (productId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/products/${productId}/toggle-status`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product status"
      );
    }
  }
);

// Bulk delete products
export const bulkDeleteProducts = createAsyncThunk(
  "adminProduct/bulkDelete",
  async (productIds: string[], { rejectWithValue }) => {
    try {
      const { data } = await api.post("/admin/products/bulk-delete", { productIds });
      return { ...data, productIds };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete products"
      );
    }
  }
);

// Update product stock
export const updateProductStock = createAsyncThunk(
  "adminProduct/updateStock",
  async (
    { productId, stock }: { productId: string; stock: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.patch(`/admin/products/${productId}/stock`, { stock });
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update stock"
      );
    }
  }
);

// Update size variant stock
export const updateSizeVariantStock = createAsyncThunk(
  "adminProduct/updateSizeVariantStock",
  async (
    { productId, size, stock }: { productId: string; size: string; stock: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.patch(`/admin/products/${productId}/size-variant-stock`, { 
        size, 
        stock 
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update size variant stock"
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const adminProductSlice = createSlice({
  name: "adminProduct",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProductState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    setSelectedProduct: (state, action: PayloadAction<Product>) => {
      state.selectedProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Upload image
    builder
      .addCase(uploadProductImage.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadProductImage.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(uploadProductImage.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      });

    // Create product
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload.data);
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get all products
    builder
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get product stats
    builder
      .addCase(getProductStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductStats.fulfilled, (state, action) => {
        state.loading = false;
        state.productStats = action.payload.data;
      })
      .addCase(getProductStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get product by ID
    builder
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload.data;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get product by SKU
    builder
      .addCase(getProductBySKU.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductBySKU.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload.data;
      })
      .addCase(getProductBySKU.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload.data;
        const index = state.products.findIndex((p) => p._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
        if (state.selectedProduct?._id === updatedProduct._id) {
          state.selectedProduct = updatedProduct;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p._id !== action.payload.productId);
        if (state.selectedProduct?._id === action.payload.productId) {
          state.selectedProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle status
    builder
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        const updatedProduct = action.payload.data;
        const index = state.products.findIndex((p) => p._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
      });

    // Bulk delete
    builder
      .addCase(bulkDeleteProducts.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (p) => !action.payload.productIds.includes(p._id)
        );
      });

    // Update stock
    builder
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const updatedProduct = action.payload.data;
        const index = state.products.findIndex((p) => p._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
      });

    // Update size variant stock
    builder
      .addCase(updateSizeVariantStock.fulfilled, (state, action) => {
        const updatedProduct = action.payload.data;
        const index = state.products.findIndex((p) => p._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
      });
  },
});

export const {
  setFilters,
  resetFilters,
  clearError,
  clearSelectedProduct,
  setSelectedProduct,
} = adminProductSlice.actions;

export default adminProductSlice.reducer;