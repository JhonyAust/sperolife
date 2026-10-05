import { useState, useEffect } from 'react';
import { 
  X, Package, Loader2, Plus, Trash2, Tag, Ruler, DollarSign, 
  Box, BarChart3, Sparkles, AlertCircle, TrendingUp, Star, Hash, RefreshCw, Youtube, Store
} from 'lucide-react';
import ImageUpload from './ImageUpload';
import ProductDescription, { DescriptionFormatHint } from "../products/ProductDescription";

interface SizeVariant {
  size: string;
  stock: number;
  price?: number;
  salePrice?: number;
  sku?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  shortDescription: string;
  price: string;
  salePrice: string;
  category: string;
  subCategory: string;
  brand: string;
  stock: string;
  images: string[];
  youtubeLink: string;
  tags: string[];
  features: string[];
  hasSizeVariants: boolean;
  sizeVariants: SizeVariant[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isHotDeals: boolean;
  weight: string;
  metaTitle: string;
  metaDescription: string;
  sku: string;
  isResellerAvailable: boolean;
  resellerPrice: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onSave: (formData: any) => void;
  uploading: boolean;
  onImageUpload: (file: File) => Promise<string>;
}
const categories = [
  { 
    name: "Men", 
    value: "men",
    subcategories: ["Shirts", "T-Shirts", "Shacket", "Jackets", "Hoodies", "Pants", "Jeans", "Shoes","Combo"]
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

export default function AdminProductModal({ 
  isOpen, 
  onClose, 
  product, 
  onSave, 
  uploading,
  onImageUpload 
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    salePrice: '',
    category: '',
    subCategory: '',
    brand: '',
    stock: '',
    images: [],
    youtubeLink: '',
    tags: [],
    features: [],
    hasSizeVariants: false,
    sizeVariants: [],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isHotDeals: false,
    weight: '',
    metaTitle: '',
    metaDescription: '',
    sku: '',
    isResellerAvailable: false,
    resellerPrice: '',
  });

  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'sizes' | 'media' | 'seo'>('basic');
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [showDescriptionPreview, setShowDescriptionPreview] = useState(true);
  const generateSKU = (productName: string, category: string, size?: string) => {
    const prefix = 'SPL';
    const categoryCode = category.substring(0, 3).toUpperCase() || 'GEN';
    const nameCode = productName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 3) || 'PRD';
    
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const uniqueId = `${timestamp.slice(-8)}${randomStr}`;
    const sizeCode = size ? `-${size.toUpperCase()}` : '';
    
    return `${prefix}-${categoryCode}-${nameCode}-${uniqueId}${sizeCode}`;
  };

  useEffect(() => {
    if (formData.name && formData.category && !formData.hasSizeVariants && !product && !formData.sku) {
      const newSku = generateSKU(formData.name, formData.category);
      setFormData(prev => ({ ...prev, sku: newSku }));
    }
  }, [formData.name, formData.category, formData.hasSizeVariants, product]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price?.toString() || '',
        salePrice: product.salePrice?.toString() || '',
        category: product.category || '',
        subCategory: product.subCategory || '',
        brand: product.brand || '',
        stock: product.stock?.toString() || '',
        images: product.images || [],
        youtubeLink: product.youtubeLink || '',
        tags: product.tags || [],
        features: product.features || [],
        hasSizeVariants: product.hasSizeVariants || false,
        sizeVariants: product.sizeVariants || [],
        isFeatured: product.isFeatured || false,
        isNewArrival: product.isNewArrival || false,
        isBestSeller: product.isBestSeller || false,
        isHotDeals: product.isHotDeals || false,
        weight: product.weight?.toString() || '',
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        sku: product.sku || '',
        isResellerAvailable: product.isResellerAvailable || false,
        resellerPrice: product.resellerPrice?.toString() || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        salePrice: '',
        category: '',
        subCategory: '',
        brand: '',
        stock: '',
        images: [],
        youtubeLink: '',
        tags: [],
        features: [],
        hasSizeVariants: false,
        sizeVariants: [],
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        isHotDeals: false,
        weight: '',
        metaTitle: '',
        metaDescription: '',
        sku: '',
        isResellerAvailable: false,
        resellerPrice: '',
      });
    }
  }, [product, isOpen]);
