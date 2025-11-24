// frontend/lib/redux/slices/productSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Types
interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  category: string;
  subCategory?: string;
  brand?: string;
  images: string[];
  hasSizeVariants: boolean;
  sizeVariants?: Array<{
    size: string;
    stock: number;
    price?: number;
    salePrice?: number;
    sku?: string;
  }>;
  stock: number;
  rating: number;
  reviewCount: number;
  tags?: string[];
  features?: string[];
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  views: number;
  sales: number;
  weight?: number;
  metaTitle?: string;
  metaDescription?: string;
  discountPercentage?: number;
  totalStock?: number;
  inStock?: boolean;
  stockStatus?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    minPrice: number;
    maxPrice: number;
    search: string;
    sortBy: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    limit: number;
  };
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  selectedProduct: null,
  loading: false,
  error: null,
  filters: {
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    search: "",
    sortBy: "createdAt",
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12,
  },
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

// Get all products (with filters)
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (
    params: {
      page?: number;
      limit?: number;
      category?: string;
      subCategory?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      sortBy?: string;
      order?: string;
      isFeatured?: boolean | string;
      isNewArrival?: boolean | string;
      isBestSeller?: boolean | string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.category) queryParams.append("category", params.category);
      if (params.subCategory) queryParams.append("subCategory", params.subCategory);
      if (params.minPrice !== undefined) queryParams.append("minPrice", params.minPrice.toString());
      if (params.maxPrice !== undefined) queryParams.append("maxPrice", params.maxPrice.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.order) queryParams.append("order", params.order);
      if (params.isFeatured) queryParams.append("isFeatured", "true");
      if (params.isNewArrival) queryParams.append("isNewArrival", "true");
      if (params.isBestSeller) queryParams.append("isBestSeller", "true");

      const url = `/products?${queryParams.toString()}`;
      console.log('🔗 Fetching products from:', url);
      
      const { data } = await api.get(url);
      
      console.log('📦 Products API Response:', data);
      
      return data;
    } catch (error: any) {
      console.error('❌ Fetch products error:', error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// Get featured products
export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeatured",
  async (limit: number = 8, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/featured?limit=${limit}`);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch featured products"
      );
    }
  }
);

// Get single product by slug - FIXED!
export const fetchProductBySlug = createAsyncThunk(
  "products/fetchBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching product by slug:', slug);
      
      // Try primary endpoint first: /products/slug/:slug
      let response;
      try {
        response = await api.get(`/products/slug/${slug}`);
        console.log('✅ Product found via /products/slug/:slug');
      } catch (error: any) {
        // Fallback to alternative endpoint: /products/:slug
        if (error.response?.status === 404) {
          console.log('⚠️ Trying alternative endpoint: /products/:slug');
          response = await api.get(`/products/${slug}`);
          console.log('✅ Product found via /products/:slug');
        } else {
          throw error;
        }
      }
      
      console.log('📦 Product data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Fetch product by slug error:', error);
      return rejectWithValue(
        error.response?.data?.message || "Product not found"
      );
    }
  }
);

// Get related products
export const fetchRelatedProducts = createAsyncThunk(
  "products/fetchRelated",
  async (
    { productId, limit = 4 }: { productId: string; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      console.log('🔗 Fetching related products for:', productId);
      const { data } = await api.get(
        `/products/${productId}/related?limit=${limit}`
      );
      console.log('✅ Related products:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Fetch related products error:', error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch related products"
      );
    }
  }
);

// Get products by category
export const fetchProductsByCategory = createAsyncThunk(
  "products/fetchByCategory",
  async (
    { category, page = 1, limit = 12 }: { category: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/products/category/${category}?page=${page}&limit=${limit}`
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  "products/search",
  async (
    { query, page = 1, limit = 12 }: { query: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get(
        `/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search products"
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.error = null;
    },
    setFilters: (
      state,
      action: PayloadAction<{
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
        sortBy?: string;
      }>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch featured products
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload.products || [];
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch product by slug - IMPROVED ERROR HANDLING
    builder
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedProduct = null; // Clear previous product
        console.log('⏳ Fetching product by slug...');
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload.product;
        state.error = null;
        console.log('✅ Product loaded successfully:', action.payload.product?.name);
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.selectedProduct = null;
        console.error('❌ Failed to load product:', action.payload);
      });

    // Fetch related products
    builder
      .addCase(fetchRelatedProducts.pending, (state) => {
        // Don't set loading for related products
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        // Related products are handled in the component
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        console.error('Failed to fetch related products:', action.payload);
      });

    // Fetch products by category
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search products
    builder
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedProduct, setFilters, clearFilters } =
  productSlice.actions;

export default productSlice.reducer;