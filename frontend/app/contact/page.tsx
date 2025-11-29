"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Mail, Phone, MapPin, Send, MessageCircle, Clock, Sparkles, 
  Facebook, Instagram, ArrowRight, Star, 
  ShoppingBag, Headphones, CheckCircle, Navigation, Heart
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";

const ContactUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Email Us",
      detail: "sperolifebd@gmail.com",
      link: "mailto:sperolifebd@gmail.com",
      description: "Get a response within 24 hours",
      gradient: "from-[#FE0002] to-[#be185d]",
    },
    {
      icon: <Phone className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Call Us",
      detail: "+880 1750-873525",
      link: "tel:+8801750873525",
      description: "Mon-Sat, 10AM - 8PM",
      gradient: "from-[#be185d] to-[#FE0002]",
    },
    {
      icon: <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Visit Our Store",
      detail: "10 Tola Market, Dhaka",
      link: null,
      description: "Shop 1/01, 2nd Floor, Eastern Banabithi",
      gradient: "from-[#FE0002] to-rose-600",
    },
  ];

  const socialLinks = [
    {
      icon: <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />,
      name: "Facebook",
      link: "https://www.facebook.com/people/SperoLife/61582154486580/",
      gradient: "from-blue-600 to-blue-700",
      hoverColor: "hover:from-blue-700 hover:to-blue-800"
    },
    {
      icon: <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />,
      name: "Instagram",
      link: "https://instagram.com/sperolife",
      gradient: "from-[#be185d] via-[#FE0002] to-orange-500",
      hoverColor: "hover:from-purple-700 hover:via-rose-700 hover:to-orange-600"
    },
    {
      icon: <FaTiktok className="w-5 h-5 sm:w-6 sm:h-6" />,
      name: "TikTok",
      link: "https://www.tiktok.com/@sperolife",
      gradient: "from-gray-900 to-black",
      hoverColor: "hover:from-black hover:to-gray-900"
    },
  ];

  const whyContactUs = [
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Expert Support",
      description: "Our team is ready to help you find the perfect style"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Quick Response",
      description: "Fast replies to all your queries and concerns"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Customer Care",
      description: "Your satisfaction is our top priority"
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
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

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/30"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold tracking-wide">WE'RE HERE FOR YOU</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight mb-6 sm:mb-8"
          >
            Let's Talk
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="space-y-4"
          >
            <p className="text-lg sm:text-xl md:text-3xl font-semibold text-white/95 max-w-4xl mx-auto px-4 leading-relaxed">
              Your Style Journey Starts Here
            </p>
            <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-3xl mx-auto px-4">
              Questions about our collection? Need styling advice? We're just a message away!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-8 sm:mt-12 flex flex-wrap gap-4 justify-center"
          >
            <a
              href="https://wa.me/8801750873525?text=Hi%20SperoLife!%20I%20have%20a%20question%20about%20your%20products."
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#FE0002] rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 shimmer-effect"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <a
              href="mailto:sperolifebd@gmail.com"
              className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-full font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              Email Us
            </a>
          </motion.div>
        </div>
      </section>

      {/* Why Contact Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-rose-50 rounded-full">
            <Star className="w-4 h-4 text-[#FE0002]" />
            <span className="text-sm font-semibold text-[#FE0002]">Why Reach Out</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[#FE0002] to-[#be185d] bg-clip-text text-transparent mb-4">
            We're Here to Help
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {whyContactUs.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#FE0002]/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-[#FE0002] to-[#be185d] rounded-xl flex items-center justify-center text-white mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

     

      {/* Google Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-rose-50 rounded-full">
            <MapPin className="w-4 h-4 text-[#FE0002]" />
            <span className="text-sm font-semibold text-[#FE0002]">Find Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[#FE0002] to-[#be185d] bg-clip-text text-transparent mb-4">
            Visit Our Store
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Come see our collection in person at our Dhaka location
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200"
        >
          {/* Map Container */}
          <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.7017642399414!2d90.43864707389282!3d23.75801228848687!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b977bd477dc7%3A0x5d4fc427086d61d6!2s10%20Tola%20Market%20%7C%20South%20Banasree!5e0!3m2!1sen!2sbd!4v1764439802590!5m2!1sen!2sbd"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="SperoLife Store Location"
              className="absolute inset-0"
            />
          </div>

          {/* Location Details */}
          <div className="p-6 sm:p-8 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FE0002] to-[#be185d] rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-700 font-medium">Shop: 1/01, 2nd floor</p>
                    <p className="text-gray-600">Eastern Banabithi Shopping Complex</p>
                    <p className="text-gray-600">(10 tola market), Dhaka-1219</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#be185d] to-[#FE0002] rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Store Hours</h3>
                    <p className="text-gray-700">Monday - Saturday</p>
                    <p className="text-gray-600 font-medium">10:00 AM - 8:00 PM</p>
                    <p className="text-gray-500 text-sm mt-2">Closed on Sundays</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <a
                href="https://www.google.com/maps/dir//23.75801228848687,90.43864707389282"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FE0002] to-[#be185d] text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Main Contact Card */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative bg-white shadow-2xl rounded-3xl sm:rounded-[2.5rem] overflow-hidden border border-gray-200"
        >
          <div className="relative bg-gradient-to-r from-[#FE0002] to-[#be185d] px-6 sm:px-12 py-8 sm:py-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-md">
                <Send className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">
                  Get in Touch
                </h2>
                <p className="text-sm sm:text-base text-white/90">
                  We'd love to hear from you
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-12 md:p-16">
            <div className="space-y-6 sm:space-y-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="group flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-6 sm:p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#FE0002]/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#FE0002] to-[#be185d] rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                  <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h3 className="font-black text-lg sm:text-xl text-gray-900 mb-2">
                    Email Address
                  </h3>
                  
                  <a
                    href="mailto:sperolifebd@gmail.com"
                    className="inline-block bg-gradient-to-r from-[#FE0002] to-[#be185d] bg-clip-text text-transparent font-bold text-base sm:text-lg md:text-xl hover:underline decoration-2 underline-offset-4 break-all transition-colors duration-300"
                  >
                    sperolifebd@gmail.com
                  </a>
                  <p className="text-sm sm:text-base text-gray-600 mt-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Response within 24 hours
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="group flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-6 sm:p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#be185d]/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#be185d] to-[#FE0002] rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                  <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <h3 className="font-black text-lg sm:text-xl text-gray-900 mb-2">
                    Phone Number
                  </h3>
                  
                  <a
                    href="tel:+8801750873525"
                    className="inline-block bg-gradient-to-r from-[#be185d] to-[#FE0002] bg-clip-text text-transparent font-bold text-base sm:text-lg md:text-xl hover:underline decoration-2 underline-offset-4 transition-colors duration-300"
                  >
                    +880 1750-873525
                  </a>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-gray-600 shrink-0" />
                    <p className="text-sm sm:text-base text-gray-600">
                      Monday - Saturday: 10:00 AM - 8:00 PM
                    </p>
                  </div>
                </div>
              </motion.div>

             

              <div className="pt-6 sm:pt-8 border-t-2 border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FE0002] to-[#be185d] rounded-xl flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-black text-xl sm:text-2xl text-gray-900">
                    Follow Us on Social Media
                  </h3>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`group w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${social.gradient} ${social.hoverColor} rounded-2xl flex items-center justify-center text-white shadow-md hover:shadow-xl transition-all duration-300`}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
                
                <p className="text-sm sm:text-base text-gray-600">
                  Stay updated with our latest collections, exclusive offers, and style tips!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