useEffect(() => {
  if (formData.category) {
    const selectedCategory = categories.find(cat => 
      cat.value === formData.category.toLowerCase() || 
      cat.name.toLowerCase() === formData.category.toLowerCase()
    );
    setAvailableSubcategories(selectedCategory?.subcategories || []);
  } else {
    setAvailableSubcategories([]);
  }
}, [formData.category]);
  const addSizeVariant = () => {
    const newVariant: SizeVariant = { 
      size: '', 
      stock: 0, 
      price: undefined, 
      salePrice: undefined,
      sku: ''
    };
    setFormData(prev => ({
      ...prev,
      sizeVariants: [...prev.sizeVariants, newVariant]
    }));
  };

  const removeSizeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sizeVariants: prev.sizeVariants.filter((_, i) => i !== index)
    }));
  };

  const updateSizeVariant = (index: number, field: keyof SizeVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      sizeVariants: prev.sizeVariants.map((variant, i) => {
        if (i === index) {
          const updated = { ...variant, [field]: value };
          if (field === 'size' && value && formData.name && formData.category) {
            updated.sku = generateSKU(formData.name, formData.category, value);
          }
          return updated;
        }
        return variant;
      })
    }));
  };

  const regenerateSKU = () => {
    if (formData.name && formData.category) {
      const newSku = generateSKU(formData.name, formData.category);
      setFormData(prev => ({ ...prev, sku: newSku }));
    }
  };

  const regenerateVariantSKU = (index: number) => {
    const variant = formData.sizeVariants[index];
    if (variant.size && formData.name && formData.category) {
      const newSku = generateSKU(formData.name, formData.category, variant.size);
      updateSizeVariant(index, 'sku', newSku);
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      alert('Please fill in all required fields: Name, Description, Price, and Category');
      return;
    }

    if (formData.images.length === 0) {
      alert('Please add at least one product image');
      return;
    }

    if (formData.hasSizeVariants && formData.sizeVariants.length === 0) {
      alert('Please add at least one size variant or disable size variants');
      return;
    }

    if (formData.hasSizeVariants) {
      const invalidVariant = formData.sizeVariants.find(v => !v.size || v.stock < 0);
      if (invalidVariant) {
        alert('Please provide valid size and stock for all variants');
        return;
      }
    }

    if (formData.isResellerAvailable && !(parseFloat(formData.resellerPrice) > 0)) {
      alert('Please set a reseller price before making this product available to resellers');
      return;
    }

    if (!formData.hasSizeVariants && !formData.sku) {
      alert('Please provide a SKU or click Regenerate to create one');
      return;
    }

    const submitData = {
      name: formData.name,
      description: formData.description,
      shortDescription: formData.shortDescription || undefined,
      price: parseFloat(formData.price),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
      category: formData.category,
      subCategory: formData.subCategory || undefined,
      brand: formData.brand || undefined,
      stock: formData.hasSizeVariants ? 0 : parseInt(formData.stock) || 0,
      images: formData.images,
      youtubeLink: formData.youtubeLink || undefined,
      tags: formData.tags,
      features: formData.features,
      hasSizeVariants: formData.hasSizeVariants,
      sizeVariants: formData.hasSizeVariants ? formData.sizeVariants : undefined,
      isFeatured: formData.isFeatured,
      isNewArrival: formData.isNewArrival,
      isBestSeller: formData.isBestSeller,
      isHotDeals: formData.isHotDeals,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      metaTitle: formData.metaTitle || undefined,
      metaDescription: formData.metaDescription || undefined,
      sku: !formData.hasSizeVariants ? formData.sku : undefined,
      isResellerAvailable: formData.isResellerAvailable,
      resellerPrice: formData.resellerPrice ? parseFloat(formData.resellerPrice) : null,
    };

    console.log('Submitting product data:', submitData);
    onSave(submitData);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'sizes', label: 'Sizes & Stock', icon: Ruler },
    { id: 'media', label: 'Media & Tags', icon: Tag },
    { id: 'seo', label: 'SEO & Meta', icon: TrendingUp },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl font-black mb-1">
                  {product ? 'Edit Product' : 'Create New Product'}
                </h2>
                <p className="text-purple-100 text-sm font-medium">
                  {product ? 'Update product details' : 'Add a new product to your inventory'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-2 mt-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 text-gray-900 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium"
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      category: e.target.value,
                      subCategory: '' // Reset subcategory when category changes
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900 bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sub Category</label>
                <select
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  disabled={!formData.category}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Sub Category</option>
                  {availableSubcategories.map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                  placeholder="Brand name"
                />
              </div>
            </div>

              {!formData.hasSizeVariants && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border-2 border-indigo-200">
                  <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Hash className="w-5 h-5 text-indigo-600" />
                    Product SKU (Auto-Generated)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="flex-1 px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-gray-900 font-mono font-semibold bg-white"
                      placeholder="SKU will be auto-generated"
                    />
                    <button
                      type="button"
                      onClick={regenerateSKU}
                      className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center gap-2 font-bold"
                      title="Regenerate SKU"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </button>
                  </div>
                  <p className="text-xs text-indigo-700 mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {product 
                      ? 'Click Regenerate to create a new unique SKU. Format: SPL-CATEGORY-NAME-UNIQUEID'
                      : 'Auto-generated format: SPL-CATEGORY-NAME-UNIQUEID'}
                  </p>
                </div>
              )}

              {formData.hasSizeVariants && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-900 mb-1">Size Variants Enabled</p>
                      <p className="text-xs text-amber-700">
                        Each size variant will have its own unique SKU automatically generated. You can manage them in the "Sizes & Stock" tab.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Regular Price (৳) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Sale Price (৳)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Short Description</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none text-gray-900"
                  placeholder="Brief product description (1-2 lines)"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700">Full Description *</label>
                  <button
                    type="button"
                    onClick={() => setShowDescriptionPreview((v) => !v)}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                  >
                    {showDescriptionPreview ? 'Hide preview' : 'Show preview'}
                  </button>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-y text-gray-900 font-mono text-sm leading-relaxed"
                  placeholder={"Premium everyday sneaker built for comfort.\n\nKey Features:\n- Breathable mesh upper\n- Cushioned sole\n\nMaterial: Leather & mesh\nSole: Rubber"}
                />
                <DescriptionFormatHint />
                {showDescriptionPreview && formData.description.trim() && (
                  <div className="mt-3">
                    <ProductDescription
                      description={formData.description}
                      features={formData.features}
                      collapsible={false}
                    />
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl p-6 border-2 border-purple-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Product Highlights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                      ⭐ Featured Product
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                      className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                      🆕 New Arrival
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                      className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                      🔥 Best Seller
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isHotDeals}
                    onChange={(e) => setFormData({ ...formData, isHotDeals: e.target.checked })}
                    className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                    💥 Hot Deals
                  </span>
                </label>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-600" />
                  Reseller Program
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <label className="flex items-center gap-3 cursor-pointer group py-3">
                    <input
                      type="checkbox"
                      checked={formData.isResellerAvailable}
                      onChange={(e) => setFormData({ ...formData, isResellerAvailable: e.target.checked })}
                      className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors">
                      🤝 Available for resellers
                    </span>
                  </label>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Reseller Price (৳){formData.isResellerAvailable ? ' *' : ''}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.resellerPrice}
                        onChange={(e) => setFormData({ ...formData, resellerPrice: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 bg-white"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Resellers see this price and only whether each size is in stock — never the stock quantity.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sizes' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasSizeVariants}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setFormData({ 
                        ...formData, 
                        hasSizeVariants: enabled,
                        sku: enabled ? '' : formData.sku
                      });
                    }}
                    className="w-6 h-6 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                  <div>
                    <span className="font-bold text-gray-900 text-lg block mb-1">
                      Enable Size Variants
                    </span>
                    <p className="text-sm text-gray-600">
                      Product has multiple sizes with different stock quantities and unique SKUs
                    </p>
                  </div>
                </label>
              </div>

              {!formData.hasSizeVariants ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity *</label>
                  <div className="relative">
                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <Ruler className="w-5 h-5 text-purple-600" />
                      Size Variants with Auto SKU
                    </h4>
                    <button
                      type="button"
                      onClick={addSizeVariant}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Size
                    </button>
                  </div>

                  {formData.sizeVariants.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                      <Ruler className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-semibold">No size variants added yet</p>
                      <p className="text-sm text-gray-500">Click "Add Size" to create your first variant</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.sizeVariants.map((variant, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Size *</label>
                                <input
                                  type="text"
                                  value={variant.size}
                                  onChange={(e) => updateSizeVariant(index, 'size', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm text-gray-900"
                                  placeholder="e.g., M, L, XL"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Stock *</label>
                                <input
                                  type="number"
                                  value={variant.stock}
                                  onChange={(e) => updateSizeVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm text-gray-900"
                                  placeholder="0"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Price (Optional)</label>
                                <input
                                  type="number"
                                  value={variant.price || ''}
                                  onChange={(e) => updateSizeVariant(index, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm text-gray-900"
                                  placeholder="Optional"
                                  step="0.01"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Sale Price</label>
                                <input
                                  type="number"
                                  value={variant.salePrice || ''}
                                  onChange={(e) => updateSizeVariant(index, 'salePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm text-gray-900"
                                  placeholder="Optional"
                                  step="0.01"
                                  min="0"
                                />
                              </div>
                            </div>
                            
                            <div className="flex gap-2 items-end">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-indigo-600 mb-1 flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  Size Variant SKU (Auto-Generated)
                                </label>
                                <input
                                  type="text"
                                  value={variant.sku || ''}
                                  onChange={(e) => updateSizeVariant(index, 'sku', e.target.value)}
                                  className="w-full px-3 py-2 border border-indigo-200 bg-indigo-50 rounded-lg focus:border-indigo-500 focus:outline-none text-sm text-gray-900 font-mono"
                                  placeholder="Auto-generated SKU"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => regenerateVariantSKU(index)}
                                className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                title="Regenerate SKU for this variant"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Regen
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSizeVariant(index)}
                                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                              >
                                <Trash2 className="w-3 h-3" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                  placeholder="Product weight"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Product Images *</label>
                <ImageUpload
                  images={formData.images}
                  onChange={(images) => setFormData({ ...formData, images })}
                  maxImages={5}
                  onUpload={onImageUpload}
                />
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-5 border-2 border-red-200">
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-600" />
                  YouTube Video Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.youtubeLink}
                  onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors text-gray-900 bg-white"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                />
                <p className="text-xs text-red-700 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Add a YouTube video to showcase your product. Will be displayed on the product details page.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Tags</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold"
                    >
                      {tag}
                      <button type="button" onClick={() => removeTag(idx)} className="hover:text-purple-900">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Key Features</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                    placeholder="Add a feature and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="flex-1 text-gray-900 font-medium">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">SEO Optimization</p>
                    <p className="text-xs text-blue-800">
                      Optimize your product for search engines to improve visibility
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                  placeholder="SEO title (recommended: 50-60 characters)"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/100 characters</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none text-gray-900"
                  placeholder="SEO description (recommended: 120-160 characters)"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/200 characters</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t-2 border-gray-100 p-6 bg-gray-50">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  {product ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}