"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag, ArrowRight, Footprints, Watch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "@/components/products/ProductCard";
import BrandLogo from "@/components/products/BrandLogo";
import api from "@/lib/api";
import {
  FEATURED_SNEAKER_BRANDS,
  UNBRANDED_KEY,
  getBrandKey,
  getLogoKey,
  buildBrandLogoMap,
} from "@/lib/brands";
import { getActiveBanners } from "@/lib/redux/slices/bannerSlice";
import { fetchProducts } from "@/lib/redux/slices/productSlice";
import { toast } from "react-hot-toast";

const SECTION_PRODUCT_LIMIT = 10;

const isShirt = (product) => (product.subCategory || "").toLowerCase().includes("shirt");

const isSneaker = (product) =>
  !isShirt(product) && (product.subCategory || "").toLowerCase().includes("sneaker");

const isAccessory = (product) =>
  !isSneaker(product) &&
  !isShirt(product) &&
  ((product.category || "").toLowerCase() === "accessories" ||
    (product.subCategory || "").toLowerCase().includes("accessor"));

const MOBILE_SECTION_LIMIT = 5;
const ACCESSORIES_KEY = "accessories";

// DOM id for a homepage section, e.g. "new balance" -> "section-new-balance"
const sectionId = (key) => `section-${String(key).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`;

const sortByNewest = (arr) => [...arr].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

// Keep only the first occurrence of each product id
const uniqueById = (arr) => {
  const seen = new Set();
  return arr.filter((p) => {
    if (!p?._id || seen.has(p._id)) return false;
    seen.add(p._id);
    return true;
  });
};

// Groups sneaker products into one section per brand: featured brands first, then the rest A–Z,
// then sneakers without a brand under "Other Brands".
const buildSneakerBrandSections = (products) => {
  const groups = new Map();

  uniqueById(products.filter(isSneaker)).forEach((product) => {
    const key = getBrandKey(product.brand);
    if (!groups.has(key)) {
      groups.set(key, { key, label: (product.brand || "").trim(), spellings: new Set(), products: [] });
    }
    const group = groups.get(key);
    if (product.brand?.trim()) group.spellings.add(product.brand.trim());
    group.products.push(product);
  });

  const toSection = (group, label) => ({
    key: group.key,
    label,
    brandFilter: [...group.spellings].join(","),
    totalCount: group.products.length,
    products: sortByNewest(group.products).slice(0, SECTION_PRODUCT_LIMIT),
  });

  const featured = FEATURED_SNEAKER_BRANDS
    .filter((b) => groups.has(b.key))
    .map((b) => toSection(groups.get(b.key), b.label));

  const featuredKeys = new Set(FEATURED_SNEAKER_BRANDS.map((b) => b.key));
  const others = [...groups.values()]
    .filter((g) => !featuredKeys.has(g.key) && g.key !== UNBRANDED_KEY)
    .map((g) => toSection(g, g.label))
    .sort((a, b) => a.label.localeCompare(b.label));

  const unbranded = groups.has(UNBRANDED_KEY) ? [toSection(groups.get(UNBRANDED_KEY), "Other Brands")] : [];

  return [...featured, ...others, ...unbranded];
};

