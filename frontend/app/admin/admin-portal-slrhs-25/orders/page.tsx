"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchAllOrders,
  fetchOrderStats,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  deleteOrder,
  downloadInvoice,
  setFilters,
  resetFilters,
  setPage,
  clearError
} from "@/lib/redux/slices/adminOrderSlice";
import {
  Package,
  Filter,
  Search,
  Download,
  XCircle,
  CheckCircle,
  Clock,
  Truck,
  PackageCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Loader2,
  MoreVertical,
  X,
  AlertCircle,
  ShoppingCart,
  TrendingUp,
  User,
  Phone,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; icon: any; label: string }> = {
    pending: { 
      bg: "bg-yellow-100 border-yellow-300", 
      text: "text-yellow-700", 
      icon: Clock, 
      label: "Pending" 
    },
    confirmed: { 
      bg: "bg-blue-100 border-blue-300", 
      text: "text-blue-700", 
      icon: CheckCircle, 
      label: "Confirmed" 
    },
    processing: { 
      bg: "bg-purple-100 border-purple-300", 
      text: "text-purple-700", 
      icon: Package, 
      label: "Processing" 
    },
    shipped: { 
      bg: "bg-indigo-100 border-indigo-300", 
      text: "text-indigo-700", 
      icon: Truck, 
      label: "Shipped" 
    },
    delivered: { 
      bg: "bg-green-100 border-green-300", 
      text: "text-green-700", 
      icon: PackageCheck, 
      label: "Delivered" 
    },
    cancelled: { 
      bg: "bg-red-100 border-red-300", 
      text: "text-red-700", 
      icon: Ban, 
      label: "Cancelled" 
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border-2 ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Payment Status Badge
function PaymentBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-orange-100", text: "text-orange-700", label: "Pending" },
    paid: { bg: "bg-green-100", text: "text-green-700", label: "Paid" },
    failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
  };

  const badge = config[status] || config.pending;

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
      {badge.label}
    </span>
  );
}

