"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Box,
  Search,
  Filter,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  ShoppingBag,
  Download,
  Eye,
  RotateCcw,
  Star,
  Sparkles,
  FileText,
  CreditCard,
  Home,
  Gift,
  Zap,
  Target,
  Award,
  AlertCircle,
  Info,
  ExternalLink,
} from "lucide-react";
import { fetchUserOrders } from "@/lib/redux/slices/orderSlice";
import { OrderDetailsModal, OrderCard } from "@/components/products/OrderDetailsModal";

const OrdersPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const { userOrders, loading, pagination } = useSelector((state: any) => state.order);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Fetch orders
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUserOrders({ userId: user._id, page: 1, limit: 50 }));
    }
  }, [user, dispatch]);

  // Filter and sort orders
  const filteredOrders = userOrders
    ?.filter((order: any) => {
      // Status filter
      if (selectedStatus !== "all" && order.orderStatus !== selectedStatus) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return (
          order.orderNumber.toLowerCase().includes(search) ||
          order.addressInfo.name.toLowerCase().includes(search) ||
          order.addressInfo.phone.includes(search)
        );
      }

      // Date filter
      if (dateFilter !== "all") {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === "week" && diffDays > 7) return false;
        if (dateFilter === "month" && diffDays > 30) return false;
        if (dateFilter === "3months" && diffDays > 90) return false;
      }

      return true;
    })
    .sort((a: any, b: any) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "amount-high") {
        return b.totalAmount - a.totalAmount;
      } else if (sortBy === "amount-low") {
        return a.totalAmount - b.totalAmount;
      }
      return 0;
    });

  // Order statistics
  const orderStats = {
    total: userOrders?.length || 0,
    pending: userOrders?.filter((o: any) => o.orderStatus === "pending").length || 0,
    confirmed: userOrders?.filter((o: any) => o.orderStatus === "confirmed").length || 0,
    processing: userOrders?.filter((o: any) => o.orderStatus === "processing").length || 0,
    shipped: userOrders?.filter((o: any) => o.orderStatus === "shipped").length || 0,
    delivered: userOrders?.filter((o: any) => o.orderStatus === "delivered").length || 0,
    cancelled: userOrders?.filter((o: any) => o.orderStatus === "cancelled").length || 0,
    totalSpent: userOrders?.reduce((sum: number, o: any) => 
      o.orderStatus !== "cancelled" ? sum + o.totalAmount : sum, 0) || 0,
  };

  const statusOptions = [
    { value: "all", label: "All Orders", icon: <Package />, color: "from-gray-500 to-gray-600", count: orderStats.total },
    { value: "pending", label: "Pending", icon: <Clock />, color: "from-yellow-500 to-orange-500", count: orderStats.pending },
    { value: "confirmed", label: "Confirmed", icon: <CheckCircle />, color: "from-blue-500 to-cyan-500", count: orderStats.confirmed },
    { value: "processing", label: "Processing", icon: <Box />, color: "from-purple-500 to-pink-500", count: orderStats.processing },
    { value: "shipped", label: "Shipped", icon: <Truck />, color: "from-indigo-500 to-blue-500", count: orderStats.shipped },
    { value: "delivered", label: "Delivered", icon: <CheckCircle />, color: "from-green-500 to-emerald-500", count: orderStats.delivered },
    { value: "cancelled", label: "Cancelled", icon: <XCircle />, color: "from-red-500 to-rose-500", count: orderStats.cancelled },
  ];

  const getOrderStatusColor = (status: string) => {
    const option = statusOptions.find(s => s.value === status);
    return option?.color || "from-gray-500 to-gray-600";
  };

  const getOrderStatusIcon = (status: string) => {
    const option = statusOptions.find(s => s.value === status);
    return option?.icon || <Package />;
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FE0002] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 py-8 px-4 mt-16 md:mt-0">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-[#FE0002] via-[#be185d] to-rose-700 text-white rounded-3xl p-8 md:p-12 mb-8 overflow-hidden shadow-2xl"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            {/* Back Button */}
            <button
              onClick={() => router.push("/account")}
              className="flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Account</span>
            </button>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">Order Management</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2 flex items-center gap-3">
                  <ShoppingBag className="w-10 h-10" />
                  My Orders
                </h1>
                <p className="text-white/80 text-lg">
                  Track and manage all your orders in one place
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[120px]"
                >
                  <div className="text-3xl font-bold mb-1">{orderStats.total}</div>
                  <div className="text-sm text-white/80">Total Orders</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[120px]"
                >
                  <div className="text-3xl font-bold mb-1">৳{orderStats.totalSpent}</div>
                  <div className="text-sm text-white/80">Total Spent</div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Filter Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {statusOptions.map((status, index) => (
              <motion.button
                key={status.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedStatus(status.value)}
                className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
                  selectedStatus === status.value
                    ? "shadow-2xl ring-4 ring-[#FE0002]/30"
                    : "shadow-lg hover:shadow-xl"
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${status.color} opacity-${selectedStatus === status.value ? '100' : '90'}`} />
                <div className="relative z-10 text-white">
                  <div className="flex justify-center mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center ${
                      selectedStatus === status.value ? 'scale-110' : ''
                    } transition-transform`}>
                      {status.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{status.count}</div>
                  <div className="text-xs font-semibold opacity-90">{status.label}</div>
                </div>
                {selectedStatus === status.value && (
                  <motion.div
                    layoutId="activeStatus"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-white"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Search & Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 text-gray-600"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FE0002] focus:outline-none transition-colors"
              />
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FE0002] focus:outline-none transition-colors bg-white"
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#FE0002] focus:outline-none transition-colors bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>

            
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-600">
              Showing <span className="font-bold text-gray-900">{filteredOrders?.length || 0}</span> of{" "}
              <span className="font-bold text-gray-900">{orderStats.total}</span> orders
            </div>
            {(searchQuery || selectedStatus !== "all" || dateFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("all");
                  setDateFilter("all");
                  setSortBy("newest");
                }}
                className="flex items-center gap-2 text-[#FE0002] font-semibold hover:underline"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Orders List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FE0002] mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading your orders...</p>
            </motion.div>
          ) : filteredOrders?.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-[#FE0002] to-[#be185d] rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery || selectedStatus !== "all" || dateFilter !== "all"
                  ? "Try adjusting your filters to see more results"
                  : "You haven't placed any orders yet. Start shopping to see your orders here!"}
              </p>
              <div className="flex gap-4 justify-center">
                {(searchQuery || selectedStatus !== "all" || dateFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedStatus("all");
                      setDateFilter("all");
                    }}
                    className="px-6 py-3 border-2 border-[#FE0002] text-[#FE0002] rounded-xl font-semibold hover:bg-[#FE0002] hover:text-white transition-all"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => router.push("/shop")}
                  className="px-6 py-3 bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Start Shopping
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {filteredOrders.map((order: any, index: number) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  index={index}
                  getOrderStatusColor={getOrderStatusColor}
                  getOrderStatusIcon={getOrderStatusIcon}
                  onViewDetails={() => setSelectedOrder(order)}
                  router={router}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Order Details Modal - Will be in Part 2 */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            getOrderStatusColor={getOrderStatusColor}
            getOrderStatusIcon={getOrderStatusIcon}
            router={router}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersPage;