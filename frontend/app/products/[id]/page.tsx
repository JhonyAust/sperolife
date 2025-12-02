"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Heart, ShoppingCart, Share2, Star, Package, Truck, 
  Shield, ArrowLeft, ChevronRight, Play, X, Check,
  Zap, Eye, TrendingUp, Award, RefreshCw, Home, Sparkles, Plus, Minus
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/redux/slices/productSlice";
import { addToCart, addToCartDB } from "@/lib/redux/slices/cartSlice";
import { toggleWishlistItem, addToWishlist, removeFromWishlist } from "@/lib/redux/slices/wishlistSlice";

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  
  const { selectedProduct, loading } = useSelector((state: any) => ({
    selectedProduct: state?.product?.selectedProduct || null,
    loading: state?.product?.loading || false
  }));
  const { user, isAuthenticated } = useSelector((state: any) => state?.auth || {});

  const { items: wishlistItems = [] } = useSelector((state: any) => state?.wishlist || {});
  const { items: cartItems = [] } = useSelector((state: any) => state?.cart || {});
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Magnetic zoom states
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Fetch product on mount
  useEffect(() => {
    if (params?.id) {
      dispatch(fetchProductBySlug(params.id as string) as any);
    }
  }, [params?.id, dispatch]);

  // Fetch related products when product loads
  useEffect(() => {
    if (selectedProduct?._id) {
      dispatch(fetchRelatedProducts({ productId: selectedProduct._id, limit: 4 }) as any)
        .unwrap()
        .then((data: any) => {
          setRelatedProducts(data.products || []);
        })
        .catch((err: any) => {
          console.error('Failed to fetch related products:', err);
        });
    }
  }, [selectedProduct?._id, dispatch]);

  // Reset quantity when size changes to prevent ordering more than available
  useEffect(() => {
    if (selectedProduct?.hasSizeVariants && selectedSize) {
      const selectedVariant = selectedProduct.sizeVariants?.find((v: any) => v.size === selectedSize);
      const maxStock = selectedVariant?.stock || 0;
      const cartItemId = `${selectedProduct._id}-${selectedSize}`;
      const cartItem = cartItems.find((item: any) => item._id === cartItemId);
      const alreadyInCart = cartItem?.quantity || 0;
      const maxAvailable = Math.max(0, maxStock - alreadyInCart);
      
      if (quantity > maxAvailable) {
        setQuantity(Math.max(1, Math.min(quantity, maxAvailable)));
      }
    }
  }, [selectedSize, selectedProduct?.hasSizeVariants, selectedProduct?.sizeVariants, quantity, cartItems, selectedProduct?._id]);

  // Early return if no product data
  if (!selectedProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#FD0002] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Loading amazing product...</p>
        </div>
      </div>
    );
  }

  // Safely destructure product data
  const product = selectedProduct;
  
  // Safe calculations with null checks
  const displayPrice = product?.salePrice || product?.price || 0;
  const hasDiscount = product?.salePrice && product?.salePrice < product?.price;
  const discount = hasDiscount ? (product?.discountPercentage || Math.round(((product.price - product.salePrice!) / product.price) * 100)) : 0;
  const isInWishlist = wishlistItems?.some((item: any) => item._id === product?._id || item === product?._id);
  const stockCount = product?.totalStock || product?.stock || 0;

  // 🔥 NEW: Helper function to get available stock based on size selection
  const getAvailableStock = () => {
    if (product.hasSizeVariants && selectedSize) {
      const selectedVariant = product.sizeVariants?.find((v: any) => v.size === selectedSize);
      return selectedVariant?.stock || 0;
    }
    return stockCount;
  };

  // 🔥 NEW: Get quantity already in cart for this product/size combination
  const getCartQuantity = () => {
    const cartItemId = `${product._id}-${selectedSize || 'default'}`;
    const cartItem = cartItems.find((item: any) => item._id === cartItemId);
    return cartItem?.quantity || 0;
  };

  // 🔥 NEW: Calculate available stock dynamically (total stock - already in cart)
  const availableStock = getAvailableStock();
  const cartQuantity = getCartQuantity();
  const remainingStock = Math.max(0, availableStock - cartQuantity);

  // 🔥 UPDATED: Use remainingStock instead of availableStock
  const isOutOfStock = remainingStock === 0;

  // Magnetic zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleWishlistToggle = () => {
    if (user) {
      dispatch(toggleWishlistItem({ userId: user._id, productId: product._id }) as any);
    } else {
      if (isInWishlist) {
        dispatch(removeFromWishlist(product._id));
      } else {
        dispatch(addToWishlist(product));
      }
    }
  };

