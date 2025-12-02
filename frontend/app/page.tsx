"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag, Trophy, Clock, ArrowRight, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "@/components/products/ProductCard";
import { getActiveBanners } from "@/lib/redux/slices/bannerSlice";
import { fetchProducts } from "@/lib/redux/slices/productSlice";
import { toast } from "react-hot-toast";

export default function ModernHomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("new");
  const [isVisible, setIsVisible] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  
  // SubCategory filtered products
  const [shirtsProducts, setShirtsProducts] = useState([]);
  const [shakersProducts, setShakersProducts] = useState([]);
  const [sneakersProducts, setSneakersProducts] = useState([]);

  // Get data from Redux
  const { banners, loading: bannersLoading } = useSelector((state) => state.banner || { banners: [], loading: false });
  const { user } = useSelector((state) => state.auth || { user: null });
  const { product, loading: productsLoading } = useSelector((state) => state.product || { products: [], loading: false });

  // Filter active banners and sort by position
  const activeBanners = banners?.filter((banner) => banner.isActive)?.sort((a, b) => a.position - b.position) || [];

  useEffect(() => {
    setIsVisible(true);
    
    dispatch(getActiveBanners())
      .unwrap()
      .then((response) => {
        console.log('Banners response:', response);
      })
      .catch((error) => {
        console.error('Banner fetch error:', error);
      });
    
    dispatch(fetchProducts({ page: 1, limit: 50 })).then((res) => {
      if (res?.payload?.products) {
        const allProds = res.payload.products;
        setAllProducts(allProds);
        
        setBestSellers(allProds.filter(p => p.isBestSeller).slice(0, 10));
        setNewArrivals(allProds.filter(p => p.isNewArrival).slice(0, 10));
        setDiscounts(allProds.filter(p => p.salePrice && p.salePrice < p.price).slice(0, 10));
      }
    });
  }, [dispatch]);

  // Filter subcategory products based on active tab
  useEffect(() => {
    if (allProducts.length > 0) {
      filterSubCategoryProducts();
    }
  }, [activeTab, bestSellers, newArrivals, discounts, allProducts]);

  const filterSubCategoryProducts = () => {
    let sourceProducts = [];

    switch (activeTab) {
      case "bestseller":
        sourceProducts = bestSellers;
        break;
      case "new":
        sourceProducts = newArrivals;
        break;
      case "discount":
        sourceProducts = discounts;
        break;
      default:
        sourceProducts = allProducts;
    }

    const shirts = sourceProducts.filter(p => 
      p.subCategory?.toLowerCase().includes('shirt')
    );
    
    const shakers = sourceProducts.filter(p => 
      p.subCategory?.toLowerCase().includes('shacket')
    );
    
    const sneakers = sourceProducts.filter(p => 
      p.subCategory?.toLowerCase().includes('sneaker')
    );

    setShirtsProducts(shirts.slice(0, 5));
    setShakersProducts(shakers.slice(0, 5));
    setSneakersProducts(sneakers.slice(0, 5));
  };

  useEffect(() => {
    if (activeBanners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeBanners.length]);

  const hasContent = (banner) => {
    return banner.title || banner.subtitle || banner.description || banner.link;
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Banner Section */}
      <section className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[650px] overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(253,0,2,0.2),transparent_50%)] animate-pulse-slow" />
        </div>

        {activeBanners.length > 0 ? (
          <>
            {activeBanners.map((banner, index) => {
              const showContent = hasContent(banner);
              
              return (
                <div
                  key={banner._id}
                  className={`absolute inset-0 transition-all duration-1000 ease-out ${
                    index === currentSlide
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-105"
                  }`}
                >
                  <div className="absolute inset-0">
                    <img
                      src={banner.image}
                      alt={banner.title || 'Banner'}
                      className="w-full h-full object-fill object-center sm:object-cover"
                    />
                    {showContent && (
                      <div 
                        className="absolute inset-0"
                        style={{ 
                          background: `linear-gradient(to right, ${banner.backgroundColor || '#000000'}dd, ${banner.backgroundColor || '#000000'}88, transparent)` 
                        }}
                      />
                    )}
                  </div>

                  {showContent && (
                    <div className="relative h-full flex items-center">
                      <div className="container mx-auto px-4 md:px-8 lg:px-16">
                        <div className="max-w-2xl space-y-4 md:space-y-6 animate-slide-up">
                          {banner.subtitle && (
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#FD0002] animate-pulse" />
                              <span 
                                className="text-xs md:text-sm font-semibold uppercase tracking-wider"
                                style={{ color: banner.textColor || '#ffffff' }}
                              >
                                {banner.subtitle}
                              </span>
                            </div>
                          )}
                          {banner.title && (
                            <h1
                              className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight"
                              style={{ color: banner.textColor || '#ffffff' }}
                            >
                              {banner.title}
                            </h1>
                          )}
                          {banner.description && (
                            <p 
                              className="text-sm md:text-lg lg:text-xl max-w-xl"
                              style={{ color: banner.textColor || '#ffffff', opacity: 0.9 }}
                            >
                              {banner.description}
                            </p>
                          )}
                          {banner.link && (
                            <button
                              onClick={() => router.push(banner.link)}
                              className="group/btn relative px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-base overflow-hidden transition-all duration-300 hover:scale-105"
                              style={{
                                backgroundColor: banner.buttonColor || "#FD0002",
                                color: banner.buttonColor === "#000000" ? "#fff" : "#000",
                              }}
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                {banner.linkText || "Shop Now"}
                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:translate-x-1 transition-transform" />
                              </span>
                              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {activeBanners.length > 1 && (
              <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20">
                {activeBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-500 rounded-full ${
                      currentSlide === index
                        ? "w-8 md:w-12 h-2 md:h-3 bg-[#FD0002]"
                        : "w-2 md:w-3 h-2 md:h-3 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900">
            <div className="text-center space-y-4 px-4">
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white">
                Welcome to Our Store
              </h1>
              <p className="text-lg md:text-xl text-white/80">Discover Amazing Products</p>
              <button
                onClick={() => router.push("/products")}
                className="px-6 py-3 md:px-8 md:py-4 bg-[#FD0002] text-white rounded-full font-bold text-sm md:text-lg hover:scale-105 transition-transform"
              >
                Shop Now
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Mobile Tabs Section */}
      <section className="md:hidden sticky top-0 z-40 bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
  <div className="flex overflow-x-auto hide-scrollbar">
    <TabButton
      active={activeTab === "new"}
      onClick={() => setActiveTab("new")}
      icon={<Clock className="w-4 h-4" />}
      label="New Arrival"
      color="blue"
    />
    <TabButton
      active={activeTab === "bestseller"}
      onClick={() => setActiveTab("bestseller")}
      icon={<Trophy className="w-4 h-4" />}
      label="Best Sellers"
      color="amber"
    />
    <TabButton
      active={activeTab === "discount"}
      onClick={() => setActiveTab("discount")}
      icon={<Flame className="w-4 h-4" />}
      label="Hot Deals"
      color="red"
    />
  </div>
</section>

      {/* Mobile Tab Content - WITH SUBCATEGORIES */}
      <section className="md:hidden py-4 bg-white">
        <div className="container mx-auto px-4 space-y-6">
          {shirtsProducts.length > 0 && (
            <SubCategoryRow
              title="Shirts"
              icon="👕"
              products={shirtsProducts}
              loading={productsLoading}
              onSeeAll={() => router.push(`/products?subCategory=shirts`)}
            />
          )}

          {shakersProducts.length > 0 && (
            <SubCategoryRow
              title="Shackets"
              icon="🧥"
              products={shakersProducts}
              loading={productsLoading}
              onSeeAll={() => router.push(`/products?subCategory=shacket`)}
            />
          )}

          {sneakersProducts.length > 0 && (
            <SubCategoryRow
              title="Sneakers"
              icon="👟"
              products={sneakersProducts}
              loading={productsLoading}
              onSeeAll={() => router.push(`/products?subCategory=sneakers`)}
            />
          )}

          {shirtsProducts.length === 0 && shakersProducts.length === 0 && sneakersProducts.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">No products found for this category</p>
            </div>
          )}
        </div>
      </section>

      {/* Desktop Sections - NOW WITH HORIZONTAL SCROLL */}
      {/* Best Sellers - Desktop */}
      {bestSellers.length > 0 && (
        <section className="hidden md:block py-8 lg:py-12 bg-white">
          <div className="container mx-auto px-4 md:px-8 lg:px-16">
            <SectionHeader
              icon={<Trophy className="w-6 h-6 md:w-7 md:h-7 text-amber-600" />}
              badge="Top Picks"
              title="Best Sellers"
              gradient="from-amber-700 via-amber-600 to-amber-500"
              accentColor="amber"
              onViewAll={() => router.push("/products?bestSeller=true")}
            />
            <HorizontalScroll products={bestSellers} loading={productsLoading} />
          </div>
        </section>
      )}

      {/* New Arrivals - Desktop */}
      {newArrivals.length > 0 && (
        <section className="hidden md:block py-8 lg:py-12 bg-[#EAEDED]">
          <div className="container mx-auto px-4 md:px-8 lg:px-16">
            <SectionHeader
              icon={<Clock className="w-6 h-6 md:w-7 md:h-7 text-blue-700 animate-pulse" />}
              badge="Just Landed"
              title="New Arrivals"
              gradient="from-blue-700 via-blue-600 to-blue-500"
              accentColor="blue"
              onViewAll={() => router.push("/products?newArrival=true")}
            />
            <HorizontalScroll products={newArrivals} loading={productsLoading} />
          </div>
        </section>
      )}

      {/* Hot Deals - Desktop */}
      {discounts.length > 0 && (
        <section className="hidden md:block py-8 lg:py-12 bg-white">
          <div className="container mx-auto px-4 md:px-8 lg:px-16">
            <SectionHeader
              icon={<Flame className="w-6 h-6 md:w-7 md:h-7 text-red-600 animate-pulse" />}
              badge="Limited Time"
              title="Hot Deals"
              gradient="from-red-700 via-[#FD0002] to-red-500"
              accentColor="red"
              onViewAll={() => router.push("/products?filter=discount")}
            />
            <HorizontalScroll products={discounts} loading={productsLoading} />
          </div>
        </section>
      )}

      {/* All Products Grid */}
      <section className="py-8 lg:py-12 bg-[#EAEDED]">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-purple-700 via-[#FD0002] to-red-500 bg-clip-text text-transparent">
                Complete Collection
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-700 via-[#FD0002] to-red-500 bg-clip-text text-transparent">
              Explore Our Full Collection
            </h2>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : allProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {allProducts.slice(0, 15).map((product, index) => (
                <div
                  key={product._id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg">
              <ShoppingBag className="w-16 h-16 md:w-20 md:h-20 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg md:text-xl">No products available</p>
            </div>
          )}

          {allProducts.length > 15 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => router.push("/products")}
                className="bg-gradient-to-r from-[#FD0002] to-[#FF6B6B] hover:from-[#FF6B6B] hover:to-[#FD0002] text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-sm md:text-base transition-all duration-300 hover:scale-105 group"
              >
                <span className="flex items-center gap-2">
                  View All Products
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.15;
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
          opacity: 0;
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Section Header Component
function SectionHeader({ icon, badge, title, gradient, accentColor, onViewAll }) {
  const colors = {
    amber: "border-amber-300 hover:border-amber-500 hover:bg-amber-50 text-amber-700",
    blue: "border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-700",
    red: "border-red-300 hover:border-red-500 hover:bg-red-50 text-[#FD0002]",
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {React.cloneElement(icon, { className: `w-6 h-6 md:w-7 md:h-7 ${icon.props.className || ''}` })}
          <span className={`text-xs md:text-sm font-bold uppercase tracking-wider bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {badge}
          </span>
        </div>
        <h2 className={`text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {title}
        </h2>
      </div>
      <button
        onClick={onViewAll}
        className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all duration-300 hover:scale-105 ${colors[accentColor]}`}
      >
        View All
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Mobile Tab Button
function TabButton({ active, onClick, icon, label, color }) {
  const colors = {
    amber: {
      inactive: "text-amber-400 hover:bg-slate-700 hover:text-white",
      active: "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
    },
    blue: {
      inactive: "text-blue-400 hover:bg-slate-700 hover:text-white",
      active: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
    },
    red: {
      inactive: "text-rose-400 hover:bg-slate-700 hover:text-white",
      active: "bg-gradient-to-r from-rose-600 to-pink-600 text-white"
    }
  };

  return (
    <button
      onClick={onClick}
      className={`relative flex-1 min-w-[120px] py-3 px-4 text-center font-semibold text-sm transition-all whitespace-nowrap overflow-hidden
        ${active ? colors[color].active : colors[color].inactive}`}
    >
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
      )}
      <div className="relative flex items-center justify-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
    </button>
  );
}

// Horizontal Scroll Component - SAME AS HOMEPAGE
function HorizontalScroll({ products, title, loading }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const element = scrollRef.current;
    if (element) {
      element.addEventListener("scroll", checkScroll);
      return () => element.removeEventListener("scroll", checkScroll);
    }
  }, [products]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex gap-3 md:gap-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px] flex-shrink-0 bg-gray-200 rounded-lg h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm md:text-base">No products found</p>
      </div>
    );
  }

  return (
    <div className="relative group/scroll">
      {/* Left Arrow - Desktop only */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 items-center justify-center rounded-full bg-white border border-gray-200 transition-all duration-300 hover:scale-110 opacity-0 group-hover/scroll:opacity-100 hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
        </button>
      )}

      {/* Right Arrow - Desktop only */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 items-center justify-center rounded-full bg-white border border-gray-200 transition-all duration-300 hover:scale-110 opacity-0 group-hover/scroll:opacity-100 hover:bg-gray-50"
        >
          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
        </button>
      )}

      {/* Products Scroll - Hide scrollbar */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 md:gap-4 pb-2 hide-scrollbar scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {products.map((product, index) => (
          <div
            key={product._id}
            className="w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px] flex-shrink-0 animate-slide-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
          opacity: 0;
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// SubCategory Row Component for Mobile - WITH HORIZONTAL SCROLL
function SubCategoryRow({ title, icon, products, loading, onSeeAll }) {
  const scrollRef = useRef(null);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-[160px] flex-shrink-0 bg-gray-200 rounded-lg h-72 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  const hasMore = products.length >= 5;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {products.map((product, index) => (
          <div
            key={product._id}
            className="w-[160px] flex-shrink-0 animate-slide-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
        
        {hasMore && (
          <div className="flex gap-2">
          <button
            onClick={onSeeAll}
            className="w-[160px] flex-shrink-0 h-full min-h-[280px]  rounded-lg flex flex-col items-center justify-center gap-3 text-white hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <ShoppingBag className="w-12 h-12 text-brand" />
            <div className="text-center px-4">
              <p className="font-bold text-lg text-gradient-primary">See All</p>
              <p className="text-sm opacity-90 text-gradient-primary">{title}</p>
            </div>
            <ArrowRight className="w-6 h-6 text-brand" />
          </button>

          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
          opacity: 0;
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}