export default function ModernHomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(64);
  const [brandLogos, setBrandLogos] = useState({}); // admin-uploaded logos by brand key
  const tabBarRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false); // ADD THIS
  const [allProducts, setAllProducts] = useState([]);

  // Get data from Redux
  const { banners, loading: bannersLoading } = useSelector((state) => state.banner || { banners: [], loading: false });
  const { user } = useSelector((state) => state.auth || { user: null });
  const { product, loading: productsLoading } = useSelector((state) => state.product || { products: [], loading: false });

  // ✅ UPDATED: Filter banners based on device type and isMobile field
  const activeBanners = React.useMemo(() => {
    if (!banners || banners.length === 0) return [];
    
    return banners
      .filter((banner) => {
        // Must be active
        if (!banner.isActive) return false;
        
        // Logic: isMobile controls which device the banner appears on
        // - If isMobile=true: ONLY show on mobile devices
        // - If isMobile=false: ONLY show on desktop/laptop
        if (isMobileDevice) {
          // On mobile: only show banners with isMobile=true
          return banner.isMobile === true;
        } else {
          // On desktop: only show banners with isMobile=false
          return banner.isMobile === false;
        }
      })
      .sort((a, b) => a.position - b.position);
  }, [banners, isMobileDevice]);

  // One section per sneaker brand (Nike, Adidas, Vans, LV, then other brands)
  const sneakerBrandSections = React.useMemo(() => buildSneakerBrandSections(allProducts), [allProducts]);

  const accessoryProducts = React.useMemo(
    () => sortByNewest(uniqueById(allProducts.filter(isAccessory))),
    [allProducts]
  );

  // Brand tabs: one per sneaker brand section, then Accessories
  const tabs = React.useMemo(() => {
    const brandTabs = sneakerBrandSections.map((section) => ({
      key: section.key,
      label: section.label,
      logoKey: getLogoKey(section.key),
      logoUrl: brandLogos[section.key] || null,
    }));
    return accessoryProducts.length > 0
      ? [...brandTabs, { key: ACCESSORIES_KEY, label: "Accessories", logoKey: null }]
      : brandTabs;
  }, [sneakerBrandSections, accessoryProducts.length, brandLogos]);

  const scrollToSection = (key) => {
    setActiveSection(key);
    document.getElementById(sectionId(key))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Admin-uploaded brand logos replace the built-in ones
  useEffect(() => {
    api
      .get("/brands")
      .then(({ data }) => setBrandLogos(buildBrandLogoMap(data?.brands)))
      .catch(() => {}); // built-in logos are used if this fails
  }, []);

  // The site header is sticky and changes height on scroll; keep the brand bar right below it
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header || typeof ResizeObserver === "undefined") return;
    const update = () => setHeaderHeight(header.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Sticky header + brand bar: sections scrolled to from a tab land just below both
  const stickyOffset = headerHeight + 72;

  // Highlight the tab of the section currently in view
  useEffect(() => {
    if (tabs.length === 0 || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.dataset.sectionKey);
      },
      { rootMargin: `-${stickyOffset + 10}px 0px -50% 0px` }
    );
    tabs.forEach((tab) => {
      const el = document.getElementById(sectionId(tab.key));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tabs, stickyOffset]);

  // Keep the active tab visible inside the horizontally scrolling tab bar
  useEffect(() => {
    if (!activeSection || !tabBarRef.current) return;
    const el = tabBarRef.current.querySelector(`[data-tab-key="${CSS.escape(String(activeSection))}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeSection]);

  const brandViewAllUrl = (section) => {
    const params = new URLSearchParams({ subCategory: "Sneakers" });
    if (section.brandFilter) {
      params.set("brand", section.brandFilter);
      params.set("brandLabel", section.label);
    }
    return `/products?${params.toString()}`;
  };

  // ✅ ADD: Detect device type on mount
  useEffect(() => {
    // Detect if mobile device
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setIsMobileDevice(mobile);
        console.log('🔍 Device detection:', mobile ? 'Mobile' : 'Desktop');
      }
    };

    checkMobile();
    
    // Optional: Re-check on resize (for responsive testing)
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsVisible(true);
    
    // ✅ UPDATED: Fetch banners with device parameter
    dispatch(getActiveBanners(isMobileDevice ? 'mobile' : undefined))
      .unwrap()
      .then((response) => {
        console.log('✅ Banners response:', response);
        console.log(`📱 Showing ${response.data?.length || 0} banners for ${isMobileDevice ? 'mobile' : 'desktop'}`);
      })
      .catch((error) => {
        console.error('❌ Banner fetch error:', error);
      });
    
    dispatch(fetchProducts({ page: 1, limit: 500 })).then((res) => {
      if (res?.payload?.products) {
        setAllProducts(res.payload.products);
      }
    });
  }, [dispatch, isMobileDevice]); // ✅ Re-fetch when device type changes

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

  // ✅ ADD: Debug info in console
  useEffect(() => {
    console.log('🎯 Active banners count:', activeBanners.length);
    console.log('📱 Is mobile device:', isMobileDevice);
    console.log('🎨 Banners data:', activeBanners.map(b => ({
      id: b._id,
      title: b.title,
      isMobile: b.isMobile,
      isActive: b.isActive
    })));
  }, [activeBanners, isMobileDevice]);

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* ✅ ADD: Debug banner at top (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-500 text-white text-xs p-2 text-center font-mono">
          Device: {isMobileDevice ? '📱 Mobile' : '🖥️ Desktop'} | 
          Banners: {activeBanners.length} | 
          Total: {banners?.length || 0}
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="relative h-[200px] sm:h-[250px] md:h-[300px]  xl:h-[350px] overflow-hidden">
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
                      className="w-full h-full object-center object-fill md:object-cover"
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
              <p className="text-lg md:text-xl text-white/80">
                {isMobileDevice 
                  ? "Browse on mobile for the best experience" 
                  : "Discover Amazing Products"
                }
              </p>
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

      {/* Brand Tabs - sticky, one per brand with its logo; tap to jump to that section */}
      {tabs.length > 0 && (
        <nav
          aria-label="Shop by brand"
          className="sticky z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm"
          style={{ top: headerHeight }}
        >
          <div
            ref={tabBarRef}
            className="container mx-auto px-3 md:px-8 lg:px-16 flex gap-2 md:gap-3 overflow-x-auto hide-scrollbar py-2.5"
          >
            {tabs.map((tab) => (
              <BrandTab
                key={tab.key}
                tab={tab}
                active={activeSection === tab.key}
                onClick={() => scrollToSection(tab.key)}
              />
            ))}
          </div>
        </nav>
      )}

      {productsLoading && allProducts.length === 0 && (
        <section className="py-4 lg:py-6 bg-white">
          <div className="container mx-auto px-4 md:px-8 lg:px-16">
            <HorizontalScroll products={[]} loading />
          </div>
        </section>
      )}

      {/* Sneaker Brand Sections - one per brand, sneakers only */}
      {sneakerBrandSections.map((section, index) => (
        <section
          key={section.key}
          id={sectionId(section.key)}
          data-section-key={section.key}
          className={`py-4 lg:py-6 ${index % 2 === 0 ? "bg-white" : "bg-[#EAEDED]"}`}
          style={{ scrollMarginTop: stickyOffset }}
        >
          {/* Mobile */}
          <div className="md:hidden container mx-auto px-4">
            <SubCategoryRow
              title={section.label}
              icon={<SectionLogo logoKey={getLogoKey(section.key)} logoUrl={brandLogos[section.key]} label={section.label} />}
              products={section.products.slice(0, MOBILE_SECTION_LIMIT)}
              loading={false}
              onSeeAll={() => router.push(brandViewAllUrl(section))}
            />
          </div>

          {/* Tablet / Desktop */}
          <div className="hidden md:block container mx-auto px-4 md:px-8 lg:px-16">
            <SectionHeader
              icon={<SectionLogo logoKey={getLogoKey(section.key)} logoUrl={brandLogos[section.key]} label={section.label} />}
              badge={`${section.totalCount} ${section.totalCount === 1 ? "Pair" : "Pairs"}`}
              title={section.label}
              gradient="from-red-700 via-[#FD0002] to-red-500"
              accentColor="red"
              onViewAll={() => router.push(brandViewAllUrl(section))}
            />
            <HorizontalScroll products={section.products} loading={false} />
          </div>
        </section>
      ))}

      {/* Accessories - bottom of homepage */}
      {accessoryProducts.length > 0 && (
        <section
          id={sectionId(ACCESSORIES_KEY)}
          data-section-key={ACCESSORIES_KEY}
          className={`py-4 lg:py-6 ${sneakerBrandSections.length % 2 === 0 ? "bg-white" : "bg-[#EAEDED]"}`}
          style={{ scrollMarginTop: stickyOffset }}
        >
          <div className="md:hidden container mx-auto px-4">
            <SubCategoryRow
              title="Accessories"
              icon={<Watch className="w-6 h-6 text-amber-600" />}
              products={accessoryProducts.slice(0, MOBILE_SECTION_LIMIT)}
              loading={false}
              onSeeAll={() => router.push("/products?category=accessories")}
            />
          </div>
          <div className="hidden md:block container mx-auto px-4 md:px-8 lg:px-16">
            <SectionHeader
              icon={<Watch className="text-amber-600" />}
              badge="Complete Your Look"
              title="Accessories"
              gradient="from-amber-700 via-amber-600 to-amber-500"
              accentColor="amber"
              onViewAll={() => router.push("/products?category=accessories")}
            />
            <HorizontalScroll products={accessoryProducts.slice(0, SECTION_PRODUCT_LIMIT)} loading={false} />
          </div>
        </section>
      )}

      {!productsLoading && allProducts.length > 0 && sneakerBrandSections.length === 0 && accessoryProducts.length === 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm md:text-base">No products available</p>
          </div>
        </section>
      )}

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
    red: "border-red-300 hover:border-red-500 hover:bg-red-50 text-[#FD0002]", // ✅ Used for Hot Deals
  };

  return (
    <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
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
        className={`flex flex-shrink-0 items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border-2 font-semibold text-xs md:text-sm transition-all duration-300 hover:scale-105 ${colors[accentColor]}`}
      >
        View All
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Brand Tab - logo chip in the sticky brand bar
function BrandTab({ tab, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tab-key={tab.key}
      aria-current={active ? "true" : undefined}
      className={`flex-shrink-0 flex items-center gap-2 h-11 md:h-12 px-3.5 md:px-4 rounded-full border-2 text-sm font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FD0002] focus-visible:ring-offset-1 ${
        active
          ? "bg-gray-900 border-gray-900 text-white shadow-md"
          : "bg-white border-gray-200 text-gray-900 hover:border-gray-400"
      }`}
    >
      <TabIcon tab={tab} active={active} />
      <span className="whitespace-nowrap">{tab.label}</span>
    </button>
  );
}

function TabIcon({ tab, active }) {
  if (tab.key === ACCESSORIES_KEY) {
    return <Watch className={`w-5 h-5 ${active ? "text-white" : "text-amber-600"}`} />;
  }
  if (!tab.logoKey && !tab.logoUrl) {
    return <Footprints className={`w-5 h-5 ${active ? "text-white" : "text-[#FD0002]"}`} />;
  }
  return (
    <span className={`flex items-center justify-center h-7 min-w-7 rounded-full ${active ? "bg-white px-1" : ""}`}>
      <BrandLogo
        brandKey={tab.logoKey}
        src={tab.logoUrl}
        label={tab.label}
        className={`h-6 w-6 ${active ? "text-gray-900" : "text-black"}`}
        fallback={<Footprints className={`w-5 h-5 ${active ? "text-gray-900" : "text-[#FD0002]"}`} />}
      />
    </span>
  );
}

// Brand logo next to a mobile section title
function SectionLogo({ logoKey, logoUrl, label }) {
  if (!logoKey && !logoUrl) return <Footprints className="w-6 h-6 text-[#FD0002]" />;
  return (
    <BrandLogo
      brandKey={logoKey}
      src={logoUrl}
      label={label}
      className="h-7 w-7 text-black"
      fallback={<Footprints className="w-6 h-6 text-[#FD0002]" />}
    />
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
          <span className="text-2xl flex items-center">{icon}</span>
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
          <span className="text-2xl flex items-center">{icon}</span>
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