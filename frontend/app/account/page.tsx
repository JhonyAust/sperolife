"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Box,
  ChevronRight,
  Edit,
  Mail,
  Phone,
  Calendar,
  Award,
  TrendingUp,
  CreditCard,
  Bell,
  Shield,
  Eye,
  Sparkles,
  ArrowRight,
  Star,
  Home,
  FileText,
  AlertCircle,
  MapPinned,
  Save,
  X,
  PlusCircle,
  Building2,
  Hash,
  Edit2,
  Trash2,
} from "lucide-react";
import { logoutUser } from "@/lib/redux/slices/authSlice";
import { fetchUserOrders } from "@/lib/redux/slices/orderSlice";
import { 
  fetchAddresses,
  selectAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/redux/slices/addressSlice";
import { toast } from "sonner";
import { 
  updateUserProfile, 
} from "@/lib/redux/slices/authSlice";
import api from "@/lib/api";

const UserAccountPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const { userOrders, loading, pagination } = useSelector((state: any) => state.order);
  const { addresses, selectedAddress } = useSelector((state: any) => state.address);

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch user orders
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUserOrders({ userId: user._id, page: 1, limit: 10 }));
    }
  }, [user, dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <User className="w-5 h-5" /> },
    { id: "orders", label: "My Orders", icon: <Package className="w-5 h-5" /> },
    { id: "addresses", label: "Addresses", icon: <MapPin className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressFormData, setAddressFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });
useEffect(() => {
  if (isAuthenticated && user?._id) {
    dispatch(fetchAddresses(user._id));
  }
}, [isAuthenticated, user, dispatch]);

const validateBDPhoneNumber = (number: string) => {
  const bdRegex = /^(?:\+88|88)?01[3-9]\d{8}$/;
  return bdRegex.test(number);
};


// ADD these handler functions:

const handleAddressInputChange = (e: any) => {
  setAddressFormData({ ...addressFormData, [e.target.name]: e.target.value });
};

const handleSelectAddress = (address: any) => {
  dispatch(selectAddress(address));
  toast.success("Address selected as default");
};

const handleEditAddress = (address: any) => {
  setEditingAddress(address);
  setAddressFormData({
    name: address.name,
    phone: address.phone,
    address: address.address,
    city: address.city,
    pincode: address.pincode,
    notes: address.notes || "",
  });
  setShowAddressModal(true);
};

const handleDeleteAddress = async (addressId: string) => {
  if (!confirm("Are you sure you want to delete this address?")) return;
  
  try {
    await dispatch(deleteAddress({ 
      addressId, 
      userId: user._id 
    })).unwrap();
    toast.success("Address deleted successfully");
  } catch (error) {
    toast.error("Failed to delete address");
  }
};

const handleSaveAddress = async () => {
  const { name, phone, address, city, pincode } = addressFormData;

  if (!name || !phone || !address || !city || !pincode) {
    toast.error("Please fill all required fields");
    return;
  }

  if (!validateBDPhoneNumber(phone)) {
    toast.error("Please enter a valid BD mobile number (01XXXXXXXXX)");
    return;
  }

  try {
    if (editingAddress) {
      await dispatch(updateAddress({
        addressId: editingAddress._id,
        userId: user._id,
        ...addressFormData
      })).unwrap();
      toast.success("Address updated successfully");
    } else {
      await dispatch(createAddress({
        userId: user._id,
        ...addressFormData,
        isDefault: addresses.length === 0
      })).unwrap();
      toast.success("Address saved successfully");
    }
    setShowAddressModal(false);
    setEditingAddress(null);
    setAddressFormData({
      name: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
      notes: "",
    });
  } catch (error) {
    toast.error("Failed to save address");
  }
};

