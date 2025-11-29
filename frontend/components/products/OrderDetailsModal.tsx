import React from "react";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Box,
  MapPin,
  Phone,
  Calendar,
  Eye,
  Download,
  Star,
  CreditCard,
  Gift,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  User,
  Mail,
  Home,
  FileText,
  RotateCcw,
  MessageCircle,
  Share2,
  Printer,
  Copy,
  Check,
} from "lucide-react";

// Order Card Component
const OrderCard = ({ 
  order, 
  index, 
  getOrderStatusColor, 
  getOrderStatusIcon, 
  onViewDetails,
  router 
}: any) => {
  const orderStatusSteps = [
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentStepIndex = orderStatusSteps.findIndex(s => s.key === order.orderStatus);
  const progress = order.orderStatus === "cancelled" ? 0 : ((currentStepIndex + 1) / orderStatusSteps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      {/* Order Header */}
      <div className="relative p-6 bg-gradient-to-r from-gray-50 to-rose-50/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={`w-16 h-16 bg-gradient-to-r ${getOrderStatusColor(order.orderStatus)} rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}
            >
              {getOrderStatusIcon(order.orderStatus)}
            </motion.div>

            {/* Order Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900">#{order.orderNumber}</h3>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  order.orderStatus === "delivered" ? "bg-green-100 text-green-700" :
                  order.orderStatus === "cancelled" ? "bg-red-100 text-red-700" :
                  order.orderStatus === "shipped" ? "bg-blue-100 text-blue-700" :
                  order.orderStatus === "processing" ? "bg-purple-100 text-purple-700" :
                  order.orderStatus === "confirmed" ? "bg-cyan-100 text-cyan-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span className="capitalize">{order.orderStatus}</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {order.cartItems.length} {order.cartItems.length === 1 ? "Item" : "Items"}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Total Amount</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-[#FE0002] to-[#be185d] bg-clip-text text-transparent">
              ৳{order.totalAmount}
            </div>
            {order.discountAmount > 0 && (
              <div className="text-xs text-green-600 font-semibold flex items-center justify-end gap-1 mt-1">
                <Gift className="w-3 h-3" />
                Saved ৳{order.discountAmount}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar for Active Orders */}
        {order.orderStatus !== "cancelled" && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-600">Order Progress</span>
              <span className="text-xs font-bold text-[#FE0002]">{Math.round(progress)}%</span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FE0002] to-[#be185d] rounded-full"
              />
            </div>

            {/* Status Steps */}
            <div className="flex justify-between items-center mt-4">
              {orderStatusSteps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all ${
                        isCompleted
                          ? "bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white shadow-lg"
                          : "bg-gray-200 text-gray-400"
                      } ${isCurrent ? "ring-4 ring-[#FE0002]/30 scale-110" : ""}`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </motion.div>
                    <span className={`text-xs font-medium text-center ${
                      isCompleted ? "text-[#FE0002]" : "text-gray-500"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled Order Notice */}
        {order.orderStatus === "cancelled" && (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-red-900 mb-1">Order Cancelled</div>
              <div className="text-sm text-red-700">
                This order was cancelled on{" "}
                {order.cancelledAt
                  ? new Date(order.cancelledAt).toLocaleDateString()
                  : new Date(order.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tracking Info */}
      {order.trackingNumber && order.orderStatus !== "cancelled" && (
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white">
              <Truck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">Tracking Number</div>
              <div className="font-bold text-blue-600 font-mono text-lg">{order.trackingNumber}</div>
            </div>
            {order.courierService && (
              <div className="text-right">
                <div className="text-xs text-gray-600 mb-1">Courier</div>
                <div className="font-semibold text-gray-900">{order.courierService}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Items Preview */}
      <div className="p-6 border-t border-gray-100">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Box className="w-5 h-5 text-[#FE0002]" />
          Order Items
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {order.cartItems.slice(0, 4).map((item: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-14 h-14 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">{item.title}</div>
                <div className="text-xs text-gray-600">
                  {item.size} • Qty: {item.quantity}
                </div>
              </div>
              <div className="font-bold text-gray-900 text-sm">৳{item.price * item.quantity}</div>
            </motion.div>
          ))}
        </div>
        {order.cartItems.length > 4 && (
          <div className="mt-3 text-center">
            <span className="text-sm text-gray-600 font-medium">
              +{order.cartItems.length - 4} more {order.cartItems.length - 4 === 1 ? "item" : "items"}
            </span>
          </div>
        )}
      </div>

      {/* Delivery Address */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-rose-50/20 border-t border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#FE0002] to-[#be185d] rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 mb-2">Delivery Address</div>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">{order.addressInfo.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{order.addressInfo.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <Home className="w-4 h-4 text-gray-500 mt-0.5" />
                <span>
                  {order.addressInfo.address}, {order.addressInfo.city} - {order.addressInfo.pincode}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-100 flex flex-wrap gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onViewDetails}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Eye className="w-5 h-5" />
          View Details
        </motion.button>

        {order.orderStatus === "delivered" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 border-2 border-[#FE0002] text-[#FE0002] rounded-xl font-semibold hover:bg-[#FE0002] hover:text-white transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Buy Again
          </motion.button>
        )}

        {order.orderStatus === "shipped" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center gap-2"
          >
            <Truck className="w-5 h-5" />
            Track
          </motion.button>
        )}

        {/* <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Invoice
        </motion.button> */}
      </div>
    </motion.div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ 
  order, 
  onClose, 
  getOrderStatusColor, 
  getOrderStatusIcon,
  router 
}: any) => {
  const [copied, setCopied] = React.useState(false);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const orderStatusSteps = [
    { key: "pending", label: "Order Placed", icon: <Package className="w-5 h-5" />, desc: "Your order has been received" },
    { key: "confirmed", label: "Confirmed", icon: <CheckCircle className="w-5 h-5" />, desc: "Order confirmed by seller" },
    { key: "processing", label: "Processing", icon: <Box className="w-5 h-5" />, desc: "Preparing your order" },
    { key: "shipped", label: "Shipped", icon: <Truck className="w-5 h-5" />, desc: "Order is on the way" },
    { key: "delivered", label: "Delivered", icon: <CheckCircle className="w-5 h-5" />, desc: "Order delivered successfully" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Modal Header */}
        <div className={`sticky top-0 z-20 bg-gradient-to-r ${getOrderStatusColor(order.orderStatus)} text-white p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/30"
              >
                {getOrderStatusIcon(order.orderStatus)}
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
                  <button
                    onClick={copyOrderNumber}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-white/90 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors border-2 border-white/30"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6 space-y-8">
          {/* Order Timeline */}
          {order.orderStatus !== "cancelled" && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#FE0002]" />
                Order Journey
              </h3>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-8 bottom-8 w-1 bg-gray-200">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ 
                      height: `${(orderStatusSteps.findIndex(s => s.key === order.orderStatus) / (orderStatusSteps.length - 1)) * 100}%` 
                    }}
                    transition={{ duration: 1 }}
                    className="w-full bg-gradient-to-b from-[#FE0002] to-[#be185d]"
                  />
                </div>

                {/* Timeline Steps */}
                <div className="space-y-6">
                  {orderStatusSteps.map((step, idx) => {
                    const historyItem = order.statusHistory?.find((h: any) => h.status === step.key);
                    const isCompleted = !!historyItem;
                    const isCurrent = order.orderStatus === step.key;

                    return (
                      <motion.div
                        key={step.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative flex gap-4"
                      >
                        {/* Step Icon */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.1 + 0.2, type: "spring" }}
                          className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                            isCompleted
                              ? "bg-gradient-to-r from-[#FE0002] to-[#be185d] border-white shadow-lg"
                              : "bg-white border-gray-200"
                          } ${isCurrent ? "ring-4 ring-[#FE0002]/30 scale-110" : ""}`}
                        >
                          <div className={isCompleted ? "text-white" : "text-gray-400"}>
                            {step.icon}
                          </div>
                        </motion.div>

                        {/* Step Content */}
                        <div className={`flex-1 pb-6 ${isCompleted ? "" : "opacity-50"}`}>
                          <div className={`p-4 rounded-xl ${
                            isCurrent ? "bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-[#FE0002]" : "bg-gray-50"
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className={`font-bold ${isCompleted ? "text-gray-900" : "text-gray-500"}`}>
                                  {step.label}
                                </h4>
                                <p className={`text-sm ${isCompleted ? "text-gray-600" : "text-gray-400"}`}>
                                  {step.desc}
                                </p>
                              </div>
                              {isCurrent && (
                                <span className="px-3 py-1 bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white text-xs font-bold rounded-full">
                                  Current
                                </span>
                              )}
                            </div>

                            {historyItem && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <Clock className="w-4 h-4" />
                                  {new Date(historyItem.timestamp).toLocaleString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                {historyItem.note && (
                                  <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                                    {historyItem.note}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tracking Information */}
          {order.trackingNumber && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-6 h-6 text-blue-600" />
                Shipment Tracking
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">Tracking Number</div>
                  <div className="font-bold text-blue-600 font-mono text-lg">{order.trackingNumber}</div>
                </div>
                {order.courierService && (
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <div className="text-sm text-gray-600 mb-1">Courier Service</div>
                    <div className="font-bold text-gray-900 text-lg">{order.courierService}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Box className="w-6 h-6 text-[#FE0002]" />
              Order Items ({order.cartItems.length})
            </h3>
            <div className="space-y-3">
              {order.cartItems.map((item: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>Size: {item.size}</span>
                      <span>•</span>
                      <span>Qty: {item.quantity}</span>
                      <span>•</span>
                      <span>Price: ৳{item.price}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-lg">৳{item.price * item.quantity}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-rose-50/30 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#FE0002]" />
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal ({order.cartItems.length} items)</span>
                <span className="font-semibold">
                  ৳{order.totalAmount - order.shippingCharge + (order.discountAmount || 0)}
                </span>
              </div>
              
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Discount ({order.couponCode})
                  </span>
                  <span className="font-semibold">-৳{order.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-700">
                <span>Shipping ({order.shippingType})</span>
                <span className="font-semibold">৳{order.shippingCharge}</span>
              </div>

              <div className="pt-3 border-t-2 border-gray-300 flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total Amount</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-[#FE0002] to-[#be185d] bg-clip-text text-transparent">
                  ৳{order.totalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#FE0002]" />
              Delivery Address
              </h3>
           
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FE0002] to-[#be185d] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Full Name</div>
                  <div className="font-semibold text-gray-900">{order.addressInfo.name}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Phone Number</div>
                  <div className="font-semibold text-gray-900">{order.addressInfo.phone}</div>
                </div>
              </div>

              {order.addressInfo.email && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Email</div>
                    <div className="font-semibold text-gray-900">{order.addressInfo.email}</div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Address</div>
                  <div className="font-semibold text-gray-900">
                    {order.addressInfo.address}
                    <br />
                    {order.addressInfo.city} - {order.addressInfo.pincode}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#FE0002]" />
              Payment Information
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="text-sm text-gray-600 mb-2">Payment Method</div>
                <div className="font-bold text-gray-900 text-lg">
                  {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-sm text-gray-600 mb-2">Payment Status</div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold ${
                  order.paymentStatus === "paid" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span className="capitalize">{order.paymentStatus}</span>
                </div>
              </div>

              {order.paymentId && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Payment ID</div>
                  <div className="font-mono text-sm text-gray-900 break-all">{order.paymentId}</div>
                </div>
              )}

              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="text-sm text-gray-600 mb-2">Shipping Type</div>
                <div className="font-semibold text-gray-900">{order.shippingType}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        {order.notes && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Order Notes
            </h3>
            <p className="text-gray-700 leading-relaxed">{order.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        {/* <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6 -mx-6 -mb-6 rounded-b-3xl">
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Download className="w-5 h-5" />
              Download Invoice
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share
            </motion.button>

            {order.orderStatus === "delivered" && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all flex items-center gap-2"
                >
                  <Star className="w-5 h-5" />
                  Rate Order
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-4 border-2 border-[#FE0002] text-[#FE0002] rounded-xl font-semibold hover:bg-[#FE0002] hover:text-white transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Buy Again
                </motion.button>
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </motion.button>
          </div>
        </div> */}
</motion.div>
    </motion.div>
  );
};

export { OrderCard, OrderDetailsModal };