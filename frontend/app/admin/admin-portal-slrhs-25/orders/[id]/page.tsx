"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  downloadInvoice,
  clearSelectedOrder,
  clearError
} from "@/lib/redux/slices/adminOrderSlice";
import {
  Package,
  ArrowLeft,
  Download,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  FileText,
  Loader2,
  Edit3,
  Save,
  X,
  PackageCheck,
  Ban,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

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
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 ${config.bg} ${config.text}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}

// Payment Badge Component
function PaymentBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string; icon: any }> = {
    pending: { bg: "bg-orange-100 border-orange-300", text: "text-orange-700", label: "Pending", icon: Clock },
    paid: { bg: "bg-green-100 border-green-300", text: "text-green-700", label: "Paid", icon: CheckCircle },
    failed: { bg: "bg-red-100 border-red-300", text: "text-red-700", label: "Failed", icon: XCircle },
  };

  const badge = config[status] || config.pending;
  const Icon = badge.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${badge.bg} ${badge.text}`}>
      <Icon className="w-4 h-4" />
      {badge.label}
    </span>
  );
}

// Timeline Component
function OrderTimeline({ statusHistory }: { statusHistory: any[] }) {
  const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  
  return (
    <div className="relative">
      {statusHistory.map((history, index) => {
        const isLast = index === statusHistory.length - 1;
        
        return (
          <div key={index} className="relative pb-8">
            {!isLast && (
              <div className="absolute left-4 top-8 h-full w-0.5 bg-gradient-to-b from-purple-300 to-gray-200"></div>
            )}
            
            <div className="relative flex items-start gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isLast ? 'bg-gradient-to-br from-purple-500 to-fuchsia-500 ring-4 ring-purple-100' : 'bg-gray-300'
              }`}>
                {isLast ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 bg-white rounded-xl border-2 border-gray-100 p-4 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-black capitalize">{history.status}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(history.timestamp).toLocaleString()}
                  </span>
                </div>
                {history.note && (
                  <p className="text-sm text-gray-600">{history.note}</p>
                )}
                {history.updatedBy && (
                  <p className="text-xs text-purple-600 mt-2">
                    Updated by: {history.updatedBy.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Quick Actions Modal
function QuickActionsModal({ order, onClose, onRefresh }: any) {
  const dispatch = useAppDispatch();
  const [isUpdating, setIsUpdating] = useState(false);
  const [note, setNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(order.orderStatus);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(order.paymentStatus);

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.orderStatus && selectedPaymentStatus === order.paymentStatus) {
      toast.error("No changes detected");
      return;
    }

    setIsUpdating(true);
    try {
      if (selectedStatus !== order.orderStatus) {
        await dispatch(updateOrderStatus({ 
          orderId: order._id, 
          status: selectedStatus, 
          note 
        })).unwrap();
      }
      
      if (selectedPaymentStatus !== order.paymentStatus) {
        await dispatch(updatePaymentStatus({ 
          orderId: order._id, 
          paymentStatus: selectedPaymentStatus, 
          note 
        })).unwrap();
      }

      toast.success("Order updated successfully");
      onRefresh();
      onClose();
    } catch (error: any) {
      toast.error(error || "Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            Quick Actions
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Order Status */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
            Order Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['confirmed', 'processing', 'shipped', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                disabled={order.orderStatus === 'cancelled'}
                className={`p-3 rounded-xl border-2 font-semibold text-sm transition-all duration-300 ${
                  selectedStatus === status
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-purple-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
            Payment Status
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['pending', 'paid', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedPaymentStatus(status)}
                className={`p-3 rounded-xl border-2 font-semibold text-sm transition-all duration-300 ${
                  selectedPaymentStatus === status
                    ? status === 'paid'
                      ? 'bg-green-600 text-white border-green-600'
                      : status === 'failed'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
            Add Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any notes about this update..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-black"
            rows={4}
            disabled={isUpdating}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={isUpdating}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { selectedOrder: order, loading, error } = useAppSelector((state) => state.adminOrder);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Get the order ID from params (can be orderNumber like "ORD-2025-000001" or MongoDB _id)
  const orderId = params.id as string;

  useEffect(() => {
    console.log('🎯 Page - params:', params);
    console.log('🎯 Page - orderId:', orderId);
    
    if (orderId) {
      console.log('🚀 Page - Fetching order:', orderId);
      dispatch(fetchOrderById(orderId));
    }

    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [dispatch, orderId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    
    if (order.orderStatus === 'pending') {
      toast.error("Cannot generate invoice for pending orders");
      return;
    }

    setIsDownloading(true);
    try {
      await dispatch(downloadInvoice(order._id)).unwrap();
      toast.success("Invoice downloaded successfully");
    } catch (error: any) {
      toast.error(error || "Failed to download invoice");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await dispatch(cancelOrder({ orderId: order._id, reason: "Cancelled by admin" })).unwrap();
        toast.success("Order cancelled successfully");
        dispatch(fetchOrderById(orderNumber));
      } catch (error: any) {
        toast.error(error || "Failed to cancel order");
      }
    }
  };

  const refreshOrder = () => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-fuchsia-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/admin/admin-portal-slrhs-25/orders')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const subtotal = order.totalAmount - order.shippingCharge + order.discountAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 pb-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="pt-6 mb-6">
        <button
          onClick={() => router.push('/admin/admin-portal-slrhs-25/orders')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold mb-4 group transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Orders
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-fuchsia-800 bg-clip-text text-transparent mb-2">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowQuickActions(true)}
              disabled={order.orderStatus === 'cancelled'}
              className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit3 className="w-4 h-4" />
              Quick Update
            </button>
            
            <button
              onClick={handleDownloadInvoice}
              disabled={order.orderStatus === 'pending' || isDownloading}
              className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">Order Status</p>
              <StatusBadge status={order.orderStatus} />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">Payment Status</p>
              <PaymentBadge status={order.paymentStatus} />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-black">Order Items ({order.cartItems.length})</h2>
            </div>

            <div className="space-y-4">
              {order.cartItems.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-gradient-to-br from-purple-50/50 to-fuchsia-50/50 rounded-xl border-2 border-purple-100 hover:shadow-md transition-all duration-300"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-white rounded-xl overflow-hidden border-2 border-purple-200">
                    <Image
                      src={item.image || '/placeholder-product.png'}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black mb-1 truncate">{item.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">
                        Size: {item.size}
                      </span>
                      {item.color && (
                        <span className="px-2 py-1 bg-fuchsia-100 text-fuchsia-700 text-xs font-semibold rounded-lg">
                          Color: {item.color}
                        </span>
                      )}
                      {item.isPreorder && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
                          ⏳ Pre-order{item.preorderNote ? ` · ${item.preorderNote}` : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">৳{item.price} each</div>
                        <div className="font-bold text-purple-600">৳{(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t-2 border-gray-100">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">৳{subtotal.toLocaleString()}</span>
                </div>
                
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-semibold">-৳{order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-700">
                  <span>Shipping ({order.shippingType}):</span>
                  <span className="font-semibold">৳{order.shippingCharge.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-xl font-black text-black pt-3 border-t-2 border-purple-100">
                  <span>Total:</span>
                  <span className="text-purple-600">৳{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-black">Order Timeline</h2>
            </div>

            <OrderTimeline statusHistory={order.statusHistory} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-black">Customer Info</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-fuchsia-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {order.addressInfo.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-black">{order.addressInfo.name}</p>
                  {order.userId && (
                    <p className="text-sm text-gray-600">{order.userId.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="break-all">{order.addressInfo.phone}</span>
              </div>

              <div className="flex items-start gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <p>{order.addressInfo.address}</p>
                  <p>{order.addressInfo.city}, {order.addressInfo.pincode}</p>
                </div>
              </div>

              {order.addressInfo.notes && (
                <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">Delivery Notes:</p>
                  <p className="text-sm text-yellow-700">{order.addressInfo.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-black">Payment Details</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="font-semibold text-black">{order.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <PaymentBadge status={order.paymentStatus} />
              </div>

              {order.couponCode && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Coupon:</span>
                  <span className="font-semibold text-green-600">{order.couponCode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Info */}
          {(order.trackingNumber || order.courierService) && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-black">Shipping Info</h2>
              </div>

              <div className="space-y-3">
                {order.courierService && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Courier:</span>
                    <span className="font-semibold text-black">{order.courierService}</span>
                  </div>
                )}
                
                {order.trackingNumber && (
                  <div className="p-3 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                    <p className="text-xs font-semibold text-indigo-600 mb-1">Tracking Number:</p>
                    <p className="text-sm font-mono font-bold text-indigo-900 break-all">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {order.adminNotes && (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-black">Admin Notes</h2>
              </div>

              <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <p className="text-sm text-amber-900">{order.adminNotes}</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowQuickActions(true)}
                disabled={order.orderStatus === 'cancelled'}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit3 className="w-4 h-4" />
                Update Order
              </button>
              
              <button
                onClick={handleDownloadInvoice}
                disabled={order.orderStatus === 'pending' || isDownloading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/30"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download Invoice
              </button>
              
              {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                <button
                  onClick={handleCancelOrder}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-300 hover:scale-105"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Order Stats */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-black">Order Stats</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                <span className="text-sm text-gray-600">Total Items:</span>
                <span className="font-bold text-purple-600">{order.cartItems.length}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-sm text-gray-600">Total Quantity:</span>
                <span className="font-bold text-blue-600">
                  {order.cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-gray-600">Order Value:</span>
                <span className="font-bold text-green-600">৳{order.totalAmount.toLocaleString()}</span>
              </div>

              {order.confirmedAt && (
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-xl">
                  <span className="text-sm text-gray-600">Confirmed At:</span>
                  <span className="text-xs font-semibold text-indigo-600">
                    {new Date(order.confirmedAt).toLocaleString()}
                  </span>
                </div>
              )}

              {order.shippedAt && (
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-xl">
                  <span className="text-sm text-gray-600">Shipped At:</span>
                  <span className="text-xs font-semibold text-cyan-600">
                    {new Date(order.shippedAt).toLocaleString()}
                  </span>
                </div>
              )}

              {order.deliveredAt && (
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-sm text-gray-600">Delivered At:</span>
                  <span className="text-xs font-semibold text-emerald-600">
                    {new Date(order.deliveredAt).toLocaleString()}
                  </span>
                </div>
              )}

              {order.cancelledAt && (
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <span className="text-sm text-gray-600">Cancelled At:</span>
                  <span className="text-xs font-semibold text-red-600">
                    {new Date(order.cancelledAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Modal */}
      {showQuickActions && (
        <QuickActionsModal
          order={order}
          onClose={() => setShowQuickActions(false)}
          onRefresh={refreshOrder}
        />
      )}
    </div>
  );
}