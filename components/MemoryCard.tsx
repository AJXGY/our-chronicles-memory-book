import React, { useState } from 'react';
import { Memory } from '../types';
import { generateNarrative } from '../services/zhipuService';
import { Sparkles, MapPin, Calendar, Heart, Share2, Loader2, Edit2, Trash2, Check, X, Download } from 'lucide-react';
import { downloadImage, generateFilename } from '../utils';

interface MemoryCardProps {
  memory: Memory;
  onUpdate: (updatedMemory: Memory) => void;
  onDelete: (id: string) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onUpdate, onDelete }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(memory);

  const handleMagicNarrate = async () => {
    if (memory.aiNarrative) return; 
    
    setIsGenerating(true);
    try {
      const narrative = await generateNarrative(memory);
      onUpdate({ ...memory, aiNarrative: narrative });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveEdit = () => {
    onUpdate(editForm);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditForm(memory);
    setIsEditing(false);
  };

  const handleDownload = () => {
    const filename = generateFilename(`memory_${memory.title}`, memory.date);
    downloadImage(memory.imageUrl, filename);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-rose-200">
        <h3 className="font-bold text-slate-800 mb-4">编辑这一页</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">标题</label>
            <input 
              type="text" 
              value={editForm.title} 
              onChange={e => setEditForm({...editForm, title: e.target.value})}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">日期</label>
              <input 
                type="date" 
                value={editForm.date} 
                onChange={e => setEditForm({...editForm, date: e.target.value})}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:outline-none"
              />
             </div>
             <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">地点</label>
              <input 
                type="text" 
                value={editForm.location} 
                onChange={e => setEditForm({...editForm, location: e.target.value})}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:outline-none"
              />
             </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">图片链接</label>
            <input 
              type="text" 
              value={editForm.imageUrl} 
              onChange={e => setEditForm({...editForm, imageUrl: e.target.value})}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">描述</label>
            <textarea 
              value={editForm.description} 
              onChange={e => setEditForm({...editForm, description: e.target.value})}
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:outline-none h-24"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={cancelEdit} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <button onClick={saveEdit} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center gap-2">
              <Check className="w-4 h-4" /> 保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-rose-100 print:shadow-none print:border-slate-200 print:break-inside"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit/Delete Controls - Hidden when printing */}
      <div className={`absolute top-4 right-4 z-20 flex gap-2 transition-opacity duration-300 no-print ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={() => setIsEditing(true)}
          className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-slate-600 hover:text-rose-600"
          title="编辑"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => { if(window.confirm('确定要删除这页回忆吗？')) onDelete(memory.id) }}
          className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-slate-600 hover:text-red-600"
          title="删除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={memory.imageUrl} 
          alt={memory.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 print:grayscale-[20%]"
        />
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-rose-700 flex items-center gap-1 shadow-sm no-print">
          <Calendar className="w-3 h-3" />
          {new Date(memory.date).toLocaleDateString('zh-CN')}
        </div>
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-slate-700 flex items-center gap-1 shadow-sm no-print">
          <MapPin className="w-3 h-3" />
          {memory.location}
        </div>
        {/* Download button */}
        <button
          onClick={handleDownload}
          className={`absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-slate-600 hover:text-green-600 transition-opacity duration-300 no-print ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          title="下载照片"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-serif font-bold text-slate-900">{memory.title}</h3>
            {/* Print only date/location info */}
            <div className="hidden print:block text-xs text-slate-500 text-right">
                <p>{new Date(memory.date).toLocaleDateString('zh-CN')}</p>
                <p>{memory.location}</p>
            </div>
        </div>
        
        {/* Manual Description */}
        <p className="text-slate-600 mb-4 text-sm leading-relaxed border-l-2 border-rose-200 pl-3">
          {memory.description}
        </p>

        {/* AI Narrative Section */}
        <div className={`mt-4 p-4 rounded-xl transition-all duration-500 ${memory.aiNarrative ? 'bg-rose-50' : 'bg-slate-50'} print:bg-transparent print:border print:border-slate-100`}>
          {memory.aiNarrative ? (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-2 mb-2 text-rose-600 no-print">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI 旁白</span>
              </div>
              <p className="font-serif italic text-rose-900 text-sm leading-relaxed">
                "{memory.aiNarrative}"
              </p>
            </div>
          ) : (
            <button
              onClick={handleMagicNarrate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors no-print"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  灵感生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  生成情感旁白
                </>
              )}
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between no-print">
          <div className="flex gap-2">
            {memory.tags.map(tag => (
              <span key={tag} className="text-[10px] uppercase tracking-wide px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex gap-3 text-slate-400">
            <button className="hover:text-rose-500 transition-colors"><Heart className="w-5 h-5" /></button>
            <button className="hover:text-blue-500 transition-colors"><Share2 className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
