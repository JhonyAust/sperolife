"use client";

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  getAllAnnouncements,
  getAnnouncementStats,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  reorderAnnouncements,
} from '@/lib/redux/slices/adminAnnouncementSlice';
import {
  Bell, Plus, Loader2, Sparkles, TrendingUp,
  Calendar, Eye, EyeOff, Edit, Trash2, GripVertical,
  AlertCircle, RefreshCw, CheckCircle, Zap, Gift,
  Star, Heart, Tag, Link as LinkIcon
} from 'lucide-react';
import AdminAnnouncementModal from '@/components/admin/AdminAnnouncementModal';

// Icon mapping
const iconMap: { [key: string]: any } = {
  zap: Zap,
  sparkles: Sparkles,
  gift: Gift,
  star: Star,
  heart: Heart,
  bell: Bell,
  tag: Tag,
};

export default function AdminAnnouncementsPage() {
  const dispatch = useAppDispatch();
  const { announcements, announcementStats, loading } = useAppSelector(
    (state) => state.adminAnnouncement
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadAnnouncements();
    dispatch(getAnnouncementStats());
  }, [dispatch]);

  const loadAnnouncements = () => {
    dispatch(getAllAnnouncements());
  };

  const handleEdit = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      try {
        await dispatch(deleteAnnouncement(id)).unwrap();
        alert('Announcement deleted successfully');
        loadAnnouncements();
        dispatch(getAnnouncementStats());
      } catch (error) {
        alert('Failed to delete announcement');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await dispatch(toggleAnnouncementStatus(id)).unwrap();
      loadAnnouncements();
    } catch (error) {
      alert('Failed to update announcement status');
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (selectedAnnouncement) {
        await dispatch(updateAnnouncement({
          announcementId: selectedAnnouncement._id,
          announcementData: formData
        })).unwrap();
        alert('Announcement updated successfully! ✨');
      } else {
        await dispatch(createAnnouncement(formData)).unwrap();
        alert('Announcement created successfully! 🎉');
      }
      setIsModalOpen(false);
      setSelectedAnnouncement(null);
      loadAnnouncements();
      dispatch(getAnnouncementStats());
    } catch (error: any) {
      alert(error || 'Failed to save announcement');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newAnnouncements = [...announcements];
    const draggedAnnouncement = newAnnouncements[draggedIndex];
    newAnnouncements.splice(draggedIndex, 1);
    newAnnouncements.splice(index, 0, draggedAnnouncement);
    
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex !== null) {
      const announcementIds = announcements.map((a: any) => a._id);
      try {
        await dispatch(reorderAnnouncements(announcementIds)).unwrap();
        alert('Announcement order updated successfully!');
      } catch (error) {
        alert('Failed to reorder announcements');
        loadAnnouncements();
      }
    }
    setDraggedIndex(null);
  };

  const stats = [
    {
      label: 'Total Announcements',
      value: announcementStats?.totalAnnouncements || 0,
      icon: Bell,
      color: 'from-purple-500 to-fuchsia-500',
      bgColor: 'from-purple-50 to-fuchsia-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'Active Announcements',
      value: announcementStats?.activeAnnouncements || 0,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      textColor: 'text-green-600'
    },
    {
      label: 'Inactive',
      value: announcementStats?.inactiveAnnouncements || 0,
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      textColor: 'text-orange-600'
    },
    {
      label: 'With Links',
      value: announcementStats?.linkedAnnouncements || 0,
      icon: LinkIcon,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-600'
    },
  ];

  if (loading && announcements.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto" />
          <p className="text-gray-600 font-bold text-lg">Loading announcements...</p>
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
              Announcements Dashboard
            </h1>
            <p className="text-gray-600 font-medium mt-1">
              Create and manage header announcements for your website
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedAnnouncement(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white font-black rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-1"
          >
            <Plus className="w-6 h-6" />
            Add New Announcement
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
              Drag announcements to change display priority
            </span>
          </div>
          <button
            onClick={loadAnnouncements}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-purple-500 hover:bg-purple-50 transition-colors font-bold"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-lg border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Bell className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-3">No announcements found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Get started by adding your first header announcement
          </p>
          <button
            onClick={() => {
              setSelectedAnnouncement(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black rounded-2xl hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            Add Your First Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement: any, index: number) => {
            const AnnouncementIcon = iconMap[announcement.icon] || Bell;
            return (
              <div
                key={announcement._id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 p-6 ${
                  draggedIndex === index ? 'border-purple-500 opacity-50' : 'border-gray-100 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Side - Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-3 py-1.5 text-gray-600 bg-gray-100 rounded-full text-xs font-bold flex items-center gap-1">
                        <GripVertical className="w-3 h-3" />
                        Priority {index + 1}
                      </div>
                      {announcement.isActive ? (
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
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: announcement.backgroundColor }}>
                        <AnnouncementIcon className="w-3 h-3" style={{ color: announcement.textColor }} />
                        <span className="text-xs font-bold" style={{ color: announcement.textColor }}>
                          {announcement.icon}
                        </span>
                      </div>
                    </div>

                    {/* Announcement Preview */}
                    <div 
                      className="p-4 rounded-xl mb-4 flex items-center justify-center gap-2"
                      style={{ backgroundColor: announcement.backgroundColor }}
                    >
                      <AnnouncementIcon className="w-4 h-4" style={{ color: announcement.textColor }} />
                      <span className="font-bold" style={{ color: announcement.textColor }}>
                        {announcement.text}
                      </span>
                      <AnnouncementIcon className="w-4 h-4" style={{ color: announcement.textColor }} />
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {announcement.link && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Link</p>
                          <p className="text-sm text-gray-900 truncate">{announcement.link}</p>
                        </div>
                      )}
                      {(announcement.startDate || announcement.endDate) && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Schedule</p>
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Calendar className="w-4 h-4" />
                            {announcement.startDate && (
                              <span>From: {new Date(announcement.startDate).toLocaleDateString()}</span>
                            )}
                            {announcement.endDate && (
                              <span>To: {new Date(announcement.endDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <button
                      onClick={() => handleToggleStatus(announcement._id)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        announcement.isActive
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {announcement.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {announcement.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Announcement Modal */}
      <AdminAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        announcement={selectedAnnouncement}
        onSave={handleSave}
      />
    </div>
  );
}