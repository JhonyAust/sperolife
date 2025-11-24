"use client";

import { useState, useEffect } from 'react';
import { X, Loader2, Image as ImageIcon, Sparkles, Palette, Type, MousePointer2, Info } from 'lucide-react';
import Image from 'next/image';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: any;
  onSave: (data: any) => void;
  uploading: boolean;
  onImageUpload: (file: File) => Promise<string>;
}

export default function AdminBannerModal({
  isOpen,
  onClose,
  banner,
  onSave,
  uploading,
  onImageUpload,
}: BannerModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    link: '',
    linkText: 'Shop Now',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    buttonColor: '#FD0002',
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (banner) {
      const hasContent = banner.title || banner.subtitle || banner.description || banner.link;
      setShowAdvanced(hasContent);
      
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        image: banner.image || '',
        link: banner.link || '',
        linkText: banner.linkText || 'Shop Now',
        backgroundColor: banner.backgroundColor || '#000000',
        textColor: banner.textColor || '#ffffff',
        buttonColor: banner.buttonColor || '#FD0002',
        isActive: banner.isActive ?? true,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
      });
      setImagePreview(banner.image || '');
    } else {
      setShowAdvanced(false);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        image: '',
        link: '',
        linkText: 'Shop Now',
        backgroundColor: '#000000',
        textColor: '#ffffff',
        buttonColor: '#FD0002',
        isActive: true,
        startDate: '',
        endDate: '',
      });
      setImagePreview('');
    }
  }, [banner, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const url = await onImageUpload(file);
      setFormData(prev => ({ ...prev, image: url }));
      setImagePreview(url);
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      alert('Please upload a banner image');
      return;
    }

    // Clean up empty fields
    const cleanedData = {
      ...formData,
      title: formData.title.trim() || undefined,
      subtitle: formData.subtitle.trim() || undefined,
      description: formData.description.trim() || undefined,
      link: formData.link.trim() || undefined,
      linkText: formData.linkText.trim() || 'Shop Now',
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
    };

    onSave(cleanedData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-6 flex items-center justify-between border-b border-purple-200 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {banner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              <p className="text-purple-100 text-sm font-medium">
                {banner ? 'Update banner details' : 'Add a new promotional banner'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-bold mb-1">Quick Setup Available!</p>
              <p>Upload just an image for a simple banner, or add text, buttons, and styling for a rich promotional banner.</p>
            </div>
          </div>

          {/* Banner Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
              Banner Image *
              <span className="text-xs font-normal text-gray-500 ml-2">(1920x600px recommended)</span>
            </label>
            
            {imagePreview ? (
              <div className="relative group">
                <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-gray-200">
                  <Image
                  src={imagePreview}
                  alt="Banner preview"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                  className="object-cover"
                />
                                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setFormData(prev => ({ ...prev, image: '' }));
                  }}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="banner-image-upload"
                  disabled={imageUploading}
                />
                <label
                  htmlFor="banner-image-upload"
                  className="cursor-pointer flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-400 transition-colors bg-gradient-to-br from-gray-50 to-purple-50"
                >
                  {imageUploading ? (
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-sm font-bold text-gray-900">Upload Banner Image</p>
                      <p className="text-xs text-gray-500">Recommended: 1920x600px (16:5 ratio)</p>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Toggle Advanced Options */}
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-900">
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Options (Optional)
                </span>
              </div>
              <div className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-6 animate-slide-down">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
                    placeholder="e.g., Summer Sale 2024"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
                    placeholder="e.g., Up to 50% Off"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium resize-none text-gray-900"
                    rows={3}
                    placeholder="Additional details about the banner..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    Link URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
                    placeholder="https://example.com/sale"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    Button Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.linkText}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkText: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
                    placeholder="Shop Now"
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-600" />
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-16 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <Type className="w-4 h-4 text-purple-600" />
                    Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-16 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4 text-purple-600" />
                    Button Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.buttonColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonColor: e.target.value }))}
                      className="w-16 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.buttonColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonColor: e.target.value }))}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors font-medium text-gray-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-6 h-6 rounded-lg border-2 border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-sm font-bold text-gray-900 cursor-pointer">
              Banner is Active
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || imageUploading || !formData.image}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span>{banner ? 'Update Banner' : 'Create Banner'}</span>
              )}
            </button>
          </div>
        </form>

        <style jsx>{`
          @keyframes slide-down {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-slide-down {
            animation: slide-down 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}