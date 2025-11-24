"use client";

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  getAllProducts,
  getProductStats,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  uploadProductImage,
} from '@/lib/redux/slices/adminProductSlice';
import { 
  Package, Plus, Search, Filter, Grid, List, Loader2, 
  Sparkles, TrendingUp, AlertCircle, BarChart3, 
  ArrowUpDown, Download, RefreshCw, Boxes, DollarSign
} from 'lucide-react';

// Import the new components
import AdminProductCard from '@/components/admin/AdminProductCard';
import AdminProductModal from '@/components/admin/AminProductModal';

export default function AdminProductsPage() {
  const dispatch = useAppDispatch();
  const { products, productStats, pagination, loading, uploading } = useAppSelector(
    (state) => state.adminProduct
  );

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
    dispatch(getProductStats());
  }, [dispatch]);

  const loadProducts = () => {
    dispatch(getAllProducts({ 
      limit: 12,
      search,
      category: categoryFilter,
      isActive: statusFilter,
      sortBy,
      order: sortOrder,
    }));
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProducts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, categoryFilter, statusFilter, sortBy, sortOrder]);

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        alert('Product deleted successfully');
        loadProducts();
        dispatch(getProductStats());
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await dispatch(toggleProductStatus(id)).unwrap();
      loadProducts();
    } catch (error) {
      alert('Failed to update product status');
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const result = await dispatch(uploadProductImage(file)).unwrap();
      return result.result.secure_url;
    } catch (error) {
      throw new Error('Failed to upload image');
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedProduct) {
        await dispatch(updateProduct({
          productId: selectedProduct._id,
          productData: formData
        })).unwrap();
        alert('Product updated successfully! ✨');
      } else {
        await dispatch(createProduct(formData)).unwrap();
        alert('Product created successfully! 🎉');
      }
      setIsModalOpen(false);
      setSelectedProduct(null);
      loadProducts();
      dispatch(getProductStats());
    } catch (error: any) {
      alert(error || 'Failed to save product');
    }
  };

  const stats = [
    { 
      label: 'Total Products', 
      value: productStats?.totalProducts || 0, 
      icon: Package, 
      color: 'from-purple-500 to-fuchsia-500',
      bgColor: 'from-purple-50 to-fuchsia-50',
      textColor: 'text-purple-600'
    },
    { 
      label: 'Active Products', 
      value: productStats?.activeProducts || 0, 
      icon: TrendingUp, 
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      textColor: 'text-green-600'
    },
    { 
      label: 'Low Stock Items', 
      value: productStats?.lowStock || 0, 
      icon: AlertCircle, 
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      textColor: 'text-orange-600'
    },
    { 
      label: 'Inventory Value', 
      value: `৳${(productStats?.inventoryValue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-600'
    },
  ];

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto" />
          <p className="text-gray-600 font-bold text-lg">Loading your amazing products...</p>
          <div className="flex gap-2 justify-center">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-fuchsia-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-fuchsia-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-2 h-16 bg-gradient-to-b from-purple-600 via-fuchsia-600 to-pink-600 rounded-full shadow-lg"></div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
              <span className="text-sm font-black text-purple-600 uppercase tracking-wider">
                Inventory Management System
              </span>
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-fuchsia-800 bg-clip-text text-transparent">
              Products Dashboard
            </h1>
            <p className="text-gray-600 font-medium mt-1">
              Manage your product catalog with ease
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white font-black rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1"
          >
            <Plus className="w-6 h-6" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-bold mb-2 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-8 h-8 ${stat.textColor}`} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
                <span>Updated just now</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="space-y-4">
          {/* Primary Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name, brand, or description..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
              />
            </div>
            
            <div className="flex gap-3">
              {/* Filter Toggle */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 border-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  showFilters 
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md' : 'hover:bg-gray-200'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md' : 'hover:bg-gray-200'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={loadProducts}
                className="p-3 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
                >
                  <option value="">All Categories</option>
                  {productStats?.categories?.map((cat: any) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
                  >
                    <option value="createdAt">Date Added</option>
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                    <option value="sales">Sales</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2.5 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    <ArrowUpDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Display */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-lg border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Boxes className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-3">No products found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {search || categoryFilter || statusFilter 
              ? "Try adjusting your filters or search terms"
              : "Get started by adding your first product to the inventory"}
          </p>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black rounded-2xl hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            Add Your First Product
          </button>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "space-y-4"
          }>
            {products.map((product: any) => (
              <AdminProductCard
                key={product._id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-sm text-gray-600 font-semibold">
                Showing {products.length} of {pagination.totalProducts} products
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => dispatch(getAllProducts({ page, limit: 12 }))}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      pagination.currentPage === page
                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg scale-110'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Product Modal */}
      <AdminProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleSave}
        uploading={uploading}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
}