const handleAddToCart = async () => {
  if (product.hasSizeVariants && !selectedSize) {
    alert("Please select a size");
    return;
  }

  if (remainingStock === 0) {
    alert("This item is already in your cart with the maximum available quantity");
    return;
  }

  if (quantity > remainingStock) {
    alert(`Only ${remainingStock} item(s) available. You already have ${cartQuantity} in your cart.`);
    return;
  }

  setAddingToCart(true);

  try {
    if (isAuthenticated && user) {
      // 🔥 AUTHENTICATED USERS: Save to MongoDB
      console.log("Adding to DB cart:", {
        userId: user._id,
        productId: product._id,
        quantity,
        size: selectedSize || 'One Size'
      });

      await dispatch(addToCartDB({
        userId: user._id,
        productId: product._id,
        quantity: quantity,
        size: selectedSize || 'One Size',
        color: undefined
      })).unwrap();

      console.log("✅ Successfully added to DB cart");
    } else {
      // 🔥 GUEST USERS: Save to localStorage
      console.log("Adding to localStorage cart");

      const cartItemId = `${product._id}-${selectedSize || 'default'}`;
      
      const cartItem = {
        _id: cartItemId,
        product: product._id,
        name: product.name,
        price: displayPrice,
        image: product.images[0],
        size: selectedSize || 'One Size',
        quantity: quantity,
        subCategory: product.subCategory,
        stock: product.hasSizeVariants 
          ? product.sizeVariants?.find((v: any) => v.size === selectedSize)?.stock || 0
          : product.stock
      };

      dispatch(addToCart(cartItem));
      console.log("✅ Successfully added to localStorage");
    }
    
    setTimeout(() => {
      setAddingToCart(false);
    }, 1500);
  } catch (error: any) {
    console.error("❌ Add to cart failed:", error);
    alert(error.message || "Failed to add to cart. Please try again.");
    setAddingToCart(false);
  }
};

