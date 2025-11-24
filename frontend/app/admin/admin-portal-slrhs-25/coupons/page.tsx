"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCoupons,
  fetchCouponStats,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  setFilters,
} from "@/lib/redux/slices/couponSlice";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Percent,
  Calendar,
  Copy,
  Sparkles,
  TrendingUp,
  CheckCircle,
  XCircle,
  Gift,
  Clock,
  DollarSign,
  Users,
  Search,
  Package,
  TrendingDown,
  AlertCircle,
  X,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AdminCouponsPage() {
  const dispatch = useDispatch();
  const { coupons = [], stats = {}, loading, filters } = useSelector(
    (state) => state.coupon || {}
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [formData, setFormData] = useState({
    couponCode: "",
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    expiryDate: "",
    usageLimit: "",
    status: "active",
  });

  useEffect(() => {
    console.log('🔍 Fetching coupons and stats...');
    
    dispatch(fetchCoupons(filters || {}))
      .unwrap()
      .then((data) => {
        console.log('✅ Coupons fetched:', data);
      })
      .catch((error) => {
        console.error('❌ Fetch coupons error:', error);
      });
    
    dispatch(fetchCouponStats())
      .unwrap()
      .then((data) => {
        console.log('✅ Stats fetched:', data);
      })
      .catch((error) => {
        console.error('❌ Fetch stats error:', error);
      });
  }, [dispatch, filters]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      discountValue: parseFloat(formData.discountValue),
      minPurchase: parseFloat(formData.minPurchase) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
    };

    if (editCoupon) {
      dispatch(updateCoupon({ id: editCoupon._id, couponData: submitData }));
    } else {
      dispatch(createCoupon(submitData));
    }
    
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setEditCoupon(null);
    setFormData({
      couponCode: "",
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "",
      maxDiscount: "",
      expiryDate: "",
      usageLimit: "",
      status: "active",
    });
  };

  const handleEdit = (coupon) => {
    setEditCoupon(coupon);
    setFormData({
      couponCode: coupon.couponCode,
      name: coupon.name,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minPurchase: coupon.minPurchase?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      expiryDate: coupon.expiryDate?.split("T")[0] || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      status: coupon.status,
    });
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      dispatch(deleteCoupon(id));
    }
  };

  const handleToggleStatus = (id) => {
    dispatch(toggleCouponStatus(id));
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/20 p-4 md:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              background: i % 2 === 0 ? "#f43f5e" : "#ec4899",
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 8,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-gradient-to-br from-rose-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <Gift className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-900 via-pink-800 to-purple-700 bg-clip-text text-transparent">
                Coupon Management
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600" />
                Create and manage discount coupons
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
            className="group bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-700 hover:via-pink-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 h-14 px-8 rounded-xl text-base font-bold flex items-center gap-2"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Create Coupon
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={Tag}
            label="Total Coupons"
            value={stats.total || 0}
            color="from-rose-600 to-pink-600"
            iconBg="from-rose-50 to-pink-50"
            delay={0}
          />
          <StatsCard
            icon={CheckCircle}
            label="Active"
            value={stats.active || 0}
            color="from-green-600 to-emerald-600"
            iconBg="from-green-50 to-emerald-50"
            delay={0.1}
          />
          <StatsCard
            icon={Clock}
            label="Expired"
            value={stats.expired || 0}
            color="from-orange-600 to-amber-600"
            iconBg="from-orange-50 to-amber-50"
            delay={0.2}
          />
          <StatsCard
            icon={XCircle}
            label="Inactive"
            value={stats.inactive || 0}
            color="from-gray-600 to-gray-700"
            iconBg="from-gray-50 to-gray-100"
            delay={0.3}
          />
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 text-gray-500"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search coupons..."
                value={filters?.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-gray-900 placeholder:text-gray-500"
              />
            </div>
            <select
              value={filters?.status || "all"}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all font-semibold"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={filters?.sort || "-createdAt"}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all font-semibold"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-usedCount">Most Used</option>
              <option value="expiryDate">Expiring Soon</option>
            </select>
          </div>
        </motion.div>

        {/* Coupons Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full"
              />
            </div>
          ) : coupons.length === 0 ? (
            <EmptyState onClick={() => setOpenDialog(true)} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {coupons.map((coupon, index) => (
                <CouponCard
                  key={coupon._id}
                  coupon={coupon}
                  index={index}
                  copiedCode={copiedCode}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  onCopyCode={handleCopyCode}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Create/Edit Dialog */}
      <CouponDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          resetForm();
        }}
        editMode={!!editCoupon}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, color, iconBg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 hover:shadow-2xl transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-14 h-14 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center`}>
        <div className={`w-7 h-7 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <TrendingUp className="w-5 h-5 text-gray-400" />
    </div>
    <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
    <p className="text-3xl font-black text-gray-900">{value}</p>
  </motion.div>
);

