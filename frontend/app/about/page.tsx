"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Award, Heart, Globe, ShoppingBag, Target, 
  Users, TrendingUp, CheckCircle, ArrowRight, Shirt, 
  Zap, Star, Shield, Package, Clock, MapPin 
} from "lucide-react";

const AboutUs = () => {
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Premium Quality",
      description: "Carefully selected fabrics and materials that last. Every piece is crafted for comfort and durability.",
      gradient: "from-[#FE0002] to-[#be185d]"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Trendy Designs",
      description: "From timeless classics to bold statement pieces that define your unique style.",
      gradient: "from-[#be185d] to-[#FE0002]"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Made with Hope",
      description: "Every product embodies our commitment to bringing hope, style, and confidence to your life.",
      gradient: "from-[#FE0002] to-rose-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Affordable Luxury",
      description: "Premium quality doesn't mean premium prices. Style accessible to everyone.",
      gradient: "from-rose-600 to-[#be185d]"
    },
  ];

  const values = [
    { icon: <CheckCircle className="w-5 h-5" />, text: "Premium Quality Materials" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Trendsetting Designs" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Fast Delivery in Bangladesh" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Affordable Prices" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "100% Customer Satisfaction" },
    { icon: <CheckCircle className="w-5 h-5" />, text: "Authentic Bangladeshi Brand" },
  ];

  const products = [
    { icon: <Shirt className="w-6 h-6" />, name: "Premium Shirts" },
    { icon: <ShoppingBag className="w-6 h-6" />, name: "Stylish Apparel" },
    { icon: <Sparkles className="w-6 h-6" />, name: "Fashion Accessories" },
    { icon: <Star className="w-6 h-6" />, name: "Lifestyle Products" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#FE0002] via-[#be185d] to-rose-700 text-white py-24 md:py-32 px-6 overflow-hidden mt-16 md:mt-0">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
          >
            <Heart className="w-5 h-5 text-rose-300" />
            <span className="text-sm font-semibold">Bangladeshi Lifestyle Brand</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Wear Your <br />
            <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
              Confidence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl mb-4 text-white/90 max-w-3xl mx-auto"
          >
            Style, Personality, and Hope — Delivered to Your Doorstep
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 text-sm md:text-base mb-8"
          >
            {products.map((product, index) => (
              <span key={index} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                {product.icon}
                {product.name}
              </span>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            onClick={() => router.push("/shop")}
            className="group inline-flex items-center gap-2 bg-white text-[#FE0002] px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Shop Collection
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>

      {/* What is Spero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-rose-50 rounded-full">
            <Sparkles className="w-5 h-5 text-[#FE0002]" />
            <span className="text-sm font-semibold text-[#FE0002]">The Meaning Behind Our Name</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#FE0002] to-[#be185d] bg-clip-text text-transparent">
            "Spero" Means Hope
          </h2>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-rose-100">
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-center">
              At <span className="font-bold bg-gradient-to-r from-[#FE0002] to-[#be185d] bg-clip-text text-transparent">SperoLife</span>, we believe that fashion is more than just clothing — it's about expressing who you are and how you feel. 
            </p>
            
            <div className="bg-gradient-to-r from-[#FE0002]/5 to-[#be185d]/5 rounded-2xl p-8 border border-[#FE0002]/10">
              <p className="text-lg text-gray-700 leading-relaxed text-center">
                We're committed to delivering <span className="font-semibold text-[#FE0002]">quality products at affordable prices</span>. We don't just sell products — we bring <span className="font-semibold text-[#be185d]">style, confidence, and personality</span> to your everyday look.
              </p>
            </div>

            <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-center">
              From <span className="font-semibold">premium shirts</span> and <span className="font-semibold">trendy apparel</span> to <span className="font-semibold">stylish accessories</span> and <span className="font-semibold">lifestyle essentials</span>, every piece in our collection is designed to help you look great and feel even better.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="text-[#FE0002]">{value.icon}</div>
                <span className="text-gray-700 font-medium">{value.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="bg-gradient-to-r from-[#FE0002] to-[#be185d] py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Award className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white">Our Commitment</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            The SperoLife Promise
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            At SperoLife, every product tells a story of <span className="font-semibold">quality craftsmanship</span>, <span className="font-semibold">contemporary design</span>, and <span className="font-semibold">unbeatable value</span>. We're here to make sure you don't just wear clothes — you wear your <span className="font-bold text-yellow-200">hope, confidence, and individuality</span>.
          </p>
        </div>
      </section>

      {/* Why SperoLife - Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 rounded-full">
            <Star className="w-5 h-5 text-[#FE0002]" />
            <span className="text-sm font-semibold text-[#FE0002]">Why Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#FE0002] to-[#be185d] bg-clip-text text-transparent">
            Why SperoLife?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're not just a brand — we're your partner in looking good and feeling great every single day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#FE0002]/30 hover:-translate-y-2"
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              
              {/* Decorative gradient line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Visit Us Section */}
      <section className="bg-gradient-to-br from-gray-900 via-[#be185d] to-gray-900 text-white py-20 px-6 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <MapPin className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold">Visit Our Store</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6">Come See Us</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-white/90 mb-12">
              Experience SperoLife in person. Visit our store in Dhaka to explore our full collection and get personalized styling assistance.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-rose-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Our Location</h3>
                    <p className="text-white/80">1/01, 2nd floor, Eastern Banabithi Shopping Complex (10 tola market), Dhaka-1219</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-rose-300 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Store Hours</h3>
                    <p className="text-white/80">Open daily for your convenience</p>
                    <p className="text-white/80 text-sm mt-2">Contact us for specific timings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-orange-50 rounded-full">
            <Globe className="w-5 h-5 text-[#FE0002]" />
            <span className="text-sm font-semibold text-[#FE0002]">Our Vision</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#FE0002] to-[#be185d] bg-clip-text text-transparent">
            Building a Movement
          </h2>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 md:p-12 border border-[#FE0002]/20">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
            SperoLife isn't just about fashion — it's about creating a <span className="font-bold text-[#FE0002]">community</span> of confident, style-conscious individuals who believe in themselves. Our vision is to become Bangladesh's most trusted lifestyle brand, bringing <span className="font-bold text-[#be185d]">hope, style, and quality</span> to every household across the nation and beyond.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FE0002] to-[#be185d] rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">For Everyone</h3>
              <p className="text-gray-600 text-sm">Men, women, and lifestyle for all</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-[#be185d] to-[#FE0002] rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Complete Range</h3>
              <p className="text-gray-600 text-sm">Clothing, accessories & more</p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-r from-[#FE0002] to-rose-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Made with Hope</h3>
              <p className="text-gray-600 text-sm">Every product, every customer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#FE0002] to-[#be185d] rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                Ready to Elevate Your Style?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Let SperoLife bring hope, confidence, and style to your wardrobe. Explore our collection today.
              </p>
              <button
                onClick={() => router.push("/shop")}
                className="group inline-flex items-center gap-2 bg-white text-[#FE0002] px-10 py-5 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Explore Collection
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AboutUs;