// Update handleBuyNow:
const handleBuyNow = async () => {
  if (product.hasSizeVariants && !selectedSize) {
    alert("Please select a size");
    return;
  }

  if (remainingStock === 0) {
    alert("This item is already in your cart with the maximum available quantity");
    return;
  }

  if (quantity > remainingStock) {
    alert(`Only ${remainingStock} item(s) available. You already have ${cartQuantity} in your cart.`);
    return;
  }

  setBuyingNow(true);

  try {
    if (isAuthenticated && user) {
      // 🔥 AUTHENTICATED USERS: Save to MongoDB
      await dispatch(addToCartDB({
        userId: user._id,
        productId: product._id,
        quantity: quantity,
        size: selectedSize || 'One Size',
        color: undefined
      })).unwrap();
    } else {
      // 🔥 GUEST USERS: Save to localStorage
      const cartItemId = `${product._id}-${selectedSize || 'default'}`;
      
      const cartItem = {
        _id: cartItemId,
        product: product._id,
        name: product.name,
        price: product.price,  
        salePrice: product.salePrice || null,
        image: product.images[0],
        size: selectedSize || 'One Size',
        quantity: quantity,
        subCategory: product.subCategory,
        stock: product.hasSizeVariants 
          ? product.sizeVariants?.find((v: any) => v.size === selectedSize)?.stock || 0
          : product.stock
      };

      dispatch(addToCart(cartItem));
    }
    
    setTimeout(() => {
      setBuyingNow(false);
      router.push('/checkout');
    }, 1500);
  } catch (error: any) {
    console.error("Buy now failed:", error);
    alert(error.message || "Failed to process. Please try again.");
    setBuyingNow(false);
  }
};


  // Extract YouTube video ID
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeVideoId = product.youtubeLink ? getYoutubeVideoId(product.youtubeLink) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Breadcrumb Navigation */}
      <div className="bg-white/80 border-b border-gray-200 sticky top-0 z-40 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide">
            <button onClick={() => router.push('/')} className="flex items-center gap-1 text-gray-500 hover:text-[#FD0002] transition-colors group flex-shrink-0">
              <Home className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden xs:inline">Home</span>
            </button>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <button onClick={() => router.push('/products')} className="text-gray-500 hover:text-[#FD0002] transition-colors flex-shrink-0">
              Products
            </button>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <button onClick={() => router.push(`/products?category=${product.category}`)} className="text-gray-500 hover:text-[#FD0002] transition-colors flex-shrink-0">
              {product.category}
            </button>
            {product.subCategory && (
              <>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <button onClick={() => router.push(`/products?subCategory=${product.subCategory}`)} className="text-gray-500 hover:text-[#FD0002] transition-colors flex-shrink-0">
                  {product.subCategory}
                </button>
              </>
            )}
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#FD0002] transition-colors mb-4 sm:mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm sm:text-base font-medium">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
          {/* Left: Images */}
          <div className="space-y-3 sm:space-y-4">
            {/* Main Image with Magnetic Zoom */}
            <div 
              ref={imageRef}
              className="relative aspect-square bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl group max-w-[250px] sm:max-w-[380px] "
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZooming ? 'scale-150' : 'scale-100'
                }`}
                style={isZooming ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                } : {}}
              />
              
              {/* Zoom Indicator */}
              {isZooming && (
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2 animate-fade-in">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Zoom Active</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <div className="bg-gradient-to-r from-[#FD0002] to-red-600 text-white px-2.5  py-1  rounded-full font-bold text-[10px]  shadow-lg flex items-center gap-1 animate-pulse-slow">
                    <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-white" />
                    {discount}% OFF
                  </div>
                )}
                {product.isNewArrival && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2.5  py-1 rounded-full font-semibold text-[10px]  shadow-lg flex items-center gap-1">
                    <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    NEW
                  </div>
                )}
                {product.isBestSeller && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5  py-1  rounded-full font-semibold text-[10px]  shadow-lg flex items-center gap-1">
                    <TrendingUp className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    Best Seller
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-[250px] sm:max-w-[380px]  ">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
                    selectedImage === idx
                      ? 'ring-1 sm:ring-2 ring-[#FD0002] scale-105 shadow-lg'
                      : 'ring-1 sm:ring-2 ring-gray-200 hover:ring-gray-400 hover:scale-105'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              
              {/* YouTube Video Thumbnail */}
              {youtubeVideoId && (
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ring-1 sm:ring-2 ring-gray-200 hover:ring-red-400 hover:scale-105 group bg-black"
                >
                  <img 
                    src={`https://img.youtube.com/vi/${youtubeVideoId}/mqdefault.jpg`}
                    alt="Video thumbnail" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="bg-red-600 rounded-full p-2 sm:p-3 shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded font-semibold">
                    VIDEO
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-3 sm:space-y-5">
            {/* Title & Rating */}
            <div className="space-y-2">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              
              {/* <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 fill-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">{product.rating}</span>
                  <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                </div>
              </div> */}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 sm:gap-3 p-2.5 sm:p-3.5 bg-gradient-to-r from-red-50 via-pink-50 to-purple-50 rounded-lg sm:rounded-xl border border-red-100">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-[#FD0002]">
                ৳{displayPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm sm:text-base lg:text-lg text-gray-400 line-through">
                    ৳{product.price.toFixed(2)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                    Save ৳{(product.price - displayPrice).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm">
                <p className="text-[11px] sm:text-xs text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Size Selection */}
            {product.hasSizeVariants && product.sizeVariants && (
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-xs sm:text-sm text-gray-900">Select Size:</h3>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {product.sizeVariants.map((variant: any) => (
                    <button
                      key={variant.size}
                      onClick={() => setSelectedSize(variant.size)}
                      disabled={variant.stock === 0}
                      className={`relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl font-semibold text-center transition-all duration-300 border-2 ${
                        selectedSize === variant.size
                          ? 'border-[#FD0002] bg-[#FD0002] text-white shadow-lg scale-105'
                          : variant.stock === 0
                          ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-[#FD0002] hover:shadow-md hover:scale-105'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-bold">{variant.size}</div>
                      {product.subCategory !== "Sneakers" &&  variant.stock > 0 && variant.stock < 5 && (
                        <div className={`text-[9px] sm:text-[10px] mt-0.5 ${
                          selectedSize === variant.size ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {variant.stock} left
                        </div>
                      )}
                      {variant.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-gray-300 rotate-[-45deg]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Attractive Quantity Selector */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-lg opacity-0 blur transition-all duration-300"></div>
                  <div className="relative flex items-center bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="relative px-3 sm:px-3.5 py-2 sm:py-2.5 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 transition-all duration-300 group/btn active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 group-hover/btn:scale-110 group-hover/btn:rotate-90 transition-all duration-300" />
                    </button>
                    
                    <div className="px-4 sm:px-5 py-2 sm:py-2.5 min-w-[45px] sm:min-w-[50px] text-center border-x-2 border-gray-300 bg-gradient-to-b from-white to-gray-50">
                      <span className="font-bold text-sm sm:text-base text-gray-900 animate-number-change">{quantity}</span>
                    </div>
                    
                    {/* 🔥 UPDATED: Use remainingStock instead of availableStock */}
                    <button
                      onClick={() => setQuantity(Math.min(remainingStock, quantity + 1))}
                      className="relative px-3 sm:px-3.5 py-2 sm:py-2.5 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 group/btn active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity >= remainingStock}
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 group-hover/btn:scale-110 group-hover/btn:rotate-90 transition-all duration-300" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleWishlistToggle}
                  className={`relative p-2 sm:p-2.5 rounded-lg border-2 transition-all duration-300 hover:scale-110 active:scale-95 group ${
                    isInWishlist
                      ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50'
                      : 'border-gray-300 hover:border-red-500 bg-white hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                      isInWishlist ? 'fill-red-500 text-red-500 animate-heart-pop' : 'text-gray-600 group-hover:text-red-500'
                    }`}
                  />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart || (product.hasSizeVariants && !selectedSize)}
                className="w-full relative bg-gradient-to-r from-[#FD0002] via-red-600 to-[#FD0002] bg-[length:200%_100%] text-white py-2 sm:py-2.5 px-6 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[position:100%_0] transition-all duration-500 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-red-200 flex items-center justify-center gap-2 overflow-hidden group active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-shimmer-complete" />
                {addingToCart ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce relative z-10" />
                    <span className="relative z-10 font-bold">Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform" />
                    <span className="relative z-10 font-bold">Add to Cart</span>
                  </>
                )}
              </button>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || buyingNow || (product.hasSizeVariants && !selectedSize)}
                className="w-full relative bg-gradient-to-r from-green-500 via-emerald-600 to-green-500 bg-[length:200%_100%] text-white py-2 sm:py-2.5 px-6 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[position:100%_0] transition-all duration-500 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-green-200 flex items-center justify-center gap-2 overflow-hidden group active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-shimmer-complete" />
                {buyingNow ? (
                  <>
                    <Check className="w-4 h-4 animate-bounce relative z-10" />
                    <span className="relative z-10 font-bold">Processing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white relative z-10 group-hover:scale-110 transition-transform" />
                    <span className="relative z-10 font-bold">Buy Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t-2 border-gray-200">
              <div className="flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:animate-bounce" />
                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-900 text-center leading-tight">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-2.5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 group-hover:animate-bounce" />
                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-900 text-center leading-tight">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-2.5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 group-hover:animate-spin-slow" />
                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-900 text-center leading-tight">Easy Returns</span>
              </div>
            </div>

            {/* 🔥 UPDATED: Stock Status with cart-aware logic */}
            <div className={`p-2 sm:p-2.5 rounded-lg animate-pulse-slow ${
              remainingStock > 10 ? 'bg-green-50 border-2 border-green-200' :
              remainingStock > 0 ? 'bg-yellow-50 border-2 border-yellow-200' :
              'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                <Package className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  remainingStock > 10 ? 'text-green-600' :
                  remainingStock > 0 ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
                <span className={`font-semibold text-[11px] sm:text-xs ${
                  remainingStock > 10 ? 'text-green-900' :
                  remainingStock > 0 ? 'text-yellow-900' :
                  'text-red-900'
                }`}>
                  {product.hasSizeVariants && !selectedSize 
                    ? 'Please select a size'
                    : cartQuantity > 0 && remainingStock === 0
                    ? `Already in cart (${cartQuantity})`
                    : cartQuantity > 0 && remainingStock > 0
                    ? `${remainingStock} more available (${cartQuantity} in cart)`
                    : remainingStock > 10 ? 'In Stock' :
                      remainingStock > 0 ? `Only ${remainingStock} left!` :
                      'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">You May Also Like</h2>
              <button
                onClick={() => router.push(`/products?category=${product.category}`)}
                className="text-[#FD0002] font-semibold text-sm sm:text-base hover:underline flex items-center gap-2 group"
              >
                View All
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {relatedProducts.map((relProduct: any) => (
                <ProductCard key={relProduct._id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* YouTube Video Modal */}
      {showVideoModal && youtubeVideoId && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowVideoModal(false)}
        >
          <div 
            className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-all hover:scale-110"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
              title="Product video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer-complete {
          0% { left: -50%; }
          100% { left: 150%; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes heart-pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        
        @keyframes number-change {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-shimmer-complete {
          animation: shimmer-complete 2.5s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-heart-pop {
          animation: heart-pop 0.5s ease-in-out;
        }
        
        .animate-number-change {
          animation: number-change 0.3s ease-in-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// Reusable Product Card Component
function ProductCard({ product }: { product: any }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const { items: wishlistItems = [] } = useSelector((state: any) => state?.wishlist || {});
  const { user } = useSelector((state: any) => state?.auth || {});
  
  const isInWishlist = wishlistItems?.some((item: any) => item._id === product._id);
  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discount = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      dispatch(toggleWishlistItem({ userId: user._id, productId: product._id }) as any);
    } else {
      if (isInWishlist) {
        dispatch(removeFromWishlist(product._id));
      } else {
        dispatch(addToWishlist(product));
      }
    }
  };

  return (
    <div
      className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/products/${product.slug}`)}
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-[#FD0002] text-white px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1">
            <Zap className="w-3 h-3 fill-white" />
            {discount}% OFF
          </div>
        )}
        
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full hover:scale-110 transition-transform"
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>
      
      <div className="p-4 space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase">{product.subCategory}</div>
        <h3 className="font-semibold text-sm text-gray-900 truncate">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">৳{displayPrice.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">৳{product.price.toFixed(2)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">{product.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}