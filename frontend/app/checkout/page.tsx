"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  MapPin,
  Building2,
  Hash,
  FileText,
  ShoppingBag,
  Truck,
  CreditCard,
  Shield,
  CheckCircle2,
  Package,
  Lock,
  Clock,
  Gift,
  ChevronRight,
  AlertCircle,
  X,
  Zap,
  Minus,
  Plus,
  Edit2,
  Trash2,
  MapPinned,
  PlusCircle,
  Tag,
  Percent,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchCartItems,
  clearCart,
  updateCartItemDB,
  removeFromCartDB,
  updateQuantity,
  removeFromCart,
} from "@/lib/redux/slices/cartSlice";
import {
  fetchAddresses,
  selectAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/redux/slices/addressSlice";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ModernCheckout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { addresses, selectedAddress } = useAppSelector((state) => state.address);

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [shippingType, setShippingType] = useState("inside");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });
// Check if cart has any sneakers
const hasSneakers = cartItems.some(item => 
  item.product.subCategory?.toLowerCase() === "sneakers" || item.subCategory?.toLowerCase() === "sneakers"
);
console.log("Cart Items: ",cartItems);

const shippingCharge = hasSneakers 
  ? (shippingType === "inside" ? 100 : 150)
  : (shippingType === "inside" ? 80 : 120);
 

  // Calculate cart totals - use salePrice if available, otherwise regular price
  const totalCartAmount = cartItems.reduce((sum, item) => {
    const effectivePrice = item.salePrice || item.price;
    return sum + (effectivePrice * item.quantity);
  }, 0);

  // Check if cart has any discounted products
