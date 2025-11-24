"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logoutUser } from "@/lib/redux/slices/authSlice";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllAsRead
} from "@/lib/redux/slices/notificationSlice";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Sun,
  Moon,
  MessageSquare,
  Package,
  CheckCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AdminHeaderProps {
  setOpen: (open: boolean) => void;
}

export default function AdminHeader({ setOpen }: AdminHeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount } = useAppSelector((state) => state.notification);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Enable real-time notifications for admin
  const isAdmin = user?.role === 'admin';
  useRealtimeNotifications(isAdmin, true);

  // Fetch notifications on mount
  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchNotifications({ limit: 10 }));
    }
  }, [isAdmin, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for: ${searchQuery}`);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await dispatch(markNotificationAsRead(notification._id));
    }
    
    // Navigate to order if it's an order notification
    if (notification.orderId) {
      router.push(`/admin/admin-portal-slrhs-25/orders/${notification.orderId}`);
      setNotificationOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const seconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="lg:hidden hover:bg-purple-50"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search products, orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-64 lg:w-96 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex hover:bg-purple-50 group"
          >
            <Sun className="w-5 h-5 rotate-0 scale-100 transition-all group-hover:rotate-90" />
          </Button>

          {/* Messages */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex hover:bg-purple-50 relative"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
          </Button>

          {/* Notifications */}
          <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-purple-50 relative"
              >
                <Bell className="w-5 h-5" />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-hidden">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span className="font-bold text-lg">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                        !notification.isRead ? "bg-purple-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(notification.createdAt)}
                            </span>
                            {notification.priority === 'high' && (
                              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                High Priority
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No notifications yet</p>
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/admin/admin-portal-slrhs-25/notifications");
                      setNotificationOpen(false);
                    }}
                    className="justify-center text-purple-600 font-semibold cursor-pointer py-3"
                  >
                    View all notifications
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 hover:bg-purple-50 pl-2 pr-4"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {user?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-gray-900">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-bold">{user?.name || "Admin"}</span>
                  <span className="text-xs text-gray-500 font-normal">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/admin/admin-portal-slrhs-25/profile")}
                className="cursor-pointer"
              >
                <User className="w-4 h-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/admin/admin-portal-slrhs-25/settings")}
                className="cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 bg-gray-50 border-gray-200"
            />
          </div>
        </form>
      </div>
    </header>
  );
}