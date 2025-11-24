// components/layout/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Sparkles,
  TrendingUp,
  Zap,
  Gift,
  LogOut,
  Settings,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { logoutUser } from "@/lib/redux/slices/authSlice";
import AuthModal from "../auth/AuthModel";
import CartSlider from "../cart/CartSlider";

const categories = [
  { name: "Men", href: "/products?category=men", icon: TrendingUp },
  { name: "Women", href: "/products?category=women", icon: Sparkles },
  { name: "Kids", href: "/products?category=kids", icon: Gift },
  { name: "Sale", href: "/products?onSale=true", icon: Zap, badge: "Hot" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartSliderOpen, setCartSliderOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowMobileSearch(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/");
  };

  return (
    <>
      {/* Top Banner - Ultra thin with animation */}
      <div className="bg-gradient-to-r from-red-600 via-black to-red-600 text-white text-center py-2 text-xs sm:text-sm font-semibold relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        <div className="relative flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 animate-pulse" />
          <span>FREE SHIPPING on orders over $50 • Use code: SPERO2024</span>
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-2xl border-b border-red-100"
            : "bg-white border-b border-gray-100"
        }`}
      >
        <div className="container mx-auto px-4">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2 relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#ED1D26] to-[#F7D000] rounded-lg blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-[#ED1D26] via-red-700 to-pink-700 p-3 rounded-lg transform group-hover:scale-110 transition-all duration-500">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-red-600 via-pink-700 to-red-600 bg-clip-text text-transparent">
                  SPEROLIFE
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-widest -mt-1">
                  PREMIUM LIFESTYLE
                </span>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 rounded-full blur-md opacity-0 group-focus-within:opacity-30 transition-opacity duration-500"></div>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-red-600 transition-colors duration-300" />
                  <Input
                    type="search"
                    placeholder="Search for products, brands, and more..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 rounded-full border-2 border-gray-200 focus:border-red-600 focus:ring-4 focus:ring-red-600/20 transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1 h-10 w-10 rounded-full bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-gray-900 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Wishlist */}
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
                >
                  <Heart className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" />
                  {wishlistItems.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600 hover:bg-red-700 animate-pulse">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Cart - Opens Slider */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartSliderOpen(true)}
                className="relative hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-gradient-to-r from-red-600 to-black hover:from-red-700 hover:to-gray-900 animate-bounce">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-red-50 transition-all duration-300"
                    >
                      <Avatar className="h-9 w-9 ring-2 ring-red-600 ring-offset-2 cursor-pointer hover:scale-110 transition-transform duration-300">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-red-600 to-pink-700 text-white font-bold">
                          {user.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/orders")}>
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/account")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem onClick={() => router.push("/admin/admin-portal-slrhs-25/orders")}>
                        <Settings className="mr-2 h-4 w-4 text-red-600" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-gray-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="hover:bg-red-50"
            >
              <Menu className="w-6 h-6" />
            </Button>

            {/* Mobile Logo */}
            <Link href="/" className="flex items-center gap-1">
              <div className="bg-gradient-to-br from-red-600 to-pink-700 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black bg-gradient-to-r from-red-600 to-pink-700 bg-clip-text text-transparent">
                SPEROLIFE
              </span>
            </Link>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="hover:bg-red-50"
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setCartSliderOpen(true)}
                className="relative hover:bg-red-50"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] bg-red-600">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          {showMobileSearch && (
            <div className="lg:hidden py-3 border-t border-gray-100 animate-in slide-in-from-top duration-300">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-20 h-11 rounded-full border-2 border-gray-200 focus:border-red-600"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 rounded-full bg-gradient-to-r from-red-600 to-pink-700"
                >
                  Search
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Categories Bar - Desktop */}
        <div className="hidden lg:block border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-center gap-8 h-12">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="group flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-600 transition-all duration-300 relative"
                >
                  <category.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {category.name}
                  {category.badge && (
                    <Badge className="bg-red-600 hover:bg-red-700 text-[10px] animate-pulse">
                      {category.badge}
                    </Badge>
                  )}
                  <div className="absolute -bottom-3 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-pink-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetHeader className="p-6 border-b border-gray-100 bg-gradient-to-br from-red-50 to-white">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-red-600 to-black p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <SheetTitle className="text-xl font-black bg-gradient-to-r from-red-600 to-pink-700 bg-clip-text text-transparent">
                SPEROLIFE
              </SheetTitle>
            </div>
          </SheetHeader>

          <div className="p-6 space-y-6">
            {/* User Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-red-50 to-gray-50 border border-red-100">
                <Avatar className="h-12 w-12 ring-2 ring-red-600 ring-offset-2">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-red-600 to-pink-700 text-white font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowAuthModal(true);
                }}
                className="w-full bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-gray-900"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}

            {/* Categories */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider mb-3">
                Shop by Category
              </h3>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-all duration-300 group"
                >
                  <category.icon className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-gray-700 group-hover:text-red-600">
                    {category.name}
                  </span>
                  {category.badge && (
                    <Badge className="ml-auto bg-red-600">{category.badge}</Badge>
                  )}
                </Link>
              ))}
            </div>

            {/* Quick Links */}
            {isAuthenticated && (
              <>
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <Package className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">My Orders</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <Heart className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Wishlist</span>
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Settings</span>
                  </Link>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Cart Slider */}
      <CartSlider isOpen={cartSliderOpen} onClose={() => setCartSliderOpen(false)} />

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </>
  );
}