"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Shield, CheckCircle, AlertCircle, Scale, FileText, Lock, 
  Package, CreditCard, RefreshCw, Sparkles, ArrowRight, 
  Heart, Star, Clock, MapPin, Mail, Phone, ShoppingBag
} from "lucide-react";

export default function TermsAndConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "1. Acceptance of Terms",
      gradient: "from-[#FE0002] to-[#be185d]",
      bgGradient: "from-rose-50 to-pink-50",
      content: (
        <>
          <p className="mb-4">
            Welcome to <span className="font-bold text-[#FE0002]">SperoLife</span> — where hope meets style! By accessing our website or purchasing our premium products, you agree to be bound by these Terms and Conditions, all applicable laws, and regulations of Bangladesh.
          </p>
          <p className="text-gray-700">
            If you do not agree with any part of these terms, please do not use our services or purchase our products. We're here to bring confidence and personality to your everyday look! 🌟
          </p>
        </>
      ),
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "2. Products & Services",
      gradient: "from-[#be185d] to-rose-600",
      bgGradient: "from-pink-50 to-rose-50",
      content: (
        <>
          <p className="mb-4">
            SperoLife specializes in delivering quality products at affordable prices. We don't just sell products — we bring style, confidence, and personality to your everyday look.
          </p>
          <div className="space-y-3 ml-2">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <span className="text-gray-700">We strive to ensure all product information is accurate, but we do not warrant that descriptions or other content is error-free.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <span className="text-gray-700">Product availability is subject to stock levels and may change without prior notice.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <span className="text-gray-700">Colors may vary slightly from images due to screen display settings.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <span className="text-gray-700">All products are carefully curated to bring hope and style to your life.</span>
            </div>
          </div>
        </>
      ),
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "3. Orders & Payment",
      gradient: "from-orange-600 to-[#FE0002]",
      bgGradient: "from-orange-50 to-rose-50",
      content: (
        <>
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FE0002] rounded-full"></div>
              Order Placement
            </h4>
            <p className="text-gray-700 ml-4">
              When you place an order on SperoLife, you are making an offer to purchase our products. We reserve the right to accept or decline your order for any reason, including product availability, pricing errors, or fraudulent activity.
            </p>
          </div>
          
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FE0002] rounded-full"></div>
              Payment Methods
            </h4>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-gray-700">We accept Cash on Delivery (COD), bKash, Nagad, Rocket, and credit/debit cards.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-gray-700">All prices are listed in Bangladeshi Taka (৳).</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-gray-700">Payment must be completed before order processing for online payment methods.</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FE0002] rounded-full"></div>
              Pricing
            </h4>
            <p className="text-gray-700 ml-4">
              Prices are subject to change without prior notice. The price applicable to your order is the price displayed at the time of purchase. At SperoLife, we're committed to affordable prices without compromising quality.
            </p>
          </div>
        </>
      ),
    },
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      title: "4. Shipping & Delivery",
      gradient: "from-green-600 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      content: (
        <>
          <p className="mb-4 text-gray-700">
            We deliver our quality products across Bangladesh. Delivery times and charges vary based on your location.
          </p>
          
          <div className="space-y-3 mb-6 ml-2">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#FE0002] mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-gray-900">Dhaka:</span>
                <span className="text-gray-700 ml-2">1-3 business days</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#FE0002] mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-gray-900">Outside Dhaka:</span>
                <span className="text-gray-700 ml-2">3-7 business days</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-[#FE0002] p-5 rounded-r-xl shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-[#FE0002] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900 mb-2">Important Notice</p>
                <p className="text-sm text-gray-700">
                  SperoLife is not responsible for delays caused by incorrect shipping information, natural disasters, political unrest, or courier service disruptions. We'll always do our best to keep you updated!
                </p>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "5. Returns & Refunds",
      gradient: "from-indigo-600 to-[#be185d]",
      bgGradient: "from-indigo-50 to-pink-50",
      content: (
        <>
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#FE0002]" />
              Return Policy
            </h4>
            <p className="text-gray-700 ml-7">
              We want you to be completely satisfied with your purchase. If you're not happy with your product, you may return it within <strong className="text-[#FE0002]">7 days</strong> of delivery.
            </p>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FE0002] rounded-full"></div>
              Return Conditions
            </h4>
            <div className="space-y-2 ml-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-gray-700">The product must be unused, unwashed, and in original condition with all tags attached.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-gray-700">Original packaging must be intact.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <span className="text-gray-700">Return shipping costs are the customer's responsibility unless the item is defective or wrong.</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FE0002] rounded-full"></div>
              Refund Process
            </h4>
            <p className="text-gray-700 ml-4">
              Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. If approved, refunds will be processed within 7-14 business days to your original payment method.
            </p>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-[#FE0002] p-5 rounded-r-xl shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-[#FE0002] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gray-900 mb-2">Non-Returnable Items</p>
                <p className="text-sm text-gray-700">
                  Sale items, promotional products, and customized items cannot be returned or exchanged.
                </p>
              </div>
            </div>
          </div>
        </>
      ),
    },
  

    {
        icon: <Lock className="w-6 h-6" />,title: "6. Privacy & Data Protection",
      gradient: "from-[#be185d] to-rose-600",
      bgGradient: "from-pink-50 to-rose-50",
      content: (
        <>
          <p className="mb-4 text-gray-700">
            Your privacy is important to us at SperoLife. We collect and use your personal information in accordance with Bangladesh's data protection laws.
          </p>
          
          <div className="space-y-3 ml-2">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <span className="text-gray-700">We collect name, phone number, email, and shipping address for order processing.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <span className="text-gray-700">Your information will never be sold or shared with third parties without consent.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <span className="text-gray-700">We use secure payment gateways to protect your financial information.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <span className="text-gray-700">Your trust is our priority, and we handle your data with care.</span>
            </div>
          </div>
        </>
      ),
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "7. Governing Law",
      gradient: "from-gray-700 to-gray-900",
      bgGradient: "from-gray-50 to-slate-50",
      content: (
        <>
          <p className="mb-4 text-gray-700">
            These Terms and Conditions are governed by and construed in accordance with the laws of the <strong className="text-[#FE0002]">People's Republic of Bangladesh</strong>.
          </p>
          <p className="text-gray-700">
            Any disputes arising from these terms or your use of SperoLife shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh. We're committed to fair and transparent business practices.
          </p>
        </>
      ),
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "8. Limitation of Liability",
      gradient: "from-cyan-600 to-blue-600",
      bgGradient: "from-cyan-50 to-blue-50",
      content: (
        <>
          <p className="mb-4 text-gray-700">
            SperoLife shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or products.
          </p>
          <p className="text-gray-700">
            Our total liability for any claim arising from your purchase shall not exceed the amount paid for the product in question. We stand behind our commitment to quality and customer satisfaction.
          </p>
        </>
      ),
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "9. Changes to Terms",
      gradient: "from-violet-600 to-[#be185d]",
      bgGradient: "from-violet-50 to-pink-50",
      content: (
        <>
          <p className="mb-4 text-gray-700">
            SperoLife reserves the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on our website.
          </p>
          <p className="text-gray-700">
            Your continued use of our services after changes are posted constitutes acceptance of the modified terms. We recommend checking this page periodically for updates.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 relative overflow-hidden">
      {/* Animated Background */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }

        .shimmer-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#FE0002]/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[#be185d]/10 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-rose-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#FE0002] via-[#be185d] to-rose-700 text-white py-16 sm:py-24 md:py-32 px-4 sm:px-6 overflow-hidden mt-16 md:mt-0">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#be185d]/10 to-[#be185d]/30" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/30 shadow-lg"
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
            <span className="text-xs sm:text-sm font-bold tracking-wide">LEGAL DOCUMENT</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight mb-6 sm:mb-8"
          >
            Terms & Conditions
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="space-y-4"
          >
            <p className="text-lg sm:text-xl md:text-3xl font-semibold text-white/95 max-w-4xl mx-auto px-4 leading-relaxed">
              Where Hope Meets Style 🌟
            </p>
            <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-3xl mx-auto px-4">
              Please read these terms carefully before using SperoLife's services or purchasing our quality products at affordable prices.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-8 sm:mt-12 flex flex-wrap gap-4 justify-center text-sm sm:text-base"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <FileText className="w-4 h-4" />
              <span>Last Updated: January 2025</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Scale className="w-4 h-4" />
              <span>Bangladesh Law</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-20">
        <div className="space-y-6 sm:space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#FE0002]/30 overflow-hidden"
            >
              {/* Section Header */}
              <div className={`bg-gradient-to-r ${section.gradient} p-6 sm:p-8 flex items-center gap-4`}>
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white shadow-lg"
                >
                  {section.icon}
                </motion.div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                  {section.title}
                </h2>
              </div>

              {/* Section Content */}
              <div className={`p-6 sm:p-8 md:p-10 bg-gradient-to-br ${section.bgGradient}`}>
                <div className="text-gray-700 leading-relaxed">
                  {section.content}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#FE0002] via-[#be185d] to-rose-700 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 md:p-16 text-white text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              viewport={{ once: true }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300" />
            </motion.div>

            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              Have Questions?
            </h3>
            <p className="text-white/90 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              If you have any questions about these Terms and Conditions, or need clarification on anything, we're here to help! At SperoLife, we bring hope, style, and confidence to every interaction.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:sperolifebd@gmail.com"
                className="group inline-flex items-center justify-center gap-2 bg-white text-[#FE0002] px-8 py-4 rounded-full font-bold text-base shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 shimmer-effect"
              >
                <Mail className="w-5 h-5" />
                Email Us
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="tel:+8801750873525"
                className="group inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-base shadow-md hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <Phone className="w-5 h-5" />
                Call Us
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Shop 1/01, 2nd Floor, Eastern Banabithi, Dhaka</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bottom Note */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 text-center relative z-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-6 shadow-md border border-gray-100"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="w-5 h-5 text-[#FE0002]" />
            <p className="font-bold text-gray-900">Thank You for Choosing SperoLife!</p>
          </div>
          <p className="text-sm text-gray-600">
            By using SperoLife, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. We're committed to bringing style, confidence, and personality to your everyday look! 🌟
          </p>
        </motion.div>
      </section>
    </div>
  );
}