const handleSetDefaultAddress = async (addressId: string) => {
  try {
    await dispatch(setDefaultAddress({ 
      addressId, 
      userId: user._id 
    })).unwrap();
    toast.success("Default address updated");
  } catch (error) {
    toast.error("Failed to update default address");
  }
};




  const getOrderStatusColor = (status: string) => {
    const statusColors: any = {
      pending: "from-yellow-500 to-orange-500",
      confirmed: "from-blue-500 to-cyan-500",
      processing: "from-purple-500 to-pink-500",
      shipped: "from-indigo-500 to-blue-500",
      delivered: "from-green-500 to-emerald-500",
      cancelled: "from-red-500 to-rose-500",
    };
    return statusColors[status] || "from-gray-500 to-gray-600";
  };

  const getOrderStatusIcon = (status: string) => {
    const icons: any = {
      pending: <Clock className="w-5 h-5" />,
      confirmed: <CheckCircle className="w-5 h-5" />,
      processing: <Box className="w-5 h-5" />,
      shipped: <Truck className="w-5 h-5" />,
      delivered: <CheckCircle className="w-5 h-5" />,
      cancelled: <XCircle className="w-5 h-5" />,
    };
    return icons[status] || <Package className="w-5 h-5" />;
  };

  const orderStats = {
    total: userOrders?.length || 0,
    pending: userOrders?.filter((o: any) => o.orderStatus === "pending").length || 0,
    delivered: userOrders?.filter((o: any) => o.orderStatus === "delivered").length || 0,
    cancelled: userOrders?.filter((o: any) => o.orderStatus === "cancelled").length || 0,
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FE0002]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 py-8 px-4 mt-16 md:mt-0">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section with User Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-[#FE0002] via-[#be185d] to-rose-700 text-white rounded-3xl p-8 md:p-12 mb-8 overflow-hidden shadow-2xl"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/10 backdrop-blur-md border-4 border-white/30 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 md:w-16 md:h-16 text-white/80" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center border-4 border-white/30">
                <Award className="w-5 h-5 text-white" />
              </div>
            </motion.div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">Premium Member</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-white/80 text-lg flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              <div className="flex items-center gap-4 mt-4 justify-center md:justify-start text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  {user.role === "admin" ? "Admin" : "Member"}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center"
              >
                <div className="text-3xl font-bold mb-1">{orderStats.total}</div>
                <div className="text-sm text-white/80">Total Orders</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center"
              >
                <div className="text-3xl font-bold mb-1">{orderStats.delivered}</div>
                <div className="text-sm text-white/80">Delivered</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Navigation</h3>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <ChevronRight className="w-5 h-5 ml-auto" />
                    )}
                  </motion.button>
                ))}

                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all duration-300 mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <OverviewTab
                  user={user}
                  orderStats={orderStats}
                  recentOrders={userOrders?.slice(0, 3) || []}
                  getOrderStatusColor={getOrderStatusColor}
                  getOrderStatusIcon={getOrderStatusIcon}
                  router={router}
                />
              )}
              {activeTab === "orders" && (
                <OrdersTab
                  orders={userOrders || []}
                  loading={loading}
                  getOrderStatusColor={getOrderStatusColor}
                  getOrderStatusIcon={getOrderStatusIcon}
                  router={router}
                />
              )}
              {activeTab === "addresses" && (
                <AddressesTab 
                  user={user} 
                  addresses={addresses} 
                  selectedAddress={selectedAddress}
                  handlers={{
                    handleSelectAddress,
                    handleEditAddress,
                    handleDeleteAddress,
                    handleSetDefaultAddress,
                    setShowAddressModal,
                    setEditingAddress,
                    setAddressFormData,
                  }}
                />
              )}
              {activeTab === "settings" && <SettingsTab user={user} />}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogOut className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">
                  Confirm Logout
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to logout from your account?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD this Address Modal before the Logout Confirmation Modal */}
<AnimatePresence>
  {showAddressModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowAddressModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-gray-600 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            onClick={() => {
              setShowAddressModal(false);
              setEditingAddress(null);
            }}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={addressFormData.name}
              onChange={handleAddressInputChange}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FE0002] focus:ring-2 focus:ring-red-100 outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="phone"
              placeholder="BD Mobile Number (01XXXXXXXXX) *"
              value={addressFormData.phone}
              onChange={handleAddressInputChange}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FE0002] focus:ring-2 focus:ring-red-100 outline-none transition-all"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="address"
              placeholder="Street Address *"
              value={addressFormData.address}
              onChange={handleAddressInputChange}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FE0002] focus:ring-2 focus:ring-red-100 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="city"
                placeholder="City *"
                value={addressFormData.city}
                onChange={handleAddressInputChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FE0002] focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="pincode"
                placeholder="Post Code *"
                value={addressFormData.pincode}
                onChange={handleAddressInputChange}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FE0002] focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="relative">
            <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <textarea
              name="notes"
              placeholder="Notes (Optional)"
              value={addressFormData.notes}
              onChange={handleAddressInputChange}
              rows={3}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FE0002] focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveAddress}
              className="flex-1 py-3 bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {editingAddress ? "Update Address" : "Save Address"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowAddressModal(false);
                setEditingAddress(null);
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ user, orderStats, recentOrders, getOrderStatusColor, getOrderStatusIcon, router }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: orderStats.total, icon: <Package />, color: "from-blue-500 to-cyan-500" },
          { label: "Pending", value: orderStats.pending, icon: <Clock />, color: "from-yellow-500 to-orange-500" },
          { label: "Delivered", value: orderStats.delivered, icon: <CheckCircle />, color: "from-green-500 to-emerald-500" },
          { label: "Cancelled", value: orderStats.cancelled, icon: <XCircle />, color: "from-red-500 to-rose-500" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-white mb-4`}>
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2 text-[#FE0002] font-semibold hover:gap-3 transition-all"
          >
            View All
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders yet</p>
            <button
              onClick={() => router.push("/shop")}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order: any, index: number) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => router.push(`/orders/${order._id}`)}
                className="p-4 border border-gray-200 rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getOrderStatusColor(order.orderStatus)} rounded-xl flex items-center justify-center text-white`}>
                      {getOrderStatusIcon(order.orderStatus)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">#{order.orderNumber}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">৳{order.totalAmount}</div>
                    <div className={`text-sm font-semibold capitalize ${
                      order.orderStatus === "delivered" ? "text-green-600" :
                      order.orderStatus === "cancelled" ? "text-red-600" :
                      "text-blue-600"
                    }`}>
                      {order.orderStatus}
                    </div>
                  </div>
                </div>

                {/* Mini Order Timeline */}
                <div className="flex items-center gap-1 mt-4">
                  {["pending", "confirmed", "processing", "shipped", "delivered"].map((status, idx) => (
                    <div key={status} className="flex-1 flex items-center">
                      <div
                        className={`h-2 flex-1 rounded-full ${
                          getStatusIndex(order.orderStatus) >= idx
                            ? "bg-gradient-to-r from-[#FE0002] to-[#be185d]"
                            : "bg-gray-200"
                        }`}
                      />
                      {idx < 4 && (
                        <div
                          className={`w-2 h-2 rounded-full mx-1 ${
                            getStatusIndex(order.orderStatus) > idx
                              ? "bg-[#FE0002]"
                              : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push("/shop")}
          className="bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white rounded-2xl p-6 shadow-lg cursor-pointer"
        >
          <ShoppingBag className="w-8 h-8 mb-3" />
          <h3 className="font-bold text-lg mb-1">Continue Shopping</h3>
          <p className="text-sm text-white/80">Explore our latest collection</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push("/orders")}
          className="bg-white border-2 border-[#FE0002] text-[#FE0002] rounded-2xl p-6 shadow-lg cursor-pointer"
        >
          <Package className="w-8 h-8 mb-3" />
          <h3 className="font-bold text-lg mb-1">Track Orders</h3>
          <p className="text-sm text-gray-600">Monitor your deliveries</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push("/support")}
          className="bg-white border-2 border-gray-200 text-gray-700 rounded-2xl p-6 shadow-lg cursor-pointer hover:border-[#FE0002] transition-colors"
        >
          <Bell className="w-8 h-8 mb-3" />
          <h3 className="font-bold text-lg mb-1">Need Help?</h3>
          <p className="text-sm text-gray-600">Contact our support team</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Helper function
const getStatusIndex = (status: string) => {
  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered"];
  return statuses.indexOf(status);
};

// Part 2: All Tab Components and Order Details with Tracking

// Orders Tab Component with Advanced Tracking
const OrdersTab = ({ orders, loading, getOrderStatusColor, getOrderStatusIcon, router }: any) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter((o: any) => o.orderStatus === filter);

  const orderStatusSteps = [
    { key: "pending", label: "Order Placed", icon: <Package className="w-5 h-5" /> },
    { key: "confirmed", label: "Confirmed", icon: <CheckCircle className="w-5 h-5" /> },
    { key: "processing", label: "Processing", icon: <Box className="w-5 h-5" /> },
    { key: "shipped", label: "Shipped", icon: <Truck className="w-5 h-5" /> },
    { key: "delivered", label: "Delivered", icon: <CheckCircle className="w-5 h-5" /> },
  ];

  const getStepStatus = (orderStatus: string, stepKey: string) => {
    const orderIndex = orderStatusSteps.findIndex(s => s.key === orderStatus);
    const stepIndex = orderStatusSteps.findIndex(s => s.key === stepKey);
    
    if (orderStatus === "cancelled") {
      return "cancelled";
    }
    
    if (stepIndex <= orderIndex) {
      return "completed";
    } else if (stepIndex === orderIndex + 1) {
      return "current";
    }
    return "pending";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order History</h2>
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-semibold capitalize transition-all ${
                filter === status
                  ? "bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status} {status !== "all" && `(${orders.filter((o: any) => o.orderStatus === status).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#FE0002] mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No {filter !== "all" ? filter : ""} orders found</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => router.push("/shop")}
              className="px-6 py-3 bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Browse Products
            </button>
          </div>
        ) : (
          filteredOrders.map((order: any) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-r ${getOrderStatusColor(order.orderStatus)} rounded-xl flex items-center justify-center text-white`}>
                      {getOrderStatusIcon(order.orderStatus)}
                    </div>
                    <div>
                      <div className="font-bold text-xl text-gray-900">#{order.orderNumber}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">৳{order.totalAmount}</div>
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      order.orderStatus === "delivered" ? "bg-green-100 text-green-700" :
                      order.orderStatus === "cancelled" ? "bg-red-100 text-red-700" :
                      order.orderStatus === "shipped" ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {getOrderStatusIcon(order.orderStatus)}
                      <span className="capitalize">{order.orderStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              {order.orderStatus !== "cancelled" && (
                <div className="p-6 bg-gradient-to-r from-gray-50 to-rose-50/30">
                  <div className="flex justify-between items-start relative">
                    {/* Progress Line */}
                    <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-[#FE0002] to-[#be185d] transition-all duration-500"
                        style={{
                          width: `${((orderStatusSteps.findIndex(s => s.key === order.orderStatus) + 1) / orderStatusSteps.length) * 100}%`
                        }}
                      />
                    </div>

                    {orderStatusSteps.map((step, index) => {
                      const status = getStepStatus(order.orderStatus, step.key);
                      const isCompleted = status === "completed";
                      const isCurrent = status === "current";

                      return (
                        <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                              isCompleted || isCurrent
                                ? "bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white shadow-lg scale-110"
                                : "bg-white text-gray-400 border-2 border-gray-200"
                            }`}
                          >
                            {step.icon}
                          </motion.div>
                          <div className={`text-xs font-semibold text-center ${
                            isCompleted || isCurrent ? "text-[#FE0002]" : "text-gray-500"
                          }`}>
                            {step.label}
                          </div>
                          {(isCompleted || isCurrent) && order.statusHistory && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(
                                order.statusHistory.find((h: any) => h.status === step.key)?.timestamp || order.createdAt
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tracking Info */}
              {order.trackingNumber && (
                <div className="p-6 bg-blue-50 border-t border-blue-100">
                  <div className="flex items-center gap-4">
                    <Truck className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Tracking Number</div>
                      <div className="text-blue-600 font-mono text-lg">{order.trackingNumber}</div>
                    </div>
                    {order.courierService && (
                      <div className="ml-auto">
                        <div className="text-sm text-gray-600">Courier</div>
                        <div className="font-semibold text-gray-900">{order.courierService}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Box className="w-5 h-5" />
                  Order Items ({order.cartItems.length})
                </h4>
                <div className="space-y-3">
                  {order.cartItems.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-600">
                          Size: {item.size} • Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="font-bold text-gray-900">৳{item.price}</div>
                    </div>
                  ))}
                  {order.cartItems.length > 3 && (
                    <div className="text-center text-sm text-gray-600">
                      +{order.cartItems.length - 3} more items
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#FE0002] mt-1" />
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">Delivery Address</div>
                    <div className="text-gray-700">{order.addressInfo.name}</div>
                    <div className="text-gray-600 text-sm">{order.addressInfo.phone}</div>
                    <div className="text-gray-600 text-sm">{order.addressInfo.address}</div>
                    <div className="text-gray-600 text-sm">
                      {order.addressInfo.city} - {order.addressInfo.pincode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Eye className="w-5 h-5" />
                  View Details
                </button>
                {order.orderStatus === "delivered" && (
                  <button
                    onClick={() => router.push(`/products/${order.cartItems[0]?.productId}`)}
                    className="px-6 py-3 border-2 border-[#FE0002] text-[#FE0002] rounded-xl font-semibold hover:bg-[#FE0002] hover:text-white transition-all"
                  >
                    Buy Again
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <h3 className="text-2xl font-bold text-gray-900">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Full Timeline with Details */}
                <div>
                  <h4 className="font-bold text-lg mb-4 text-gray-600">Order Timeline</h4>
                  <div className="space-y-4">
                    {selectedOrder.statusHistory?.map((history: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FE0002] to-[#be185d] flex items-center justify-center text-white">
                            {getOrderStatusIcon(history.status)}
                          </div>
                          {idx < (selectedOrder.statusHistory?.length || 0) - 1 && (
                            <div className="w-0.5 h-16 bg-gradient-to-b from-[#FE0002] to-[#be185d]" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="font-semibold text-gray-900 capitalize">{history.status}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(history.timestamp).toLocaleString()}
                          </div>
                          {history.note && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                              {history.note}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg mb-4 text-gray-600">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>৳{selectedOrder.totalAmount - selectedOrder.shippingCharge + (selectedOrder.discountAmount || 0)}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({selectedOrder.couponCode})</span>
                        <span>-৳{selectedOrder.discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping ({selectedOrder.shippingType})</span>
                      <span>৳{selectedOrder.shippingCharge}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-300 flex justify-between font-bold text-lg text-gray-900">
                      <span>Total</span>
                      <span>৳{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h4 className="font-bold text-lg mb-3 text-gray-600">Payment Information</h4>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <CreditCard className="w-6 h-6 text-[#FE0002]" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {selectedOrder.paymentMethod === "COD" ? "Cash on Delivery" : selectedOrder.paymentMethod}
                      </div>
                      <div className={`text-sm ${
                        selectedOrder.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"
                      }`}>
                        {selectedOrder.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};



// REPLACE the entire AddressesTab component:
const AddressesTab = ({ user, addresses, selectedAddress, handlers }: any) => {
  const {
    handleSelectAddress,
    handleEditAddress,
    handleDeleteAddress,
    handleSetDefaultAddress,
    setShowAddressModal,
    setEditingAddress,
    setAddressFormData,
  } = handlers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your delivery addresses
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingAddress(null);
              setAddressFormData({
                name: "",
                phone: "",
                address: "",
                city: "",
                pincode: "",
                notes: "",
              });
              setShowAddressModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Add New Address
          </motion.button>
        </div>

        {addresses && addresses.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((addr: any, index: number) => (
              <motion.div
                key={addr._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  addr.isDefault
                    ? "border-[#FE0002] bg-gradient-to-br from-red-50 to-rose-50 shadow-lg"
                    : "border-gray-200 hover:border-[#FE0002] hover:shadow-md bg-white"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">{addr.name}</h4>
                      {addr.isDefault && (
                        <span className="text-xs bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white px-3 py-1 rounded-full font-bold">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {addr.phone}
                      </p>
                      <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{addr.address}, {addr.city} - {addr.pincode}</span>
                      </p>
                      {addr.notes && (
                        <p className="flex items-start gap-2 text-xs italic">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span>{addr.notes}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {!addr.isDefault && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSetDefaultAddress(addr._id)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors text-sm"
                    >
                      Set as Default
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditAddress(addr)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <MapPin className="w-10 h-10 text-gray-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No saved addresses yet</h3>
            <p className="text-gray-600 mb-6">Add your first delivery address to get started</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingAddress(null);
                setAddressFormData({
                  name: "",
                  phone: "",
                  address: "",
                  city: "",
                  pincode: "",
                  notes: "",
                });
                setShowAddressModal(true);
              }}
              className="px-8 py-3 bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Add Your First Address
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Settings Tab
// Settings Tab Component
const SettingsTab = ({ user }: any) => {
  const dispatch = useDispatch();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
  });

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name });
    }
  }, [user]);

  const handleProfileChange = (e: any) => {
    setProfileData({ name: e.target.value });
  };

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSavingProfile(true);

    try {
      const result = await dispatch(updateUserProfile({
        userId: user._id,
        name: profileData.name,
      })).unwrap();

      if (result.success) {
        toast.success("Display name updated successfully!");
        setIsEditingProfile(false);
      }
    } catch (error: any) {
      toast.error(error || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setProfileData({ name: user.name });
    setIsEditingProfile(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Profile Settings */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                <p className="text-blue-100 text-sm">Update your display name</p>
              </div>
            </div>
            {!isEditingProfile && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditingProfile(true)}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </motion.button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                disabled={!isEditingProfile}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all text-gray-600 ${
                  isEditingProfile
                    ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                } outline-none`}
                placeholder="Enter your display name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600 outline-none cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Email cannot be changed
            </p>
          </div>

          {isEditingProfile && (
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="flex-1 py-3 bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSavingProfile ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancelProfile}
                disabled={isSavingProfile}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
              >
                Cancel
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Account Information
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Account Status</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Member Since</span>
            <span className="text-sm font-semibold text-gray-900">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Account Type</span>
            <span className="text-sm font-semibold text-gray-900 capitalize">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export { OrdersTab, AddressesTab, SettingsTab };

export default UserAccountPage;