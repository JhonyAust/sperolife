"use client";

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  getAllBanners,
  getBannerStats,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  uploadBannerImage,
  reorderBanners,
} from '@/lib/redux/slices/adminBannerSlice';
import {
  Image as ImageIcon, Plus, Loader2, Sparkles, TrendingUp,
  Calendar, Eye, EyeOff, Edit, Trash2, GripVertical,
  AlertCircle, RefreshCw, CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import AdminBannerModal from '@/components/admin/AdminBannerModal';

export default function AdminBannersPage() {
  const dispatch = useAppDispatch();
  const { banners, bannerStats, loading, uploading } = useAppSelector(
    (state) => state.adminBanner
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadBanners();
    dispatch(getBannerStats());
  }, [dispatch]);

  const loadBanners = () => {
    dispatch(getAllBanners());
  };

  const handleEdit = (banner: any) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      try {
        await dispatch(deleteBanner(id)).unwrap();
        alert('Banner deleted successfully');
        loadBanners();
        dispatch(getBannerStats());
      } catch (error) {
        alert('Failed to delete banner');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await dispatch(toggleBannerStatus(id)).unwrap();
      loadBanners();
    } catch (error) {
      alert('Failed to update banner status');
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const result = await dispatch(uploadBannerImage(file)).unwrap();
      return result.result.secure_url;
    } catch (error) {
      throw new Error('Failed to upload image');
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedBanner) {
        await dispatch(updateBanner({
          bannerId: selectedBanner._id,
          bannerData: formData
        })).unwrap();
        alert('Banner updated successfully! ✨');
      } else {
        await dispatch(createBanner(formData)).unwrap();
        alert('Banner created successfully! 🎉');
      }
      setIsModalOpen(false);
      setSelectedBanner(null);
      loadBanners();
      dispatch(getBannerStats());
    } catch (error: any) {
      alert(error || 'Failed to save banner');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBanners = [...banners];
    const draggedBanner = newBanners[draggedIndex];
    newBanners.splice(draggedIndex, 1);
    newBanners.splice(index, 0, draggedBanner);
    
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex !== null) {
      const bannerIds = banners.map((b: any) => b._id);
      try {
        await dispatch(reorderBanners(bannerIds)).unwrap();
        alert('Banner order updated successfully!');
      } catch (error) {
        alert('Failed to reorder banners');
        loadBanners(); // Reload to reset order
      }
    }
    setDraggedIndex(null);
  };

  const stats = [
    {
      label: 'Total Banners',
      value: bannerStats?.totalBanners || 0,
      icon: ImageIcon,
      color: 'from-purple-500 to-fuchsia-500',
      bgColor: 'from-purple-50 to-fuchsia-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'Active Banners',
      value: bannerStats?.activeBanners || 0,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      textColor: 'text-green-600'
    },
    {
      label: 'Inactive Banners',
      value: bannerStats?.inactiveBanners || 0,
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      textColor: 'text-orange-600'
    },
    {
      label: 'Scheduled',
      value: bannerStats?.scheduledBanners || 0,
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-600'
    },
  ];

  if (loading && banners.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto" />
          <p className="text-gray-600 font-bold text-lg">Loading banners...</p>
          <div className="flex gap-2 justify-center">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-fuchsia-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-fuchsia-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-2 h-16 bg-gradient-to-b from-purple-600 via-fuchsia-600 to-pink-600 rounded-full shadow-lg"></div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
              <span className="text-sm font-black text-purple-600 uppercase tracking-wider">
                Marketing Management System
              </span>
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-fuchsia-800 bg-clip-text text-transparent">
              Banners Dashboard
            </h1>
            <p className="text-gray-600 font-medium mt-1">
              Create and manage promotional banners for your website
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedBanner(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white font-black rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1"
          >
            <Plus className="w-6 h-6" />
            Add New Banner
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-bold mb-2 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-8 h-8 ${stat.textColor}`} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
                <span>Updated just now</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <GripVertical className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600 font-medium">
              Drag banners to reorder them
            </span>
          </div>
          <button
            onClick={loadBanners}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-purple-500 hover:bg-purple-50 transition-colors font-bold"
          >
            <RefreshCw className={`w-5 h-5 text-gray-700 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Banners List */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-lg border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-3">No banners found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Get started by adding your first promotional banner
          </p>
          <button
            onClick={() => {
              setSelectedBanner(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black rounded-2xl hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            Add Your First Banner
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {banners.map((banner: any, index: number) => (
            <div
              key={banner._id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 overflow-hidden ${
                draggedIndex === index ? 'border-purple-500 opacity-50' : 'border-gray-100 hover:border-purple-300'
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Banner Image */}
                <div className="relative w-full md:w-96 h-48 bg-gray-100 flex-shrink-0">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="px-3 py-1.5 bg-white text-black backdrop-blur-sm rounded-full text-xs font-bold flex items-center gap-1">
                      <GripVertical className="w-3 h-3 text-black" />
                      Position {index + 1}
                    </div>
                    {banner.isActive ? (
                      <div className="px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-gray-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Inactive
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner Details */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 mb-2">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-lg font-bold text-purple-600 mb-2">{banner.subtitle}</p>
                      )}
                      {banner.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{banner.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {banner.link && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Link</p>
                        <p className="text-sm text-gray-900 truncate">{banner.link}</p>
                      </div>
                    )}
                    {banner.linkText && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Button Text</p>
                        <p className="text-sm text-gray-900">{banner.linkText}</p>
                      </div>
                    )}
                    {(banner.startDate || banner.endDate) && (
                      <div className="col-span-2">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Schedule</p>
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4" />
                          {banner.startDate && (
                            <span>From: {new Date(banner.startDate).toLocaleDateString()}</span>
                          )}
                          {banner.endDate && (
                            <span>To: {new Date(banner.endDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Colors */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: banner.backgroundColor }}
                      />
                      <span className="text-xs text-gray-500">BG</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: banner.textColor }}
                      />
                      <span className="text-xs text-gray-500">Text</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg border-2 border-gray-200"
                        style={{ backgroundColor: banner.buttonColor }}
                      />
                      <span className="text-xs text-gray-500">Button</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(banner._id)}
                      className={`flex-1 px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        banner.isActive
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    {banner.isMobile && (
                      <div className="px-3 py-1.5 bg-blue-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Mobile
                      </div>
                    )}
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner Modal */}
      <AdminBannerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBanner(null);
        }}
        banner={selectedBanner}
        onSave={handleSave}
        uploading={uploading}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
}