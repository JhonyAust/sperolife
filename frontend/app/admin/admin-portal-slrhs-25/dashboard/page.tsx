// app/admin/admin-portal-slrhs-25/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { getAllUsers, getUserStats } from "@/lib/redux/slices/adminSlice";
import {
  Users,
  Package,
  ShoppingCart,
  Search,
  Truck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  Calendar,
  BarChart3,
} from "lucide-react";

// Animated Stats Card Component
function StatCard({ icon: Icon, title, value, change, changeLabel, iconBg, gradient, trend, index }) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";
  
  return (
    <div 
      className="group relative rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-purple-200 hover:-translate-y-2"
      style={{ 
        animation: `fadeInUp 0.6s ease-out forwards`,
        animationDelay: `${index * 0.1}s`,
        opacity: 0
      }}
    >
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
      {/* Decorative corner blob */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>

      <div className="relative z-10 p-6">
        {/* Icon and Change Badge */}
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl ${iconBg} group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-xl`}>
            <Icon className="w-7 h-7" strokeWidth={2.5} />
          </div>
          
          {change !== undefined && change !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              isPositive ? 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100' : 
              isNegative ? 'bg-rose-50 text-rose-700 group-hover:bg-rose-100' : 
              'bg-gray-50 text-gray-600'
            }`}>
              {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
              {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wider">
          {title}
        </h3>

        {/* Value */}
        <div className="mb-4">
          <div className={`text-4xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 inline-block`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">{changeLabel || "vs last week"}</span>
          <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${gradient} opacity-60 group-hover:w-24 group-hover:opacity-100 transition-all duration-500`}></div>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </div>
  );
}

// Quick Stats Component
function QuickStat({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 group">
      <div className={`p-2.5 rounded-lg ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-600 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// Recent Activity Item
function ActivityItem({ icon: Icon, title, time, status, index }) {
  const statusColors = {
    success: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div 
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-200 group"
      style={{ 
        animation: `slideInRight 0.5s ease-out forwards`,
        animationDelay: `${index * 0.1}s`,
        opacity: 0
      }}
    >
      <div className="p-2.5 rounded-lg bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{time}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[status]}`}>
        {status}
      </span>
    </div>
  );
}

// Registration Chart Component (Simple Bar Chart)
function RegistrationChart({ data }) {
  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          Weekly Registrations
        </h2>
      </div>
      <div className="space-y-4">
        {data.map((item, index) => {
          const date = new Date(item.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const percentage = (item.count / maxCount) * 100;
          
          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{dayName}</span>
                <span className="text-sm font-bold text-purple-600">{item.count} users</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                  style={{ 
                    width: `${percentage}%`,
                    animation: `growBar 1s ease-out forwards ${index * 0.1}s`
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  
  // Get real data from Redux
  const { users, userStats, loading } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAllUsers({ limit: 5 })); // Get latest 5 users
    dispatch(getUserStats());
  }, [dispatch]);

  // Extract real data
  const totalUsers = userStats?.totalUsers || 0;
  const newUsersThisWeek = userStats?.newUsersThisWeek || 0;
  const activeUsers = userStats?.activeUsers || 0;
  const inactiveUsers = userStats?.inactiveUsers || 0;
  const percentChange = userStats?.percentChange || 0;
  const adminCount = userStats?.usersByRole?.admin || 0;
  const regularUserCount = userStats?.usersByRole?.user || 0;
  const registrationsByDay = userStats?.registrationsByDay || [];

  // Demo data for products and orders (will be replaced later)
  const DEMO_DATA = {
    totalProducts: 1847,
    totalOrders: 892,
    pendingOrders: 47,
    deliveredOrders: 628,
    revenue: 45231,
    avgResponse: "2.4h",
    successRate: "98.5%",
    issues: 3,
  };

  const statsConfig = [
    {
      icon: Users,
      title: "Total Users",
      value: totalUsers,
      change: percentChange,
      trend: percentChange >= 0 ? "up" : "down",
      iconBg: "bg-gradient-to-br from-violet-100 to-violet-200 text-violet-700",
      gradient: "from-violet-600 to-purple-600",
    },
    {
      icon: UserCheck,
      title: "Active Users",
      value: activeUsers,
      change: null,
      changeLabel: "Last 30 days",
      iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700",
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      icon: Calendar,
      title: "New This Week",
      value: newUsersThisWeek,
      change: percentChange,
      trend: percentChange >= 0 ? "up" : "down",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700",
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      icon: Package,
      title: "Total Products",
      value: DEMO_DATA.totalProducts,
      change: 4.3,
      trend: "up",
      iconBg: "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700",
      gradient: "from-indigo-600 to-purple-600",
    },
    {
      icon: DollarSign,
      title: "Total Revenue",
      value: `₹${DEMO_DATA.revenue.toLocaleString()}`,
      change: 18.2,
      trend: "up",
      iconBg: "bg-gradient-to-br from-green-100 to-green-200 text-green-700",
      gradient: "from-green-600 to-emerald-600",
    },
    {
      icon: ShoppingCart,
      title: "Total Orders",
      value: DEMO_DATA.totalOrders,
      change: -2.1,
      trend: "down",
      iconBg: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700",
      gradient: "from-amber-600 to-orange-600",
    },
  ];

  const quickStats = [
    { 
      icon: Users, 
      label: "Regular Users", 
      value: regularUserCount.toLocaleString(), 
      color: "bg-blue-100 text-blue-600" 
    },
    { 
      icon: UserCheck, 
      label: "Admins", 
      value: adminCount.toString(), 
      color: "bg-purple-100 text-purple-600" 
    },
    { 
      icon: UserX, 
      label: "Inactive", 
      value: inactiveUsers.toString(), 
      color: "bg-red-100 text-red-600" 
    },
    { 
      icon: AlertCircle, 
      label: "Issues", 
      value: DEMO_DATA.issues.toString(), 
      color: "bg-orange-100 text-orange-600" 
    },
  ];

  // Real recent activities from users
  const recentActivities = users.slice(0, 5).map((user, index) => {
    const timeAgo = getTimeAgo(new Date(user.createdAt));
    return {
      icon: Users,
      title: `${user.name} registered`,
      time: timeAgo,
      status: user.isActive ? "success" : "pending",
    };
  });

  // Helper function to get time ago
  function getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  // Show loading state
  if (loading && totalUsers === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="mb-8" style={{ animation: 'fadeIn 0.6s ease-out' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-12 bg-gradient-to-b from-purple-600 via-fuchsia-600 to-pink-600 rounded-full shadow-lg"></div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
              <span className="text-sm font-bold text-purple-600 uppercase tracking-wider">
                Admin Dashboard
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-fuchsia-800 bg-clip-text text-transparent">
              Welcome Back, Admin
            </h1>
          </div>
        </div>
        <p className="text-gray-600 ml-4 text-lg">
          Here's what's happening with your store today
        </p>
      </div>

      {/* Info Badge - Data Status */}
      <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-green-900 mb-1">Live Data Connected</h3>
            <p className="text-sm text-green-700">
              <span className="font-semibold">Real data:</span> Users, Activity, Statistics • 
              <span className="font-semibold ml-2">Demo data:</span> Products, Orders, Revenue
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsConfig.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat) => (
          <QuickStat key={stat.label} {...stat} />
        ))}
      </div>

      {/* Charts and Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Registration Chart */}
        <RegistrationChart data={registrationsByDay} />

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-purple-600" />
              Recent Activity
            </h2>
            <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">
              View All →
            </button>
          </div>
          <div className="space-y-2">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <ActivityItem key={index} {...activity} index={index} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes growBar {
          from {
            width: 0;
          }
        }
      `}</style>
    </div>
  );
}