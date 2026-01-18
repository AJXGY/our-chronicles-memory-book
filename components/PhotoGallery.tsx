import React, { useState, useRef } from 'react';
import { Photo } from '../types';
import { Camera, Upload, Trash2, X, ZoomIn, Loader2 } from 'lucide-react';
import { handleImageUpload, compressImageDataUrl } from '../utils';

interface PhotoGalleryProps {
  photos: Photo[];
  onAddPhoto: (photo: Photo) => void;
  onDeletePhoto: (id: string) => void;
}

type Category = 'ccd' | 'camera' | 'phone' | 'pocket3';

const categories: { id: Category; label: string; color: string; emoji: string }[] = [
  { id: 'ccd', label: 'CCD', color: 'purple', emoji: '🎨' },
  { id: 'camera', label: '相机', color: 'blue', emoji: '📷' },
  { id: 'phone', label: '手机', color: 'green', emoji: '📱' },
  { id: 'pocket3', label: 'Pocket3', color: 'orange', emoji: '🎥' },
];

const colorClasses = {
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    hover: 'hover:bg-purple-100',
    active: 'bg-purple-500 text-white',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-100',
    active: 'bg-blue-500 text-white',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-600',
    hover: 'hover:bg-green-100',
    active: 'bg-green-500 text-white',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    hover: 'hover:bg-orange-100',
    active: 'bg-orange-500 text-white',
  },
};

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onAddPhoto, onDeletePhoto }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('ccd');
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPhotos = photos.filter(p => p.category === activeCategory);
  const activeColor = categories.find(c => c.id === activeCategory)?.color || 'purple';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      try {
        const base64 = await handleImageUpload(files[i]);
        // Compress image to avoid large file sizes
        const compressed = await compressImageDataUrl(base64, { maxWidth: 1200, quality: 0.8 });
        const photo: Photo = {
          id: Date.now().toString() + i,
          imageUrl: compressed,
          category: activeCategory,
          date: new Date().toISOString(),
        };
        onAddPhoto(photo);
        successCount++;
      } catch (error) {
        console.error('图片上传失败:', error);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    if (successCount > 0) {
      alert(`✅ 成功上传 ${successCount} 张照片！`);
    } else {
      alert('❌ 上传失败，请重试');
    }
  };

  return (
    <div className="p-6 md:p-12 pb-24 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-slate-900 flex items-center justify-center gap-3">
          <Camera className="w-8 h-8 text-rose-500" />
          美丽欧欧
        </h2>
        <p className="text-slate-500 mt-2">记录每一个美好瞬间</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {categories.map(cat => {
          const colors = colorClasses[cat.color as keyof typeof colorClasses];
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
                isActive
                  ? colors.active
                  : `${colors.bg} ${colors.border} ${colors.text} ${colors.hover}`
              }`}
            >
              <span className="mr-2">{cat.emoji}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Upload Button */}
      <div className="mb-8 flex justify-center">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,.heic,.heif"
          onChange={handleFileSelect}
          multiple
          disabled={isUploading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            colorClasses[activeColor as keyof typeof colorClasses].active
          } hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              上传照片（支持多选）
            </>
          )}
        </button>
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-20">
          <Camera className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400">还没有照片，快来上传吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map(photo => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
            >
              <img
                src={photo.imageUrl}
                alt="Photo"
                className="w-full h-full object-cover"
                onClick={() => setViewingPhoto(photo)}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setViewingPhoto(photo)}
                  className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                  title="查看大图"
                >
                  <ZoomIn className="w-5 h-5 text-slate-700" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('确定要删除这张照片吗？')) {
                      onDeletePhoto(photo.id);
                    }
                  }}
                  className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Viewer Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <button
            onClick={() => setViewingPhoto(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={viewingPhoto.imageUrl}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