// Check if cart has any discounted products
  const hasDiscountedProducts = cartItems.some(item => {
    const salePrice = item.salePrice || item.sale_price;
    const regularPrice = item.price || item.regularPrice || item.regular_price;
    console.log('🔍 Checking item:', {
      name: item.name || item.title,
      salePrice,
      regularPrice,
      hasDiscount: salePrice && regularPrice && salePrice < regularPrice
    });
    return salePrice && regularPrice && salePrice < regularPrice;
  });

  console.log('📊 Has Discounted Products:', hasDiscountedProducts);
  console.log('👤 Is Authenticated:', isAuthenticated);

  // ✅ FIXED: Calculate discount based on discount type
  const calculateCouponDiscount = () => {
    if (!appliedCoupon) return 0;

    let discount = 0;

    if (appliedCoupon.discountType === 'percentage') {
      // Calculate percentage discount
      discount = (totalCartAmount * appliedCoupon.discountValue) / 100;
      
      // Apply max discount cap if set
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.discountType === 'flat') {
      // Apply flat discount
      discount = appliedCoupon.discountValue;
    }

    // Discount cannot exceed order amount
    discount = Math.min(discount, totalCartAmount);

    return Math.round(discount);
  };

  const discountAmount = calculateCouponDiscount();
  const totalAmount = totalCartAmount - discountAmount + shippingCharge;

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchAddresses(user._id));
    }
  }, [isAuthenticated, user, dispatch]);

  // Auto-fill billing details when address is selected
  useEffect(() => {
    if (selectedAddress) {
      setBillingDetails({
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        pincode: selectedAddress.pincode,
        notes: selectedAddress.notes || "",
      });
    }
  }, [selectedAddress]);

  const handleInputChange = (e) => {
    setBillingDetails({ ...billingDetails, [e.target.name]: e.target.value });
  };

  const validateBDPhoneNumber = (number) => {
    const bdRegex = /^(?:\+88|88)?01[3-9]\d{8}$/;
    return bdRegex.test(number);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    // Check for discounted products
    if (hasDiscountedProducts) {
      setCouponError("Coupon cannot be applied to products that already have discounts");
      toast.error("Coupon cannot be applied to discounted products");
      return;
    }
    
    setIsApplyingCoupon(true);
    setCouponError("");
    
    try {
      // Prepare cart items for validation
      const cartItemsForValidation = cartItems.map(item => ({
        product: item.product || item.productId || item._id,
        productId: item.product || item.productId || item._id,
        title: item.name || item.title,
        price: item.price,
        salePrice: item.salePrice,
        quantity: item.quantity,
        size: item.size,
      }));

      const { data } = await api.post("/coupon/validate", { 
        couponCode: couponCode.trim(),
        orderAmount: totalCartAmount,
        userId: user?._id || null,
        cartItems: cartItemsForValidation
      });
      
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponError("");
        toast.success(`Coupon applied! You saved ৳${data.coupon.discountAmount}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid coupon code";
      setCouponError(errorMessage);
      setAppliedCoupon(null);
      toast.error(errorMessage);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast.success("Coupon removed");
  };

  const handleUpdateQuantity = async (itemId, currentQuantity, stock, type) => {
    const newQuantity = type === "plus" ? currentQuantity + 1 : currentQuantity - 1;

    if (newQuantity < 1) return;
    if (type === "plus" && newQuantity > stock) {
      toast.error(`Only ${stock} items available in stock`);
      return;
    }

    try {
      if (isAuthenticated && user) {
        await dispatch(updateCartItemDB({ 
          userId: user._id, 
          itemId, 
          quantity: newQuantity 
        })).unwrap();
      } else {
        dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
      }
      
      // If coupon was applied, need to revalidate with new cart total
      if (appliedCoupon) {
        toast.info("Cart updated. Please reapply your coupon.");
        handleRemoveCoupon();
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      if (isAuthenticated && user) {
        await dispatch(removeFromCartDB({ 
          userId: user._id, 
          itemId 
        })).unwrap();
      } else {
        dispatch(removeFromCart(itemId));
      }
      
      // If coupon was applied, need to revalidate with new cart
      if (appliedCoupon) {
        toast.info("Cart updated. Please reapply your coupon.");
        handleRemoveCoupon();
      }
      
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleSelectAddress = (address) => {
    dispatch(selectAddress(address));
    toast.success("Address selected");
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setBillingDetails({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      pincode: address.pincode,
      notes: address.notes || "",
    });
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addressId) => {
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
    const { name, phone, address, city, pincode } = billingDetails;

    if (!name || !phone || !address || !city || !pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!validateBDPhoneNumber(phone)) {
      toast.error("Please enter a valid BD mobile number");
      return;
    }

    try {
      if (editingAddress) {
        await dispatch(updateAddress({
          addressId: editingAddress._id,
          userId: user._id,
          ...billingDetails
        })).unwrap();
        toast.success("Address updated successfully");
      } else {
        await dispatch(createAddress({
          userId: user._id,
          ...billingDetails,
          isDefault: addresses.length === 0
        })).unwrap();
        toast.success("Address saved successfully");
      }
      setShowAddressModal(false);
      setEditingAddress(null);
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  const handlePlaceOrder = async () => {
    const { name, phone, address, city, pincode } = billingDetails;

    if (!name || !phone || !address || !city || !pincode) {
      toast.error("Please fill all required billing fields");
      return;
    }

    if (!validateBDPhoneNumber(phone)) {
      toast.error("Please enter a valid BD mobile number");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate cart items have required product field
    const invalidItems = cartItems.filter(item => !item.product && !item.productId && !item._id);
    if (invalidItems.length > 0) {
      console.error("Invalid cart items:", invalidItems);
      toast.error("Some cart items are invalid. Please refresh and try again.");
      return;
    }

    const orderData = {
      userId: user?._id || null,
      cartItems: cartItems.map((item) => ({
        productId: item.product || item.productId || item._id,
        title: item.name || item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color || "",
      })),
      addressInfo: billingDetails,
      paymentMethod: "COD",
      shippingCharge,
      shippingType,
      totalAmount,
      couponCode: appliedCoupon?.couponCode || null,
      discountAmount: appliedCoupon?.discountAmount || 0,
    };

    console.log("📦 Placing order with data:", {
      userId: orderData.userId,
      itemCount: orderData.cartItems.length,
      totalAmount: orderData.totalAmount,
      couponCode: orderData.couponCode,
      discountAmount: orderData.discountAmount,
      items: orderData.cartItems.map(i => ({
        productId: i.productId,
        title: i.title,
        size: i.size
      }))
    });

    setIsPlacingOrder(true);

    try {
      const { data } = await api.post("/order", orderData);

      if (data.success) {
        console.log("✅ Order created successfully:", data.order._id);
        
        // Clear cart after successful order
        if (isAuthenticated && user) {
          try {
            await api.delete(`/cart/${user._id}/clear`);
            await dispatch(fetchCartItems(user._id));
          } catch (clearError) {
            console.error("Cart clear error:", clearError);
          }
        } else {
          dispatch(clearCart());
        }

        setShowSuccess(true);

        // Redirect after animation
        setTimeout(() => {
          router.push(`/order-confirmation/${data.order._id}`);
        }, 2000);
      }
    } catch (error) {
      console.error("💥 Order placement error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || "Failed to place order. Please try again.";
      
      toast.error(errorMessage);
      
      if (error.response?.data?.details) {
        console.error("Error details:", error.response.data.details);
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 -left-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h3>
              <p className="text-gray-600 mb-4">Thank you for your purchase</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Redirecting to order confirmation...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
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
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <InputField
                  icon={User}
                  name="name"
                  placeholder="Full Name *"
                  value={billingDetails.name}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Phone}
                  name="phone"
                  placeholder="BD Mobile Number (01XXXXXXXXX) *"
                  value={billingDetails.phone}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={MapPin}
                  name="address"
                  placeholder="Street Address *"
                  value={billingDetails.address}
                  onChange={handleInputChange}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    icon={Building2}
                    name="city"
                    placeholder="City *"
                    value={billingDetails.city}
                    onChange={handleInputChange}
                  />
                  <InputField
                    icon={Hash}
                    name="pincode"
                    placeholder="Post Code *"
                    value={billingDetails.pincode}
                    onChange={handleInputChange}
                  />
                </div>
                <InputField
                  icon={FileText}
                  name="notes"
                  placeholder="Notes (Optional)"
                  value={billingDetails.notes}
                  onChange={handleInputChange}
                  textarea
                />

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveAddress}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl"
                  >
                    Save Address
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowAddressModal(false);
                      setEditingAddress(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40"
      >
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </motion.div>
            <span className="text-blue-600 font-semibold text-xs sm:text-sm uppercase tracking-wide">
              Secure Checkout
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Complete Your Order
          </h1>
          <p className="text-gray-600 text-center mt-1 text-xs sm:text-sm">
            Just a few steps away from your purchase
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Saved Addresses (Only for logged-in users) */}
            {isAuthenticated && user && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-shadow duration-500"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                        <MapPinned className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-xl font-bold text-white">Saved Addresses</h2>
                        <p className="text-indigo-100 text-xs sm:text-sm">Select or add new</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setEditingAddress(null);
                        setBillingDetails({
                          name: "",
                          phone: "",
                          address: "",
                          city: "",
                          pincode: "",
                          notes: "",
                        });
                        setShowAddressModal(true);
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Add New</span>
                    </motion.button>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {addresses.length > 0 ? (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <motion.div
                          key={addr._id}
                          whileHover={{ scale: 1.01 }}
                          onClick={() => handleSelectAddress(addr)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedAddress?._id === addr._id
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-bold text-gray-900">{addr.name}</h4>
                                {addr.isDefault && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{addr.phone}</p>
                              <p className="text-sm text-gray-600">
                                {addr.address}, {addr.city} - {addr.pincode}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAddress(addr);
                                }}
                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                              >
                                <Edit2 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(addr._id);
                                }}
                                className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500 mb-4">No saved addresses yet</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditingAddress(null);
                          setShowAddressModal(true);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold"
                      >
                        Add Your First Address
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Billing Details */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-shadow duration-500"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-white">Delivery Details</h2>
                    <p className="text-blue-100 text-xs sm:text-sm">
                      {selectedAddress ? "Review your delivery address" : "Enter delivery information"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <InputField
                  icon={User}
                  name="name"
                  placeholder="Full Name *"
                  value={billingDetails.name}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={Phone}
                  name="phone"
                  placeholder="BD Mobile Number (01XXXXXXXXX) *"
                  value={billingDetails.phone}
                  onChange={handleInputChange}
                />
                <InputField
                  icon={MapPin}
                  name="address"
                  placeholder="Street Address *"
                  value={billingDetails.address}
                  onChange={handleInputChange}
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    icon={Building2}
                    name="city"
                    placeholder="City *"
                    value={billingDetails.city}
                    onChange={handleInputChange}
                  />
                  <InputField
                    icon={Hash}
                    name="pincode"
                    placeholder="Post Code *"
                    value={billingDetails.pincode}
                    onChange={handleInputChange}
                  />
                </div>
                <InputField
                  icon={FileText}
                  name="notes"
                  placeholder="Order Notes (Optional)"
                  value={billingDetails.notes}
                  onChange={handleInputChange}
                  textarea
                />
              </div>
            </motion.div>

            {/* Shipping Method */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-shadow duration-500"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-white">Shipping Method</h2>
                    <p className="text-purple-100 text-xs sm:text-sm">Choose your delivery speed</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-3">
                <ShippingOption
                  id="inside"
                  label="Inside Dhaka"
                  price={`৳ ${hasSneakers ? 100 : 80}`}
                  description="Delivery in 2-3 business days"
                  icon={Zap}
                  checked={shippingType === "inside"}
                  onChange={() => setShippingType("inside")}
                />
                <ShippingOption
                  id="outside"
                  label="Outside Dhaka"
                  price={`৳ ${hasSneakers ? 150 : 120}`}
                  description="Delivery in 3-5 business days"
                  icon={Truck}
                  checked={shippingType === "outside"}
                  onChange={() => setShippingType("outside")}
                />
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-shadow duration-500"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-white">Payment Method</h2>
                    <p className="text-green-100 text-xs sm:text-sm">Secure & convenient</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-green-200"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white border-2 border-green-300 flex items-center justify-center shadow-lg">
                      <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base sm:text-lg">Cash on Delivery</p>
                      <p className="text-xs sm:text-sm text-gray-600">Pay when you receive</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700 bg-white/80 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>
                      Your personal information will be used to process your order and
                      enhance your experience on our website.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
              {/* Cart Items */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-shadow duration-500"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-xl font-bold text-white">Your Order</h2>
                        <p className="text-indigo-100 text-xs sm:text-sm">{cartItems.length} items</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {cartItems && cartItems.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4 max-h-[350px] sm:max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {cartItems.map((item, index) => (
                        <motion.div
                          key={item._id}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg sm:rounded-xl border border-gray-200/50 hover:shadow-md transition-shadow"
                        >
                          <div className="relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-lg"
                            />
                            {/* Show discount badge if product has sale price */}
                            {item.salePrice && item.salePrice < item.price && (
                              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                SALE
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                {item.name}
                              </h4>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemoveItem(item._id)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Size: {item.size}</p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1 border border-gray-200">
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleUpdateQuantity(item._id, item.quantity, item.stock, "minus")}
                                  disabled={item.quantity === 1}
                                  className="w-6 h-6 rounded-full hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                  <Minus className="w-3 h-3 text-gray-700" />
                                </motion.button>
                                <span className="text-sm font-semibold text-gray-900 min-w-[20px] text-center">
                                  {item.quantity}
                                </span>
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleUpdateQuantity(item._id, item.quantity, item.stock, "plus")}
                                  disabled={item.quantity >= item.stock}
                                  className="w-6 h-6 rounded-full hover:bg-green-100 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                  <Plus className="w-3 h-3 text-gray-700" />
                                </motion.button>
                              </div>
                               <div className="flex items-baseline gap-2">
                          <p className="text-base font-bold text-red-600">
                            ৳{((item.salePrice || item.price) * item.quantity).toFixed(2)}
                          </p>
                          {item.salePrice && item.salePrice < item.price && (
                            <span className="text-xs text-gray-400 line-through">
                              ৳{(item.price * item.quantity).toFixed(2)}
                            </span>
                          )}
                  </div>
                                              </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-3" />
                      <p className="text-sm sm:text-base text-gray-500">Your cart is empty</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Coupon & Summary */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-shadow duration-500"
              >
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  {/* Coupon Section */}
                  <div className={`rounded-xl p-4 sm:p-5 border-2 ${
                    hasDiscountedProducts 
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300' 
                      : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className={`w-4 h-4 sm:w-5 sm:h-5 ${hasDiscountedProducts ? 'text-gray-400' : 'text-amber-600'}`} />
                      <label className={`font-bold text-sm sm:text-base ${hasDiscountedProducts ? 'text-gray-500' : 'text-gray-900'}`}>
                        Have a Coupon?
                      </label>
                    </div>

                    {/* Warning for discounted products */}
                    {hasDiscountedProducts && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 bg-orange-50 rounded-lg p-3 flex items-start gap-2 border border-orange-200"
                      >
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-orange-700">
                          Coupons cannot be applied to products that already have discounts
                        </p>
                      </motion.div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-600 border-2 rounded-lg sm:rounded-xl focus:ring-2 outline-none transition-all font-medium text-sm uppercase ${
                          hasDiscountedProducts 
                            ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                            : appliedCoupon
                              ? 'border-green-300 bg-green-50 cursor-not-allowed'
                              : 'border-amber-300 focus:border-amber-500 focus:ring-amber-200'
                        }`}
                        placeholder="Enter code"
                        disabled={appliedCoupon || hasDiscountedProducts}
                      />
                      {!appliedCoupon ? (
                        <motion.button
                          whileHover={!hasDiscountedProducts ? { scale: 1.05 } : {}}
                          whileTap={!hasDiscountedProducts ? { scale: 0.95 } : {}}
                          onClick={handleApplyCoupon}
                          disabled={hasDiscountedProducts || isApplyingCoupon}
                          className={`px-4 sm:px-6 font-bold rounded-lg sm:rounded-xl shadow-lg text-sm ${
                            hasDiscountedProducts || isApplyingCoupon
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                          }`}
                        >
                          {isApplyingCoupon ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                          ) : (
                            'Apply'
                          )}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleRemoveCoupon}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 font-bold rounded-lg sm:rounded-xl shadow-lg"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                      )}
                    </div>

                    {/* Error Message */}
                    {couponError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 text-xs sm:text-sm mt-3 flex items-center gap-2"
                      >
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        {couponError}
                      </motion.p>
                    )}

                    {/* Success Message */}
                    {appliedCoupon && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mt-3 bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-green-300"
                      >
                        <div className="flex items-start gap-2 sm:gap-3 mb-2">
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-green-700 font-semibold text-xs sm:text-sm">
                              Coupon "{appliedCoupon.couponCode}" applied!
                            </p>
                            <p className="text-green-600 text-xs mt-1">
                              {appliedCoupon.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-green-200">
                          <div className="flex items-center gap-2">
                            {appliedCoupon.discountType === 'percentage' ? (
                              <Percent className="w-4 h-4 text-green-600" />
                            ) : (
                              <Tag className="w-4 h-4 text-green-600" />
                            )}
                            <span className="text-xs text-gray-700 font-medium">
                              {appliedCoupon.discountType === 'percentage' 
                                ? `${appliedCoupon.discountValue}% OFF` 
                                : `৳${appliedCoupon.discountValue} OFF`
                              }
                            </span>
                          </div>
                          <span className="text-sm font-bold text-green-700">
                            -৳{discountAmount}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 border-t-2 border-gray-200">
                    <PriceLine label="Subtotal" value={`৳ ${totalCartAmount}`} />
                    <PriceLine label="Shipping" value={`৳ ${shippingCharge}`} />
                    {appliedCoupon && (
                      <PriceLine
                        label={`Discount (${appliedCoupon.couponCode})`}
                        value={`-৳ ${discountAmount}`}
                        className="text-green-600"
                      />
                    )}
                    <div className="pt-3 sm:pt-4 border-t-2 border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg font-bold text-gray-900">Total</span>
                        <motion.span
                          key={totalAmount}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                        >
                          ৳ {totalAmount.toFixed(0)}
                        </motion.span>
                      </div>
                      {appliedCoupon && (
                        <p className="text-xs text-green-600 text-right mt-1 font-medium">
                          You saved ৳{discountAmount}!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || !cartItems?.length}
                    className="w-full py-4 sm:py-5 text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white rounded-xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    {isPlacingOrder ? (
                      <span className="flex items-center justify-center gap-2 sm:gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 sm:w-5 sm:h-5 border-3 border-white/30 border-t-white rounded-full"
                        />
                        Processing Order...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 sm:gap-3 relative z-10">
                        <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                        PLACE ORDER
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </span>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-500">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>256-bit SSL Encrypted Payment</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
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

const InputField = ({ icon: Icon, name, placeholder, value, onChange, textarea }) => {
  const Component = textarea ? "textarea" : "input";
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="relative group"
    >
      <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300" />
      </div>
      <Component
        type="text"
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={textarea ? 3 : undefined}
        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all resize-none font-medium text-sm sm:text-base text-gray-900 placeholder:text-gray-400 hover:border-purple-300 bg-white"
      />
    </motion.div>
  );
};

const ShippingOption = ({ id, label, price, description, icon: Icon, checked, onChange }) => (
  <motion.label
    htmlFor={id}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`flex items-center justify-between p-4 sm:p-5 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-300 ${
      checked
        ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg"
        : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/30"
    }`}
  >
    <div className="flex items-center gap-3 sm:gap-4">
      <div className={`relative ${checked ? "scale-110" : ""} transition-transform`}>
        <input
          type="radio"
          id={id}
          name="shipping"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 border-gray-300 focus:ring-2 focus:ring-purple-400"
        />
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 bg-purple-500/20 rounded-full -z-10"
          />
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
          checked ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600"
        } transition-all`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm sm:text-base">{label}</p>
          <p className="text-[10px] sm:text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </div>
    <span className={`text-base sm:text-lg font-bold ${checked ? "text-purple-600" : "text-gray-700"}`}>
      {price}
    </span>
  </motion.label>
);

const PriceLine = ({ label, value, className = "" }) => (
  <div className={`flex justify-between items-center ${className}`}>
    <span className="font-semibold text-gray-700 text-sm sm:text-base">{label}</span>
    <span className="font-bold text-gray-900 text-base sm:text-lg">{value}</span>
  </div>
);