// Stats Card Component
function StatsCard({ icon: Icon, title, value, change, color, index }: any) {
  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-4 sm:p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
    >
      <div className={`absolute -top-10 -right-10 w-32 h-32 ${color} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`p-2 sm:p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-xs font-bold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {Math.abs(change)}%
            </div>
          )}
        </div>
        
        <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider">
          {title}
        </h3>
        <p className={`text-2xl sm:text-3xl font-black ${color} group-hover:scale-105 transition-transform duration-300`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// Order Actions Menu
function OrderActionsMenu({ order, onClose, onRefresh }: any) {
  const dispatch = useAppDispatch();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string; title: string; message: string } | null>(null);
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: string) => {
    setIsUpdating(true);
    try {
      await dispatch(updateOrderStatus({ orderId: order._id, status, note })).unwrap();
      toast.success(`Order status updated to ${status}`);
      setNote("");
      onRefresh();
      onClose();
    } catch (error: any) {
      toast.error(error || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (paymentStatus: string) => {
    setIsUpdating(true);
    try {
      await dispatch(updatePaymentStatus({ orderId: order._id, paymentStatus, note })).unwrap();
      toast.success(`Payment status updated to ${paymentStatus}`);
      setNote("");
      onRefresh();
      onClose();
    } catch (error: any) {
      toast.error(error || "Failed to update payment status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    setIsUpdating(true);
    try {
      await dispatch(cancelOrder({ orderId: order._id, reason: note })).unwrap();
      toast.success("Order cancelled successfully");
      setNote("");
      setShowConfirm(false);
      onRefresh();
      onClose();
    } catch (error: any) {
      toast.error(error || "Failed to cancel order");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      await dispatch(deleteOrder({ orderId: order._id })).unwrap();
      toast.success("Order deleted successfully");
      setShowConfirm(false);
      onRefresh();
      onClose();
    } catch (error: any) {
      toast.error(error || "Failed to delete order");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (order.orderStatus === 'pending') {
      toast.error("Cannot generate invoice for pending orders");
      return;
    }
    
    setIsUpdating(true);
    try {
      await dispatch(downloadInvoice(order._id)).unwrap();
      toast.success("Invoice downloaded successfully");
    } catch (error: any) {
      toast.error(error || "Failed to download invoice");
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmAndExecute = (action: { type: string; title: string; message: string }) => {
    setConfirmAction(action);
    setShowConfirm(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    
    switch (confirmAction.type) {
      case 'cancel':
        await handleCancel();
        break;
      case 'delete':
        await handleDelete();
        break;
    }
  };

  if (showConfirm && confirmAction) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-black">{confirmAction.title}</h3>
          </div>
          
          <p className="text-gray-600 mb-4">{confirmAction.message}</p>
          
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 mb-4 text-black"
            rows={3}
            disabled={isUpdating}
          />
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmAction(null);
                setNote("");
              }}
              disabled={isUpdating}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-black rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={executeAction}
              disabled={isUpdating}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-black">Order Actions</h3>
            <p className="text-sm text-gray-600 mt-1">Order #{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" disabled={isUpdating}>
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Update Order Status Section */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-black mb-3 uppercase tracking-wider">Update Order Status</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {['confirmed', 'processing', 'shipped', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={order.orderStatus === status || order.orderStatus === 'cancelled' || isUpdating}
                className={`p-2 sm:p-3 rounded-xl border-2 font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105 ${
                  order.orderStatus === status 
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 disabled:opacity-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Update Payment Status Section */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-black mb-3 uppercase tracking-wider">Update Payment Status</h4>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {['pending', 'paid', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => handlePaymentStatusUpdate(status)}
                disabled={order.paymentStatus === status || isUpdating}
                className={`p-2 sm:p-3 rounded-xl border-2 font-semibold text-xs sm:text-sm transition-all duration-300 hover:scale-105 ${
                  order.paymentStatus === status 
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    : status === 'paid'
                    ? 'bg-white border-green-200 text-green-600 hover:bg-green-50 hover:border-green-400 disabled:opacity-50'
                    : status === 'failed'
                    ? 'bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 disabled:opacity-50'
                    : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-400 disabled:opacity-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Note Input */}
        <div className="mb-6">
          <label className="text-sm font-bold text-black mb-2 block uppercase tracking-wider">
            Add Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any notes about this update..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-black"
            rows={3}
            disabled={isUpdating}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownloadInvoice}
            disabled={order.orderStatus === 'pending' || isUpdating}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 text-sm"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Invoice
          </button>
          
          <button
            onClick={() => confirmAndExecute({
              type: 'cancel',
              title: 'Cancel Order',
              message: 'Are you sure you want to cancel this order? This will restore product stock.'
            })}
            disabled={order.orderStatus === 'delivered' || order.orderStatus === 'cancelled' || isUpdating}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 text-sm"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </button>
          
          <button
            onClick={() => confirmAndExecute({
              type: 'delete',
              title: 'Delete Order',
              message: 'Are you sure you want to delete this order? This action cannot be undone.'
            })}
            disabled={isUpdating}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all duration-300 hover:scale-105 text-sm disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Mobile Order Card Component
function MobileOrderCard({ order, onAction, router }: any) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="font-bold text-purple-600 text-sm mb-1">#{order.orderNumber}</div>
          <div className="text-xs text-gray-500 mb-2">{order.cartItems.length} items</div>
          <button
            onClick={() => router.push(`/admin/admin-portal-slrhs-25/orders/${order.orderNumber}`)}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 underline"
          >
            View Details →
          </button>
        </div>
        <button
          onClick={() => onAction(order)}
          className="p-2 hover:bg-purple-100 rounded-lg transition-all duration-300"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Customer Info */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-black text-sm">{order.addressInfo.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-600">{order.addressInfo.phone}</span>
        </div>
      </div>

      {/* Amount & Payment */}
      <div className="mb-3 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600">Amount</span>
          <span className="font-bold text-black">৳{order.totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Payment</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">{order.paymentMethod}</span>
            <PaymentBadge status={order.paymentStatus} />
          </div>
        </div>
      </div>

      {/* Status & Date */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleTimeString()}
          </div>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { orders, loading, pagination, stats, filters, error } = useAppSelector((state) => state.adminOrder);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadOrders = () => {
    dispatch(fetchAllOrders({ ...filters, page: pagination.page }));
  };

  useEffect(() => {
    dispatch(fetchOrderStats());
    loadOrders();
  }, [dispatch, filters, pagination.page]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSearch = () => {
    dispatch(setFilters({ search: searchTerm }));
    dispatch(setPage(1));
  };

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(setPage(1));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleOrderAction = (order: any) => {
    setSelectedOrder(order);
    setShowActionsMenu(true);
  };

  const handleRefresh = () => {
    loadOrders();
    dispatch(fetchOrderStats());
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 pt-4 sm:pt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-10 sm:h-12 bg-gradient-to-b from-purple-600 via-fuchsia-600 to-pink-600 rounded-full"></div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-fuchsia-800 bg-clip-text text-transparent">
              Order Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and track all customer orders</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatsCard
            icon={ShoppingCart}
            title="Total Orders"
            value={stats.totalOrders}
            color="text-purple-600"
            index={0}
          />
          <StatsCard
            icon={Clock}
            title="Pending"
            value={stats.pendingOrders}
            color="text-yellow-600"
            index={1}
          />
          <StatsCard
            icon={PackageCheck}
            title="Delivered"
            value={stats.deliveredOrders}
            color="text-green-600"
            index={2}
          />
          <StatsCard
            icon={DollarSign}
            title="Revenue"
            value={`৳${stats.totalRevenue.toLocaleString()}`}
            change={12.5}
            color="text-emerald-600"
            index={3}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600" />
          <h2 className="text-base sm:text-lg font-bold text-black">Filters</h2>
        </div>

        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          {/* Search */}
          <div className="sm:col-span-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order#, name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 text-sm text-black"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 text-sm"
              >
                Search
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 font-semibold text-sm text-black"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Filter */}
          <select
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 font-semibold text-sm text-black"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {(filters.status !== 'all' || filters.paymentStatus !== 'all' || filters.search) && (
          <button
            onClick={() => {
              dispatch(resetFilters());
              setSearchTerm("");
            }}
            className="mt-4 text-sm text-purple-600 font-semibold hover:text-purple-700 transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Mobile View - Cards */}
      <div className="block lg:hidden space-y-4">
        {orders.map((order) => (
          <MobileOrderCard
            key={order._id}
            order={order}
            onAction={handleOrderAction}
            router={router}
          />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">No Orders Found</h3>
            <p className="text-gray-600">
              {filters.search || filters.status !== 'all' || filters.paymentStatus !== 'all'
                ? "Try adjusting your filters to see more results."
                : "Orders will appear here once customers start placing them."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border-b-2 border-purple-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Order</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-black uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr 
                      key={order._id} 
                      className="hover:bg-purple-50/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-purple-600">#{order.orderNumber}</div>
                        <div className="text-xs text-gray-500 mb-2">{order.cartItems.length} items</div>
                        <button
                          onClick={() => router.push(`/admin/admin-portal-slrhs-25/orders/${order.orderNumber}`)}
                          className="text-xs font-semibold text-purple-600 hover:text-purple-700 underline"
                        >
                          View Details →
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-fuchsia-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {order.addressInfo.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-black">{order.addressInfo.name}</div>
                            <div className="text-xs text-gray-500">{order.addressInfo.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-black">৳{order.totalAmount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{order.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4">
                        <PaymentBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-black">{new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleOrderAction(order)}
                          className="p-2 hover:bg-purple-100 rounded-lg transition-all duration-300 group inline-flex"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t-2 border-gray-100 gap-4">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 border-2 border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5 text-black" />
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        pagination.page === pageNum
                          ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
                          : 'border-2 border-gray-200 text-black hover:bg-purple-50 hover:border-purple-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 border-2 border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronRight className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pagination for Mobile */}
      {orders.length > 0 && (
        <div className="block lg:hidden mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 border-2 border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </button>
            
            <button
              className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
            >
              {pagination.page}
            </button>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-2 border-2 border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
      )}

      {/* Actions Modal */}
      {showActionsMenu && selectedOrder && (
        <OrderActionsMenu
          order={selectedOrder}
          onClose={() => {
            setShowActionsMenu(false);
            setSelectedOrder(null);
          }}
          onRefresh={handleRefresh}
        />
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="lg:hidden bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">No Orders Found</h3>
          <p className="text-gray-600">
            {filters.search || filters.status !== 'all' || filters.paymentStatus !== 'all'
              ? "Try adjusting your filters to see more results."
              : "Orders will appear here once customers start placing them."}
          </p>
          {(filters.search || filters.status !== 'all' || filters.paymentStatus !== 'all') && (
            <button
              onClick={() => {
                dispatch(resetFilters());
                setSearchTerm("");
              }}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}