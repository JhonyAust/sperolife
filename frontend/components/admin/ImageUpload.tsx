import { useState } from 'react';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  onUpload: (file: File) => Promise<string>;
}

export default function ImageUpload({ images, onChange, maxImages = 5, onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [dragActive, setDragActive] = useState(false);

  // Utility function to ensure URL uses HTTPS
  const ensureHttps = (url: string): string => {
    if (!url) return url;
    
    // If URL starts with http://, replace with https://
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    
    // If URL doesn't have a protocol, add https://
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      // Check if it looks like a URL (has domain pattern)
      if (url.includes('.') && !url.startsWith('data:')) {
        return `https://${url}`;
      }
    }
    
    return url;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const fileId = `${Date.now()}-${i}`;
      
      try {
        setUploadProgress(prev => ({ ...prev, [fileId]: 30 }));
        const url = await onUpload(file);
        
        // Ensure the uploaded URL uses HTTPS
        const secureUrl = ensureHttps(url);
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        uploadedUrls.push(secureUrl);
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    // Combine existing images with new uploads, ensuring all URLs are HTTPS
    const allImages = [...images.map(ensureHttps), ...uploadedUrls];
    onChange(allImages);
    
    setUploading(false);
    setUploadProgress({});
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange(newImages);
  };

  // Ensure all displayed images use HTTPS
  const secureImages = images.map(ensureHttps);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          dragActive
            ? 'border-purple-500 bg-purple-50 scale-[1.02]'
            : 'border-gray-300 hover:border-purple-400 bg-gradient-to-br from-gray-50 to-white'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          id="image-upload"
          disabled={uploading || images.length >= maxImages}
        />
        
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          {uploading ? (
            <div className="text-center space-y-3">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-gray-700">Uploading images...</p>
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Object.values(uploadProgress)[0] || 0}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-2xl flex items-center justify-center mb-4 transform hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-purple-600" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">
                Upload Product Images
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Drag & drop images here or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Maximum {maxImages} images • {images.length}/{maxImages} uploaded
              </p>
            </>
          )}
        </label>

        {images.length >= maxImages && !uploading && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            Maximum reached
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {secureImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900">Uploaded Images</h4>
            <span className="text-xs text-gray-500">{secureImages.length} image{secureImages.length !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {secureImages.map((img, idx) => (
              <div
                key={idx}
                className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', idx.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  reorderImages(fromIndex, idx);
                }}
              >
                <Image
                  src={img}
                  alt={`Product ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                
                {/* Primary Badge */}
                {idx === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs font-bold rounded-full shadow-lg">
                    Primary
                  </div>
                )}

                {/* HTTPS Indicator */}
                {img.startsWith('https://') && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-green-500/90 text-white text-[10px] font-semibold rounded">
                    🔒 Secure
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1.5 z-50 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Drag Indicator */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full">
                    Drag to reorder
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Image Tips:</p>
            <ul className="space-y-1 text-xs text-blue-800">
              <li>• First image will be used as the primary product image</li>
              <li>• All URLs are automatically secured with HTTPS protocol</li>
              <li>• Recommended size: 1000x1000px for best quality</li>
              <li>• Supported formats: JPG, PNG, WebP</li>
              <li>• Drag images to reorder them</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}