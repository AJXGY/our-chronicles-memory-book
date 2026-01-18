import React, { useState } from 'react';
import { Memory } from '../types';
import { MapPin, Tag, Sparkles, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';

interface MemoryCardProps {
  memory: Memory;
  onUpdate?: (memory: Memory) => void;
  onDelete?: (id: string) => void;
}

const moodConfig = {
  happy: { emoji: '😊', color: 'from-yellow-400 to-orange-400', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  romantic: { emoji: '💕', color: 'from-pink-400 to-rose-400', bg: 'bg-pink-50', border: 'border-pink-200' },
  adventure: { emoji: '🏔️', color: 'from-blue-400 to-cyan-400', bg: 'bg-blue-50', border: 'border-blue-200' },
  cozy: { emoji: '☕', color: 'from-amber-400 to-orange-400', bg: 'bg-amber-50', border: 'border-amber-200' },
};

const tagColors = [
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-orange-100 text-orange-700 border-orange-200',
];

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onUpdate, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullNarrative, setShowFullNarrative] = useState(false);
  
  const images = memory.images || (memory.imageUrl ? [memory.imageUrl] : []);
  const mood = memory.mood ? moodConfig[memory.mood] : null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${mood ? mood.border : 'border-slate-100'} group`}>
      {/* Header */}
      <div className={`p-4 ${mood ? mood.bg : 'bg-slate-50'} border-b ${mood ? mood.border : 'border-slate-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">{memory.date}</span>
            {memory.location && (
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="w-4 h-4" />
                <span>{memory.location}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {mood && <span className="text-2xl">{mood.emoji}</span>}
            {/* Edit/Delete Buttons */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onUpdate && (
                <button
                  onClick={() => onUpdate(memory)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    if (confirm('确定要删除这条回忆吗？')) {
                      onDelete(memory.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Carousel */}
      {images.length > 0 && (
        <div className="relative aspect-video bg-slate-100">
          <img 
            src={images[currentImageIndex]} 
            alt={memory.title}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-3">{memory.title}</h3>
        <p className="text-slate-600 leading-relaxed mb-4">{memory.description}</p>

        {/* Tags */}
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {memory.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                  tagColors[index % tagColors.length]
                }`}
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* AI Narrative */}
        {memory.aiNarrative && (
          <div className={`mt-4 p-4 rounded-xl bg-gradient-to-br ${mood ? mood.color : 'from-slate-100 to-slate-200'} bg-opacity-10 border ${mood ? mood.border : 'border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-slate-700">AI 时光叙述</span>
            </div>
            <div className={`text-sm text-slate-600 leading-relaxed ${!showFullNarrative && 'line-clamp-3'}`}>
              {memory.aiNarrative}
            </div>
            {memory.aiNarrative.length > 100 && (
              <button
                onClick={() => setShowFullNarrative(!showFullNarrative)}
                className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                {showFullNarrative ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    收起
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    展开全文
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
