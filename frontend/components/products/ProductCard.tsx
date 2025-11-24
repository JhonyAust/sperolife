"use client";

import React, { useState } from "react";
import { Heart, ShoppingCart, X, Check, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, addToCartDB } from "@/lib/redux/slices/cartSlice";
import { 
  toggleWishlistItem, 
  addToWishlist, 
  removeFromWishlist 
} from "@/lib/redux/slices/wishlistSlice";
import { AppDispatch, RootState } from "@/lib/redux/store";

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
  price: number;
  salePrice?: number;
  category: string;
  subCategory: string;
  images: string[];
  stock: number;
  rating: number;
  hasSizeVariants?: boolean;
  sizeVariants?: SizeVariant[];
  totalStock?: number;
  discountPercentage?: number;
  stockStatus?: string;
  isNewArrival?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isHovered, setIsHovered] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  // Get auth state and wishlist
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  
  // Check if product is in wishlist - handle both full products and IDs
  const isInWishlist = wishlistItems?.some((item: any) => {
    if (typeof item === 'string') {
      return item === product._id;
    }
    return item._id === product._id;
  });

  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discount = hasDiscount 
    ? product.discountPercentage || Math.round(((product.price - product.salePrice!) / product.price) * 100) 
    : 0;
  
  const stockCount = product.totalStock || product.stock || 0;
  const isOutOfStock = stockCount === 0;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (togglingWishlist) return;
    
    setTogglingWishlist(true);
    
    try {
      if (isAuthenticated && user) {
        // Authenticated user - use API
        await dispatch(toggleWishlistItem({ 
          userId: user._id, 
          productId: product._id 
        })).unwrap();
      } else {
        // Guest user - use localStorage
        if (isInWishlist) {
          dispatch(removeFromWishlist(product._id));
        } else {
          dispatch(addToWishlist(product));
        }
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (product.hasSizeVariants) {
      setShowSizeModal(true);
    } else {
      addProductToCart();
    }
  };

  const addProductToCart = async () => {
  setAddingToCart(true);
  
  try {
    if (isAuthenticated && user) {
      // 🔥 AUTHENTICATED USERS: Save to MongoDB
      console.log("Adding to DB cart from ProductCard:", {
        userId: user._id,
        productId: product._id,
        size: selectedSize || 'One Size'
      });

      await dispatch(addToCartDB({
        userId: user._id,
        productId: product._id,
        quantity: 1,
        size: selectedSize || 'One Size',
        color: undefined
      })).unwrap();

      console.log("✅ Successfully added to DB cart");
      
      setTimeout(() => {
        setAddingToCart(false);
        setShowSizeModal(false);
        setSelectedSize("");
      }, 600);
    } else {
      // 🔥 GUEST USERS: Save to localStorage
      console.log("Adding to localStorage cart from ProductCard");

      const cartItem = {
        _id: `${product._id}-${selectedSize || 'default'}`,
        product: product._id,
        name: product.name,
        price: displayPrice,
        image: product.images[0],
        size: selectedSize || 'One Size',
        quantity: 1,
        stock: product.hasSizeVariants 
          ? product.sizeVariants?.find(v => v.size === selectedSize)?.stock || 0
          : product.stock
      };
      
      dispatch(addToCart(cartItem));
      console.log("✅ Successfully added to localStorage");
      
      setTimeout(() => {
        setAddingToCart(false);
        setShowSizeModal(false);
        setSelectedSize("");
      }, 600);
    }
  } catch (error: any) {
    console.error('❌ Add to cart failed:', error);
    alert(error.message || "Failed to add to cart");
    setAddingToCart(false);
  }
};

  const handleImageClick = () => {
    if (!showSizeModal) {
      router.push(`/products/${product.slug}`);
    }
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    setSelectedSize(size);
  };

  return (
    <div
      className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 cursor-pointer rounded-t-xl overflow-hidden" onClick={handleImageClick}>
        {/* Product Image */}
        <img
          src={product.images[0] || "/placeholder.jpg"}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovered ? "scale-105" : "scale-100"
          } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Shimmer Loading Effect */}
        {!imageLoaded && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer" />
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
            <div className="bg-[#FD0002] text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg flex items-center gap-1 animate-bounce-slow">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 fill-white" />
              {discount}% OFF
            </div>
          </div>
        )}

        {/* New Arrival Badge */}
        {product.isNewArrival && !hasDiscount && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
            <div className="bg-black text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full font-semibold text-xs sm:text-sm shadow-lg">
              NEW
            </div>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-white text-gray-900 px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg font-bold text-sm sm:text-base shadow-xl">
              Out of Stock
            </div>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={isOutOfStock || togglingWishlist}
          className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 group/wishlist"
        >
          <div className="relative">
            {/* Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${
              isInWishlist ? "from-red-500 to-pink-500" : "from-gray-400 to-gray-500"
            } rounded-full blur-xl opacity-0 group-hover/wishlist:opacity-75 transition-opacity duration-300`} />
            
            {/* Button */}
            <div className={`relative bg-white/95 backdrop-blur-md p-2 sm:p-3 rounded-full shadow-lg transform transition-all duration-300 ${
              isInWishlist 
                ? "scale-110" 
                : "group-hover/wishlist:scale-110"
            } ${togglingWishlist ? "animate-pulse" : ""}`}>
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                  isInWishlist
                    ? "fill-red-500 text-red-500 animate-heart-beat"
                    : "text-gray-600 group-hover/wishlist:text-red-500 group-hover/wishlist:scale-110"
                }`}
              />
            </div>
            
            {/* Ripple Effect on Click */}
            {isInWishlist && !togglingWishlist && (
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
            )}
          </div>
        </button>

        {/* Add to Cart Button */}
        {!showSizeModal && (
          <div className={`absolute bottom-0 left-0 right-0 transform transition-all duration-300 ${
            isHovered && !isOutOfStock ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="relative w-full bg-[#FD0002] text-white py-2.5 sm:py-3.5 font-semibold text-sm sm:text-base hover:bg-[#E00002] transition-colors duration-300 flex items-center justify-center gap-2"
              style={{ overflow: 'hidden' }}
            >
              {/* Shimmer Effect */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-0 h-full w-[50%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-shimmer-complete" style={{ left: '-50%' }} />
              </div>
              
              {addingToCart ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10">Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
                  <span className="relative z-10">Add to Cart</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Size Selection Modal */}
        {showSizeModal && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/40 rounded-xl backdrop-blur-sm z-40 animate-fade-in"
              onClick={() => {
                setShowSizeModal(false);
                setSelectedSize("");
              }}
            />
            
            {/* Modal Content */}
            <div 
              className="fixed left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up z-50 flex flex-col"
              style={{ maxHeight: '85vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-1.5 pb-0.5">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  Select Size
                </h3>
                <button
                  onClick={() => {
                    setShowSizeModal(false);
                    setSelectedSize("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-4">
                {/* Product Info */}
                <div className="flex gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-gray-100">
                  <img 
                    src={product.images[0] || "/placeholder.jpg"} 
                    alt={product.name}
                    className="w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate leading-tight">
                      {product.name}
                    </h4>
                    <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
                      <p className="text-sm sm:text-lg font-bold text-[#FD0002]">
                        ৳{displayPrice.toFixed(2)}
                      </p>
                      {hasDiscount && (
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                          ৳{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Size Grid */}
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Available Sizes
                  </p>
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                    {product.sizeVariants?.map((variant) => (
                      <button
                        key={variant.size}
                        onClick={(e) => handleSizeSelect(e, variant.size)}
                        disabled={variant.stock === 0}
                        className={`relative p-1 sm:p-3 rounded-lg font-semibold text-center transition-all duration-200 border-2 ${
                          selectedSize === variant.size
                            ? "border-[#FD0002] bg-[#FD0002] text-white shadow-lg scale-105"
                            : variant.stock === 0
                            ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                            : "border-gray-200 bg-white text-gray-900 hover:border-[#FD0002] hover:shadow-md"
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-bold">{variant.size}</div>
                        
                        {variant.stock > 0 && variant.stock < 5 && (
                          <div className={`text-[6px] sm:text-[10px] mt-0.5 ${
                            selectedSize === variant.size ? "text-white/80" : "text-gray-500"
                          }`}>
                            {variant.stock} left
                          </div>
                        )}
                        
                        {variant.stock === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-gray-300 rotate-[-45deg] rounded-full" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fixed Bottom Button */}
              <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex-shrink-0">
                {selectedSize && (
                  <div className="flex items-center justify-between mb-2 sm:mb-3 px-0.5">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Size: <span className="font-semibold text-gray-900">{selectedSize}</span>
                    </span>
                    <div className="flex items-baseline gap-2 sm:gap-2.5">
                      <span className="text-sm sm:text-lg font-bold text-[#FD0002]">
                        ৳{displayPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                          ৳{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addProductToCart();
                  }}
                  disabled={!selectedSize || addingToCart}
                  className={`relative w-full py-2.5 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                    selectedSize && !addingToCart
                      ? "bg-[#FD0002] text-white hover:bg-[#E00002] shadow-lg hover:shadow-xl active:scale-[0.98]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  style={{ overflow: 'hidden' }}
                >
                  {selectedSize && !addingToCart && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-shimmer-complete" 
                           style={{ left: '-50%' }} 
                      />
                    </div>
                  )}
                  
                  {addingToCart ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
                      <span className="hidden xs:inline">Adding to Cart...</span>
                      <span className="xs:hidden">Adding...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden xs:inline">
                        {selectedSize ? `Add Size ${selectedSize} to Cart` : 'Select a Size'}
                      </span>
                      <span className="xs:hidden">
                        {selectedSize ? `Add Size ${selectedSize}` : 'Select Size'}
                      </span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 space-y-0.5 sm:space-y-0.5 flex-1 flex flex-col">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {product.subCategory}
        </div>

        <h3 
          className="font-semibold text-sm sm:text-base text-gray-900 truncate cursor-pointer hover:text-[#FD0002] transition-colors duration-300 leading-snug h-10 sm:h-12"
          onClick={handleImageClick}
        >
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2">
          <span className="text-lg sm:text-xl font-bold text-gray-900">
            ৳{displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-gray-400 line-through">
              ৳{product.price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 fill-gray-300"
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-500 font-medium">
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes shimmer-complete {
          0% { left: -50%; }
          100% { left: 150%; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes heart-beat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(1); }
        }
        
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        .animate-shimmer-complete {
          animation: shimmer-complete 2.5s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-heart-beat {
          animation: heart-beat 0.6s ease-in-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}