// Coupon Card Component
const CouponCard = ({ coupon, index, copiedCode, onEdit, onDelete, onToggleStatus, onCopyCode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-2xl border-2 border-gray-200 hover:border-rose-300 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
  >
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-gray-900 truncate">{coupon.name}</h3>
            {coupon.description && (
              <p className="text-sm text-gray-500 truncate">{coupon.description}</p>
            )}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggleStatus(coupon._id)}
          className={`px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 ${
            coupon.status === "active"
              ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
              : coupon.status === "expired"
              ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white"
              : "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
          }`}
        >
          {coupon.status === "active" ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          {coupon.status.toUpperCase()}
        </motion.button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

      {/* Coupon Code */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border-2 border-rose-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-rose-600" />
            <div>
              <p className="text-xs text-gray-600 font-medium">Code</p>
              <p className="text-2xl font-black text-rose-600 tracking-wider">{coupon.couponCode}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onCopyCode(coupon.couponCode)}
            className="px-3 py-2 border-2 border-rose-300 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-2 font-semibold text-sm text-gray-600"
          >
            <Copy className="w-4 h-4 text-gray-600" />
            {copiedCode === coupon.couponCode ? "Copied!" : "Copy"}
          </motion.button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            {coupon.discountType === "percentage" ? (
              <Percent className="w-4 h-4 text-purple-600" />
            ) : (
              <DollarSign className="w-4 h-4 text-purple-600" />
            )}
            <p className="text-xs text-gray-600 font-medium">Discount</p>
          </div>
          <p className="text-lg font-black text-purple-600">
            {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-gray-600 font-medium">Min Purchase</p>
          </div>
          <p className="text-lg font-black text-blue-600">৳{coupon.minPurchase || 0}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-green-600" />
            <p className="text-xs text-gray-600 font-medium">Used</p>
          </div>
          <p className="text-lg font-black text-green-600">
            {coupon.usedCount || 0}/{coupon.usageLimit || "∞"}
          </p>
        </div>

        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-amber-600" />
            <p className="text-xs text-gray-600 font-medium">Expires</p>
          </div>
          <p className="text-sm font-bold text-amber-600">
            {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : "No expiry"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onEdit(coupon)}
          className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onDelete(coupon._id)}
          className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </motion.button>
      </div>
    </div>
  </motion.div>
);

// Empty State Component
const EmptyState = ({ onClick }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-12 text-center"
  >
    <motion.div
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center"
    >
      <Tag className="w-12 h-12 text-rose-400" />
    </motion.div>
    <h3 className="text-2xl font-bold text-gray-800 mb-3">No Coupons Yet</h3>
    <p className="text-gray-500 text-base mb-8 max-w-md mx-auto">
      Create your first coupon to offer discounts to customers
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-8 rounded-xl font-semibold inline-flex items-center gap-2"
    >
      <Plus className="w-5 h-5" />
      Create First Coupon
    </motion.button>
  </motion.div>
);

// Dialog Component
const CouponDialog = ({ open, onClose, editMode, formData, onChange, onSubmit }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        />
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl border-2 border-rose-100 max-w-2xl w-full my-8"
          >
            <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-6 z-10 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    {editMode ? <Edit className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-900 to-pink-900 bg-clip-text text-transparent">
                      {editMode ? "Edit Coupon" : "Create New Coupon"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {editMode ? "Update coupon details" : "Fill in the coupon information"}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Coupon Code" icon={Tag} required>
                  <input
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={onChange}
                    placeholder="e.g., SUMMER2024"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all uppercase font-bold text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </FormField>

                <FormField label="Coupon Name" icon={Gift} required>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    placeholder="e.g., Summer Sale"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </FormField>
              </div>

              <FormField label="Description" icon={Package}>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={onChange}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all resize-none text-gray-900 placeholder:text-gray-500"
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Discount Type" icon={Percent} required>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={onChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all font-semibold text-gray-900"
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (৳)</option>
                  </select>
                </FormField>

                <FormField label="Discount Value" icon={TrendingDown} required>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={onChange}
                    placeholder={formData.discountType === "percentage" ? "e.g., 20" : "e.g., 500"}
                    min="0"
                    max={formData.discountType === "percentage" ? "100" : undefined}
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Minimum Purchase" icon={DollarSign}>
                  <input
                    type="number"
                    name="minPurchase"
                    value={formData.minPurchase}
                    onChange={onChange}
                    placeholder="e.g., 1000"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                  />
                </FormField>

                <FormField label="Max Discount (For %)" icon={AlertCircle}>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={onChange}
                    placeholder="e.g., 500"
                    min="0"
                    step="0.01"
                    disabled={formData.discountType === "flat"}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-500"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Expiry Date" icon={Calendar}>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={onChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-gray-900"
                  />
                </FormField>

                <FormField label="Usage Limit" icon={Users}>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={onChange}
                    placeholder="Leave empty for unlimited"
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                  />
                </FormField>
              </div>

              <FormField label="Status" icon={CheckCircle} required>
                <select
                  name="status"
                  value={formData.status}
                  onChange={onChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all font-semibold text-gray-900"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FormField>

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-3 border-2 text-gray-700 border-gray-500 hover:bg-gray-100 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {editMode ? "Update Coupon" : "Create Coupon"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);

// Form Field Component
const FormField = ({ label, icon: Icon, required, children }) => (
  <div>
    <label className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-rose-600" />
      {label}
      {required && <span className="text-rose-600">*</span>}
    </label>
    {children}
  </div>
);