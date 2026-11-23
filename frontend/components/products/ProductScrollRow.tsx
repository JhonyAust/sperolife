"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";

interface ProductScrollRowProps {
  title: string;
  icon?: React.ReactNode;
  products: any[];
  seeAllHref: string;
  loading?: boolean;
}

// Horizontally scrolling product row with a "See All" card at the end,
// matching the homepage sections (arrows on larger screens, swipe on phones).
export default function ProductScrollRow({ title, icon, products, seeAllHref, loading = false }: ProductScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const scroll = (direction: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: direction === "left" ? -400 : 400, behavior: "smooth" });

  if (!loading && products.length === 0) return null;

  const cardWidth = "w-[160px] sm:w-[200px] md:w-[230px] lg:w-[250px] flex-shrink-0";

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
          {icon}
          {title}
        </h3>
        <Link
          href={seeAllHref}
          className="flex flex-shrink-0 items-center gap-1 text-[#FD0002] font-semibold text-sm sm:text-base hover:underline"
        >
          See All
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-3 sm:gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`${cardWidth} h-72 rounded-xl bg-gray-200 animate-pulse`} />
          ))}
        </div>
      ) : (
        <div className="relative group/row">
          {canScrollLeft && (
            <button
              type="button"
              aria-label={`Scroll ${title} left`}
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow opacity-0 group-hover/row:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              aria-label={`Scroll ${title} right`}
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white border border-gray-200 shadow opacity-0 group-hover/row:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {products.map((product) => (
              <div key={product._id} className={cardWidth}>
                <ProductCard product={product} />
              </div>
            ))}

            {/* See All card at the end of the row */}
            <Link
              href={seeAllHref}
              className={`${cardWidth} min-h-[260px] flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-[#FD0002] hover:shadow-md transition-all`}
            >
              <ShoppingBag className="w-10 h-10 text-[#FD0002]" />
              <div className="text-center px-3">
                <p className="font-bold text-gray-900">See All</p>
                <p className="text-sm text-gray-500">{title}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#FD0002]" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
