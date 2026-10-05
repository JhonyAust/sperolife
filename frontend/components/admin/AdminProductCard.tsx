import { useState, useEffect } from 'react';
import { 
  Edit, Trash2, Eye, EyeOff, Star, Package, ShoppingBag, 
  TrendingUp, Zap, Tag, Ruler, DollarSign, Hash
} from 'lucide-react';

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
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  brand?: string;
  isResellerAvailable?: boolean;
  resellerPrice?: number | null;
  images: string[];
  stock: number;
  rating: number;
  sales?: number;
  isActive: boolean;
  discountPercentage?: number;
  hasSizeVariants?: boolean;
  sizeVariants?: SizeVariant[];
  totalStock?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  sku?: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function AdminProductCard({ product, onEdit, onDelete, onToggleStatus }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayStock = product.hasSizeVariants ? product.totalStock || 0 : product.stock;
  const hasLowStock = displayStock > 0 && displayStock <= 10;
  const isOutOfStock = displayStock === 0;

  const productImage = product.images?.[0] || '';

  return (
    <div
      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
    >
      {/* Image Container - MUST BE FIRST */}
      <div className="relative w-full h-72 bg-gradient-to-br from-gray-100 via-gray-50 to-purple-50 overflow-hidden">
        {productImage ? (
          <>
            <img
              src={productImage}
              alt={product.name || 'Product'}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error('Image failed:', productImage);
                setImageLoaded(false);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.7s ease',
                transform: isHovered ? 'scale(1.1) rotate(2deg)' : 'scale(1) rotate(0deg)',
              }}
            />
            {/* Gradient Overlay on Hover */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300"
              style={{
                opacity: isHovered ? 1 : 0,
                pointerEvents: 'none'
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Package className="w-20 h-20 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 font-semibold">No Image</p>
          </div>
        )}
        
        {/* Top Badges - Positioned OVER the image */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            {/* Discount Badge */}
            {product.discountPercentage && product.discountPercentage > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white text-xs font-black rounded-full shadow-lg">
                <Zap className="w-3 h-3" />
                -{product.discountPercentage}% OFF
              </div>
            )}
            
            {/* Special Badges */}
            <div className="flex flex-col gap-1.5">
              {product.isBestSeller && (
                <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Best Seller
                </span>
              )}
              {product.isNewArrival && (
                <span className="px-2.5 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full shadow-md">
                  New
                </span>
              )}
              {product.isFeatured && (
                <span className="px-2.5 py-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <span className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm pointer-events-auto ${
            product.isActive 
              ? 'bg-green-500/90 text-white'
              : 'bg-gray-500/90 text-white'
          }`}>
            {product.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {/* Quick Actions on Hover - Positioned OVER the image */}
        <div 
          className="absolute inset-x-0 bottom-0 p-4 transition-all duration-300 z-10"
          style={{
            transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
            opacity: isHovered ? 1 : 0,
          }}
        >
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 py-2.5 px-4 bg-white/95 hover:bg-white text-gray-900 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onToggleStatus(product._id)}
              className="p-2.5 bg-white/95 hover:bg-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {product.isActive ? <EyeOff className="w-5 h-5 text-gray-700" /> : <Eye className="w-5 h-5 text-gray-700" />}
            </button>
            <button
              onClick={() => onDelete(product._id)}
              className="p-2.5 bg-red-500/95 hover:bg-red-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section - BELOW the image */}
      <div className="p-5 space-y-3">
        {/* Category & Brand */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            {product.category}
          </span>
          {product.brand && (
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {product.brand}
            </span>
          )}
          {product.isResellerAvailable && product.resellerPrice > 0 && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              🤝 Reseller ৳{product.resellerPrice}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-black text-gray-900 line-clamp-2 min-h-[3.5rem] group-hover:text-purple-600 transition-colors leading-tight">
          {product.name}
        </h3>

        {/* SKU Display - For products without size variants */}
        {!product.hasSizeVariants && product.sku && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
            <Hash className="w-4 h-4 text-gray-600" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-semibold">SKU</div>
              <div className="text-sm font-bold text-gray-900 font-mono">{product.sku}</div>
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              ৳{product.salePrice || product.price}
            </span>
          </div>
          {product.salePrice && (
            <span className="text-sm text-gray-400 line-through font-semibold">
              ৳{product.price}
            </span>
          )}
        </div>

        {/* Size Variants */}
        {product.hasSizeVariants && product.sizeVariants && product.sizeVariants.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowSizes(!showSizes)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-50 to-fuchsia-50 hover:from-purple-100 hover:to-fuchsia-100 rounded-xl transition-all"
            >
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-900">
                  {product.sizeVariants.length} Sizes Available
                </span>
              </div>
              <Tag className={`w-4 h-4 text-purple-600 transition-transform ${showSizes ? 'rotate-180' : ''}`} />
            </button>
            
            {showSizes && (
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {product.sizeVariants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="font-bold text-gray-900 text-sm">{variant.size}</div>
                      <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        variant.stock === 0 ? 'bg-red-100 text-red-700' : 
                        variant.stock <= 5 ? 'bg-orange-100 text-orange-700' : 
                        'bg-green-100 text-green-700'
                      }`}>
                        Stock: {variant.stock}
                      </div>
                    </div>
                    {variant.sku && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                        <Hash className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600 font-mono">{variant.sku}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t-2 border-gray-100">
          {/* Rating */}
          <div className="flex flex-col items-center p-2 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-black text-gray-900">{product.rating || 0}</span>
            </div>
            <span className="text-xs text-gray-600 font-semibold">Rating</span>
          </div>
          
          {/* Stock */}
          <div className={`flex flex-col items-center p-2 rounded-xl ${
            isOutOfStock ? 'bg-gradient-to-br from-red-50 to-pink-50' : 
            hasLowStock ? 'bg-gradient-to-br from-orange-50 to-yellow-50' : 
            'bg-gradient-to-br from-green-50 to-emerald-50'
          }`}>
            <div className="flex items-center gap-1 mb-1">
              <Package className={`w-4 h-4 ${
                isOutOfStock ? 'text-red-600' : 
                hasLowStock ? 'text-orange-600' : 
                'text-green-600'
              }`} />
              <span className={`text-sm font-black ${
                isOutOfStock ? 'text-red-600' : 
                hasLowStock ? 'text-orange-600' : 
                'text-green-600'
              }`}>
                {displayStock}
              </span>
            </div>
            <span className="text-xs text-gray-600 font-semibold">Stock</span>
          </div>

          {/* Sales */}
          <div className="flex flex-col items-center p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
            <div className="flex items-center gap-1 mb-1">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-black text-gray-900">{product.sales || 0}</span>
            </div>
            <span className="text-xs text-gray-600 font-semibold">Sales</span>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div 
        className="absolute inset-0 rounded-3xl transition-opacity duration-500 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.15), transparent 70%)',
        }}
      />
    </div>
  );
}