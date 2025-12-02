"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  MapPin,
  Phone,
  Package,
  CreditCard,
  Sparkles,
  ArrowRight,
  FileText,
  Building2,
  Hash,
  Truck,
  Clock,
  User,
  Gift,
  Home,
  ShoppingBag,
  Star,
  Zap,
  Heart,
  Award,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchOrderById } from "@/lib/redux/slices/orderSlice";
import Confetti from "react-confetti";
import { toast } from "sonner";

export default function OrderConfirmation() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orderId = params.id as string;

  const { currentOrder, loading } = useAppSelector((state) => state.order);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    } else {
      router.push("/");
    }
  }, [orderId, dispatch, router]);

  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const { orderNumber, addressInfo, cartItems, totalAmount, shippingCharge, discountAmount, orderStatus } = currentOrder;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(50)].map((_, i) => {
          const isStar = i % 5 === 0;
          const isHeart = i % 7 === 0;
          const isGift = i % 9 === 0;
          
          return (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -50,
                opacity: 0,
              }}
              animate={{
                y: window.innerHeight + 50,
                opacity: [0, 0.8, 0.8, 0],
                rotate: [0, 360],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear",
              }}
            >
              {isStar ? (
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              ) : isHeart ? (
                <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
              ) : isGift ? (
                <Gift className="w-6 h-6 text-purple-400" />
              ) : (
                <div
                  className="rounded-full"
                  style={{
                    width: `${Math.random() * 10 + 4}px`,
                    height: `${Math.random() * 10 + 4}px`,
                    background: i % 3 === 0 ? "#60a5fa" : i % 3 === 1 ? "#818cf8" : "#a78bfa",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="text-center mb-12"
        >
          {/* Success Icon with Pulse */}
          <div className="relative inline-block mb-6">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-green-400 rounded-full blur-2xl"
            />
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>
          </div>

          {/* Success Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-amber-500" />
              </motion.div>
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 uppercase tracking-wider">
                Order Confirmed
              </span>
              <motion.div
                animate={{ rotate: [360, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-amber-500" />
              </motion.div>
            </div>

            <motion.h1
              className="text-5xl md:text-7xl font-black mb-4"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                Thank You!
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-600 mb-6"
            >
              Your order has been successfully placed! 🎉
            </motion.p>

            {/* Order Number Badge */}
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ delay: 0.7, type: "spring" }}
  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl cursor-pointer hover:shadow-purple-400 transition-all duration-300 group"
  onClick={() => {
    navigator.clipboard.writeText(orderNumber);
    toast.success("Order number copied to clipboard!", {
      icon: "📋",
      duration: 2000,
    });
  }}
>
  <Award className="w-6 h-6 text-white" />
  <div className="text-left">
            <p className="text-xs text-purple-100 font-semibold">Order Number (Click to Copy)</p>
            <p className="text-xl font-black text-white flex items-center gap-2">
              {orderNumber}
              <span
                className="text-md"
              >
                📋
              </span>
            </p>
          </div>
        </motion.div>
          </motion.div>
        </motion.div>

        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200/50 p-6 sm:p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Zap className="w-7 h-7 text-purple-600" />
              Order Timeline
            </h3>
            <div className="flex flex-wrap justify-between items-center gap-4">
              {[
                { icon: Package, label: "Order Placed", active: true },
                { icon: CheckCircle2, label: "Confirmed", active: orderStatus !== "pending" },
                { icon: Truck, label: "Shipped", active: orderStatus === "shipped" || orderStatus === "delivered" },
                { icon: Home, label: "Delivered", active: orderStatus === "delivered" },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex-1 min-w-[80px]"
                >
                  <div className="relative">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
                        step.active
                          ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-xl scale-110"
                          : "bg-gray-200"
                      }`}
                    >
                      <step.icon className={`w-8 h-8 ${step.active ? "text-white" : "text-gray-400"}`} />
                    </div>
                    {index < 3 && (
                      <div
                        className={`absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-1 ${
                          step.active ? "bg-green-400" : "bg-gray-200"
                        } hidden sm:block`}
                      />
                    )}
                  </div>
                  <p className={`text-center mt-3 text-sm font-semibold ${step.active ? "text-gray-900" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Shipping Details */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-200/50 overflow-hidden hover:shadow-purple-200 transition-shadow duration-500"
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                >
                  <MapPin className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Shipping Details</h2>
                  <p className="text-blue-100 text-sm">Your package will arrive here</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <DetailRow icon={User} label="Name" value={addressInfo.name} />
              <DetailRow icon={Phone} label="Phone" value={addressInfo.phone} />
              <DetailRow icon={MapPin} label="Address" value={addressInfo.address} />
              <DetailRow icon={Building2} label="City" value={addressInfo.city} />
              <DetailRow icon={Hash} label="Pincode" value={addressInfo.pincode} />
              {addressInfo.notes && (
                <DetailRow icon={FileText} label="Notes" value={addressInfo.notes} />
              )}
            </div>
          </motion.div>

          {/* Payment & Delivery Info */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="space-y-6"
          >
            {/* Payment Method */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-200/50 overflow-hidden hover:shadow-green-200 transition-shadow duration-500">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                  >
                    <CreditCard className="w-7 h-7 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Payment Method</h2>
                    <p className="text-green-100 text-sm">Secure & convenient</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-300">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you receive</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-200/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Delivery Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Estimated Delivery</p>
                    <p className="text-xs text-gray-600">2-4 business days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Delivery Contact</p>
                    <p className="text-xs text-gray-600">We'll call you before delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-indigo-200/50 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
              >
                <ShoppingBag className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white">Order Summary</h2>
                <p className="text-indigo-100 text-sm">{cartItems.length} items ordered</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.3 + index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-xl shadow-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Size: {item.size}</span>
                      <span>•</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">৳{item.price * item.quantity}</p>
                    <p className="text-xs text-gray-500">৳{item.price} each</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 pt-6 border-t-2 border-gray-200">
              <div className="flex justify-between text-gray-700">
                <span className="font-semibold">Subtotal</span>
                <span className="font-bold">৳{totalAmount - shippingCharge + discountAmount}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span className="font-semibold">Shipping</span>
                <span className="font-bold">৳{shippingCharge}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="font-semibold">Discount</span>
                  <span className="font-bold">-৳{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                <span className="text-2xl font-bold text-gray-900">Total Amount</span>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                >
                  ৳{totalAmount}
                </motion.span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/orders")}
                className="py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <Package className="w-5 h-5" />
                <span>Track Order</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/")}
                className="py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Continue Shopping</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
        }
      `}</style>
    </div>
  );
}

// Helper Component
const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <motion.div
    whileHover={{ x: 5 }}
    className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/50 hover:border-blue-300 transition-all duration-300 group"
  >
    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
      <Icon className="w-5 h-5 text-blue-600 group-hover:text-purple-600 transition-colors" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 font-semibold mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-gray-900 font-semibold text-sm">{value}</p>
    </div>
  </motion.div>
);