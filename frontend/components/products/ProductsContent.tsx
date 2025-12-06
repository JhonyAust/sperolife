"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Grid3x3,
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
  Filter,
  ArrowUpDown,
  Check,
  Package,
  ShoppingBag,
  Star,
  Clock,
  Zap,
  Tag,
  Percent
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/lib/redux/slices/productSlice";
import ProductCard from "@/components/products/ProductCard";

export default function ProductContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  
  // FIXED: Better Redux selector with proper fallbacks
  const productsState = useSelector((state) => state.product || {});
  const { 
    products = [], 
    loading = false, 
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalProducts: 0,
      limit: 12
    },
    error = null
  } = productsState;

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [activeFilterSection, setActiveFilterSection] = useState("category");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState("newest");
  const [quickFilters, setQuickFilters] = useState({
    featured: false,
    newArrival: false,
    bestSeller: false,
    onSale: false,
    hotDeals: false,
  });

  // FIXED: Use ref to prevent duplicate API calls
  const lastFetchParams = useRef(null);

  const categories = [
    { 
      name: "Men", 
      value: "men",
      subcategories: ["Shirts", "T-Shirts", "Shacket", "Jackets", "Hoodies", "Pants", "Jeans", "Shoes", "Combo"]
    },
    { 
      name: "Women", 
      value: "women",
      subcategories: ["Dresses", "Tops", "Pants", "Skirts", "Jackets", "Shoes", "Bags","Combo"]
    },
    { 
      name: "Kids", 
      value: "kids",
      subcategories: ["Boys", "Girls", "Infants", "Shoes", "Accessories"]
    },
    { 
      name: "Accessories", 
      value: "accessories",
      subcategories: ["Bags", "Watches", "Belts", "Wallets", "Sunglasses", "Hats"]
    },
    { 
      name: "Footwear", 
      value: "footwear",
      subcategories: ["Sneakers", "Boots", "Sandals", "Formal Shoes", "Sports Shoes"]
    },
  ];

  const sortOptions = [
    { label: "Newest First", value: "newest", icon: <Clock className="w-4 h-4" /> },
    { label: "Price: Low to High", value: "price_asc", icon: <TrendingUp className="w-4 h-4" /> },
    { label: "Price: High to Low", value: "price_desc", icon: <TrendingDown className="w-4 h-4" /> },
    { label: "Most Popular", value: "popular", icon: <Star className="w-4 h-4" /> },
    { label: "Best Rating", value: "rating", icon: <Sparkles className="w-4 h-4" /> },
    { label: "Biggest Discount", value: "discount", icon: <Percent className="w-4 h-4" /> },
  ];

  const availableSubcategories = categories.find(
    cat => cat.value === selectedCategory
  )?.subcategories || [];

  const getSortField = (sort) => {
    const sortMap = {
      newest: "createdAt",
      price_asc: "price",
      price_desc: "price",
      popular: "sales",
      rating: "rating",
      discount: "discount",
    };
    return sortMap[sort] || "createdAt";
  };

  const getSortOrder = (sort) => {
    return sort === "price_asc" ? "asc" : "desc";
  };

  // ✅ Function to update URL with current filters
  const updateURL = (updates = {}) => {
    const params = new URLSearchParams(searchParams);
    
    // Remove all filter params first
    params.delete('category');
    params.delete('subCategory');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('featured');
    params.delete('newArrival');
    params.delete('bestSeller');
    params.delete('hotDeals');
    params.delete('onSale');
    params.delete('sort');
    
    // Apply current filters with updates
    const finalCategory = updates.category !== undefined ? updates.category : selectedCategory;
    const finalSubCategory = updates.subCategory !== undefined ? updates.subCategory : selectedSubCategory;
    const finalSortBy = updates.sortBy !== undefined ? updates.sortBy : sortBy;
    const finalPriceRange = updates.priceRange !== undefined ? updates.priceRange : priceRange;
    const finalQuickFilters = updates.quickFilters !== undefined ? updates.quickFilters : quickFilters;
    
    if (finalCategory) {
      params.set('category', finalCategory);
    }
    if (finalSubCategory) {
      params.set('subCategory', finalSubCategory);
    }
    if (finalSortBy) {
      params.set('sort', finalSortBy);
    }
    
    // Price range
    if (finalPriceRange[0] > 0) {
      params.set('minPrice', finalPriceRange[0].toString());
    }
    if (finalPriceRange[1] < 50000) {
      params.set('maxPrice', finalPriceRange[1].toString());
    }
    
    // Quick filters
    if (finalQuickFilters.featured) params.set('featured', 'true');
    if (finalQuickFilters.newArrival) params.set('newArrival', 'true');
    if (finalQuickFilters.bestSeller) params.set('bestSeller', 'true');
    if (finalQuickFilters.onSale) params.set('onSale', 'true');
    if (finalQuickFilters.hotDeals) params.set('hotDeals', 'true');
    
    // Keep search param if exists
    const search = searchParams.get('search');
    if (search) {
      params.set('search', search);
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    router.replace(newUrl, { scroll: false });
  };

  // ✅ FIXED: Client-side filtering to handle sale products properly
  const getFilteredProducts = () => {
    let filtered = Array.isArray(products) ? [...products] : [];

    // Apply client-side onSale filter
    if (quickFilters.onSale) {
      filtered = filtered.filter(product => 
        product.salePrice && product.salePrice < product.price
      );
    }
    if (quickFilters.hotDeals) {
    filtered = filtered.filter(product => product.isHotDeals === true);
  }

    // Apply client-side price range filter using effective price (salePrice or regular price)
    filtered = filtered.filter(product => {
      const effectivePrice = product.salePrice || product.price;
      return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
    });

    // Apply client-side discount sorting
    if (sortBy === "discount") {
      filtered.sort((a, b) => {
        const discountA = a.salePrice ? ((a.price - a.salePrice) / a.price) * 100 : 0;
        const discountB = b.salePrice ? ((b.price - b.salePrice) / b.price) * 100 : 0;
        return discountB - discountA;
      });
    }

    return filtered;
  };

  // ✅ FIXED: Single useEffect for initialization and fetching
  useEffect(() => {
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const newArrival = searchParams.get('newArrival');
    const bestSeller = searchParams.get('bestSeller');
    const hotDeals = searchParams.get('hotDeals');
    const onSale = searchParams.get('onSale');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Update state
    setSelectedCategory(category ? category.toLowerCase() : "");
    setSelectedSubCategory(subCategory ? subCategory.toLowerCase() : "");
    setSearchQuery(search || "");
    setSortBy(sort || "newest");
    setPriceRange([
      minPrice ? parseInt(minPrice) : 0,
      maxPrice ? parseInt(maxPrice) : 50000
    ]);
    setQuickFilters({
      featured: featured === 'true',
      newArrival: newArrival === 'true',
      bestSeller: bestSeller === 'true',
      onSale: onSale === 'true',
       hotDeals: hotDeals === 'true',
    });

    // Build params directly from URL (don't wait for state)
    const params = {
      page: 1,
      limit: 100,
    };

    if (search?.trim()) {
      params.search = search.trim();
    }
    
    if (category) {
      params.category = category.toLowerCase();
    }
    
    if (subCategory) {
      params.subCategory = subCategory.toLowerCase();
    }
    
    // Quick filters (except onSale - handled client-side)
    if (featured === 'true') params.isFeatured = 'true';
    if (newArrival === 'true') params.isNewArrival = 'true';
    if (bestSeller === 'true') params.isBestSeller = 'true';
    if (hotDeals === 'true') params.isHotDeals = 'true';
    
    // Sorting (except discount - handled client-side)
    const sortValue = sort || "newest";
    if (sortValue !== "discount") {
      params.sortBy = getSortField(sortValue);
      params.order = getSortOrder(sortValue);
    }

    const paramsString = JSON.stringify(params);
    if (lastFetchParams.current === paramsString) {
      return;
    }

    lastFetchParams.current = paramsString;
    console.log('📤 Fetching products with params:', params);
    
    dispatch(fetchProducts(params));
  }, [searchParams, dispatch]);

  const clearAllFilters = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setPriceRange([0, 50000]);
    setSortBy("newest");
    setQuickFilters({ featured: false, newArrival: false, bestSeller: false, onSale: false ,hotDeals: false  });
    
    const search = searchParams.get('search');
    const params = new URLSearchParams();
    if (search) {
      params.set('search', search);
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    router.replace(newUrl, { scroll: false });
  };

  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) +
    (selectedSubCategory ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0) +
    Object.values(quickFilters).filter(Boolean).length;

  // ✅ FIXED: Use filtered products
  const displayProducts = getFilteredProducts();
  const productsCount = displayProducts.length;

  // ✅ Calculate sale stats
  const saleProductsCount = displayProducts.filter(p => p.salePrice && p.salePrice < p.price).length;
  const hotDealsCount = displayProducts.filter(p => p.isHotDeals).length;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#FD0002] rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-gray-200 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          {/* Filter and View Mode Row */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg ${
                showFilters 
                  ? "bg-gradient-to-r from-[#FD0002] to-red-600 text-white shadow-[#FD0002]/30" 
                  : "bg-white border-2 border-gray-200 text-gray-900 hover:border-[#FD0002] hover:shadow-xl"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#FD0002] text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
              <button 
                onClick={() => setViewMode("grid")} 
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  viewMode === "grid" 
                    ? "bg-white text-[#FD0002] shadow-md scale-105" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode("list")} 
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  viewMode === "list" 
                    ? "bg-white text-[#FD0002] shadow-md scale-105" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1"></div>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 hover:border-[#FD0002] bg-white font-semibold text-sm transition-all text-gray-900 hover:shadow-lg">
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">Sort:</span>
                <span className="text-[#FD0002] font-bold">
                  {sortOptions.find((opt) => opt.value === sortBy)?.label.split(":")[0] || "Newest"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden z-50">
                {sortOptions.map((option) => (
                  <button 
                    key={option.value} 
                    onClick={() => {
                      setSortBy(option.value);
                      updateURL({ sortBy: option.value });
                    }} 
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      sortBy === option.value ? "bg-[#FD0002]/5 text-[#FD0002]" : "text-gray-700"
                    }`}
                  >
                    {option.icon}
                    <span className="font-medium text-sm">{option.label}</span>
                    {sortBy === option.value && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <QuickFilterChip 
                active={quickFilters.featured} 
                onClick={() => {
                  const newFilters = { ...quickFilters, featured: !quickFilters.featured };
                  setQuickFilters(newFilters);
                  updateURL({ quickFilters: newFilters });
                }} 
                icon={<Sparkles className="w-4 h-4" />} 
                label="Featured" 
                color="purple" 
              />
              <QuickFilterChip 
                active={quickFilters.newArrival} 
                onClick={() => {
                  const newFilters = { ...quickFilters, newArrival: !quickFilters.newArrival };
                  setQuickFilters(newFilters);
                  updateURL({ quickFilters: newFilters });
                }} 
                icon={<Zap className="w-4 h-4" />} 
                label="New" 
                color="blue" 
              />
              <QuickFilterChip 
                active={quickFilters.bestSeller} 
                onClick={() => {
                  const newFilters = { ...quickFilters, bestSeller: !quickFilters.bestSeller };
                  setQuickFilters(newFilters);
                  updateURL({ quickFilters: newFilters });
                }} 
                icon={<Star className="w-4 h-4" />} 
                label="Best Seller" 
                color="amber" 
              />
              <QuickFilterChip 
                active={quickFilters.onSale} 
                onClick={() => {
                  const newFilters = { ...quickFilters, onSale: !quickFilters.onSale };
                  setQuickFilters(newFilters);
                  updateURL({ quickFilters: newFilters });
                }} 
                icon={<Tag className="w-4 h-4" />} 
                label={`On Sale ${saleProductsCount > 0 ? `(${saleProductsCount})` : ''}`}
                color="red" 
              />
              <QuickFilterChip 
              active={quickFilters.hotDeals} 
              onClick={() => {
                const newFilters = { ...quickFilters, hotDeals: !quickFilters.hotDeals };
                setQuickFilters(newFilters);
                updateURL({ quickFilters: newFilters });
              }} 
              icon={<Sparkles className="w-4 h-4" />} 
              label={`Hot Deals ${hotDealsCount > 0 ? `(${hotDealsCount})` : ''}`}
              color="orange" 
            />
            </div>
          </div>

          {/* Active Filters */}
          {(activeFiltersCount > 0 || searchQuery) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-600">Active:</span>
              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-xs font-bold border border-blue-300 animate-fade-in">
                  <span>Search: "{searchQuery}"</span>
                </div>
              )}
              {selectedCategory && (
                <FilterTag 
                  label={categories.find((c) => c.value === selectedCategory)?.name} 
                  onRemove={() => { 
                    setSelectedCategory(""); 
                    setSelectedSubCategory(""); 
                    updateURL({ category: '', subCategory: '' });
                  }} 
                />
              )}
              {selectedSubCategory && (
                <FilterTag 
                  label={selectedSubCategory} 
                  onRemove={() => {
                    setSelectedSubCategory("");
                    updateURL({ subCategory: '' });
                  }} 
                />
              )}
              {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                <FilterTag 
                  label={`৳${priceRange[0]} - ৳${priceRange[1]}`}
                  onRemove={() => {
                    setPriceRange([0, 50000]);
                    updateURL({ priceRange: [0, 50000] });
                  }} 
                />
              )}
              {Object.entries(quickFilters).map(([key, value]) => 
                value && (
                  <FilterTag 
                    key={key} 
                    label={key.replace(/([A-Z])/g, " $1").trim()} 
                    onRemove={() => {
                      const newFilters = { ...quickFilters, [key]: false };
                      setQuickFilters(newFilters);
                      updateURL({ quickFilters: newFilters });
                    }} 
                  />
                )
              )}
              <button 
                onClick={clearAllFilters} 
                className="text-sm font-bold text-[#FD0002] hover:underline ml-2 transition-all hover:scale-105"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 relative">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`hidden lg:block transition-all duration-500 ${showFilters ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
            {showFilters && (
              <div className="sticky top-24 space-y-4">
                {/* Category Filter */}
                <FilterSection 
                  title="Category" 
                  icon={<Package className="w-5 h-5" />} 
                  isOpen={activeFilterSection === "category"} 
                  onToggle={() => setActiveFilterSection(activeFilterSection === "category" ? null : "category")}
                >
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button 
                        key={cat.value} 
                        onClick={() => { 
                          setSelectedCategory(cat.value); 
                          setSelectedSubCategory(""); 
                          updateURL({ category: cat.value, subCategory: '' });
                        }} 
                        className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                          selectedCategory === cat.value 
                            ? "bg-gradient-to-r from-[#FD0002] to-red-600 text-white shadow-lg scale-105" 
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Subcategory Filter */}
                {selectedCategory && availableSubcategories.length > 0 && (
                  <FilterSection 
                    title="Subcategory" 
                    icon={<Filter className="w-5 h-5" />} 
                    isOpen={activeFilterSection === "subcategory"} 
                    onToggle={() => setActiveFilterSection(activeFilterSection === "subcategory" ? null : "subcategory")}
                  >
                    <div className="space-y-2">
                      {availableSubcategories.map((sub) => (
                        <button 
                          key={sub} 
                          onClick={() => {
                            setSelectedSubCategory(sub.toLowerCase());
                            updateURL({ subCategory: sub.toLowerCase() });
                          }} 
                          className={`w-full text-left px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            selectedSubCategory === sub.toLowerCase() 
                              ? "bg-[#FD0002]/10 text-[#FD0002] border-2 border-[#FD0002]" 
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </FilterSection>
                )}

                {/* Price Range Filter */}
                <FilterSection 
                  title="Price Range" 
                  icon={<DollarSign className="w-5 h-5" />} 
                  isOpen={activeFilterSection === "price"} 
                  onToggle={() => setActiveFilterSection(activeFilterSection === "price" ? null : "price")}
                >
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Percent className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700">
                          Price shown includes sale discounts
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-gray-600">৳{priceRange[0]}</span>
                      <span className="text-[#FD0002]">৳{priceRange[1]}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="50000" 
                      step="500" 
                      value={priceRange[1]} 
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} 
                      onMouseUp={() => updateURL({ priceRange })}
                      onTouchEnd={() => updateURL({ priceRange })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FD0002]" 
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="number" 
                        value={priceRange[0]} 
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])} 
                        onBlur={() => updateURL({ priceRange })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-[#FD0002] focus:ring-2 focus:ring-[#FD0002]/20 outline-none text-gray-900" 
                        placeholder="Min" 
                      />
                      <input 
                        type="number" 
                        value={priceRange[1]} 
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])} 
                        onBlur={() => updateURL({ priceRange })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-[#FD0002] focus:ring-2 focus:ring-[#FD0002]/20 outline-none text-gray-900" 
                        placeholder="Max" 
                      />
                    </div>
                  </div>
                </FilterSection>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 via-[#FD0002] to-red-600 bg-clip-text text-transparent mb-2">
                  {searchQuery 
                    ? `Search results for "${searchQuery}"` 
                    : selectedCategory 
                      ? categories.find((c) => c.value === selectedCategory)?.name 
                      : "All Products"}
                </h1>
                <p className="text-sm text-gray-600 font-medium">
              {loading ? "Loading products..." : (
                <>
                  {productsCount} products available
                  {saleProductsCount > 0 && (
                    <span className="ml-2 text-red-600 font-bold">
                      • {saleProductsCount} on sale
                    </span>
                  )}
                  {hotDealsCount > 0 && (
                    <span className="ml-2 text-orange-600 font-bold">
                      • {hotDealsCount} hot deals
                    </span>
                  )}
                </>
              )}
            </p>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="text-center py-12 bg-red-50 rounded-3xl border-2 border-red-200 mb-6">
                <X className="w-16 h-16 mx-auto text-red-500 mb-3" />
                <h3 className="text-xl font-bold text-red-900 mb-2">Error Loading Products</h3>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-96 animate-pulse"
                  />
                ))}
              </div>
            ) : displayProducts.length > 0 ? (
              <>
                <div className={`grid gap-4 ${
                  viewMode === "grid" 
                    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" 
                    : "grid-cols-1"
                }`}>
                  {displayProducts.map((product, index) => (
                    <div 
                      key={product._id} 
                      className="animate-fade-in-up" 
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <ProductCard product={product} viewMode={viewMode} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-gray-200">
                <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6 font-medium">
                  {searchQuery || selectedCategory || selectedSubCategory || quickFilters.onSale
                    ? 'Try adjusting your filters or search query' 
                    : 'No products available at the moment'}
                </p>
                {(searchQuery || selectedCategory || selectedSubCategory || Object.values(quickFilters).some(Boolean)) && (
                  <button 
                    onClick={clearAllFilters} 
                    className="px-8 py-3 bg-gradient-to-r from-[#FD0002] to-red-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-fade-in backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-black text-gray-900">Filters</h3>
              <button 
                onClick={() => setShowFilters(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <FilterSection title="Category" icon={<Package className="w-5 h-5" />} isOpen={true}>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button 
                      key={cat.value} 
                      onClick={() => { 
                        setSelectedCategory(cat.value); 
                        setSelectedSubCategory(""); 
                      }} 
                      className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                        selectedCategory === cat.value 
                          ? "bg-gradient-to-r from-[#FD0002] to-red-600 text-white shadow-lg" 
                          : "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {selectedCategory && availableSubcategories.length > 0 && (
                <FilterSection title="Subcategory" icon={<Filter className="w-5 h-5" />} isOpen={true}>
                  <div className="space-y-2">
                    {availableSubcategories.map((sub) => (
                      <button 
                        key={sub} 
                        onClick={() => setSelectedSubCategory(sub.toLowerCase())} 
                        className={`w-full text-left px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          selectedSubCategory === sub.toLowerCase() 
                            ? "bg-[#FD0002]/10 text-[#FD0002] border-2 border-[#FD0002]" 
                            : "bg-white text-gray-700 border border-gray-200"
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </FilterSection>
              )}

              <FilterSection title="Price Range (৳)" icon={<DollarSign className="w-5 h-5" />} isOpen={true}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-gray-600">৳{priceRange[0]}</span>
                    <span className="text-[#FD0002]">৳{priceRange[1]}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50000" 
                    step="500" 
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FD0002]" 
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="number" 
                      value={priceRange[0]} 
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])} 
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-[#FD0002] outline-none" 
                      placeholder="Min" 
                    />
                    <input 
                      type="number" 
                      value={priceRange[1]} 
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])} 
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:border-[#FD0002] outline-none" 
                      placeholder="Max" 
                    />
                  </div>
                </div>
              </FilterSection>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button 
                onClick={clearAllFilters} 
                className="flex-1 py-3 rounded-xl border-2 border-gray-300 font-bold text-gray-900 hover:bg-gray-50 transition-all"
              >
                Clear All
              </button>
              <button 
                onClick={() => setShowFilters(false)} 
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FD0002] to-red-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

// Quick Filter Chip Component
function QuickFilterChip({ active, onClick, icon, label, color }) {
  const colors = {
    purple: "from-purple-500 to-purple-600 border-purple-400",
    blue: "from-blue-500 to-blue-600 border-blue-400",
    amber: "from-amber-500 to-amber-600 border-amber-400",
    red: "from-red-500 to-red-600 border-red-400",
    orange: "from-orange-500 to-orange-600 border-orange-400",
  };

  const inactiveColors = {
    purple: "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
    blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    amber: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    red: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    orange: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
  };

  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all duration-300 hover:scale-105 border-2 ${
        active 
          ? `bg-gradient-to-r ${colors[color]} text-white shadow-lg` 
          : inactiveColors[color]
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && <Check className="w-3.5 h-3.5" />}
    </button>
  );
}

// Filter Tag Component
function FilterTag({ label, onRemove }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#FD0002]/10 to-red-500/10 text-[#FD0002] rounded-full text-xs font-bold border border-[#FD0002]/30 animate-fade-in">
      <span className="capitalize">{label}</span>
      <button 
        onClick={onRemove} 
        className="hover:bg-[#FD0002]/20 rounded-full p-0.5 transition-all hover:scale-110"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// Filter Section Component
function FilterSection({ title, icon, isOpen, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button 
        onClick={onToggle} 
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#FD0002]/10 to-red-500/10 rounded-lg">
            {React.cloneElement(icon, { className: "w-5 h-5 text-[#FD0002]" })}
          </div>
          <span className="font-bold text-sm text-gray-900">{title}</span>
        </div>
        {onToggle && (
          <ChevronDown 
            className={`w-5 h-5 transition-transform duration-300 text-gray-500 ${
              isOpen ? "rotate-180" : ""
            }`} 
          />
        )}
      </button>
      {isOpen !== false && (
        <div className="px-4 pb-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}