{/* CTA Section */}
      <section className="relative bg-gradient-to-r from-[#FE0002] via-[#be185d] to-rose-700 text-white py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#FE0002]/20 via-transparent to-[#be185d]/20" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/30">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">ALWAYS AVAILABLE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight">
              Ready to Wear Your
              <br />
              <span className="bg-gradient-to-r from-rose-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
                Confidence?
              </span>
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Whether you have a question, need styling advice, or want to share feedback — we're all ears! 
              <span className="font-bold text-yellow-300"> SperoLife</span> is committed to providing 
              exceptional service and quality products that bring hope and style to your life. ✨
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              
              <a  href="https://wa.me/8801750873525?text=Hi%20SperoLife!%20I%20have%20a%20question%20about%20your%20products."
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#FE0002] rounded-full font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                Start a Conversation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              
              <a  href="mailto:sperolifebd@gmail.com"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-full font-bold text-base shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                Email Us
              </a>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">24hrs</div>
                <div className="text-xs sm:text-sm text-white/80 font-medium">Response Time</div>
              </div>
              <div className="text-center border-x border-white/30">
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">100+</div>
                <div className="text-xs sm:text-sm text-white/80 font-medium">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-white mb-1">7 Days</div>
                <div className="text-xs sm:text-sm text-white/80 font-medium">Weekly Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;