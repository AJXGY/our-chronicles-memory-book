import React, { useState, useRef } from 'react';
import { Flower } from '../types';
import { Upload, Trash2, Sprout, MessageCircle, Edit2, Download, X, Save } from 'lucide-react';
import { downloadImage, generateFilename, handleImageUpload } from '../utils';

interface FlowerWallProps {
  flowers: Flower[];
  onAddFlower: (flower: Flower) => void;
  onUpdateFlower?: (flower: Flower) => void;
  onDeleteFlower: (id: string) => void;
}

export const FlowerWall: React.FC<FlowerWallProps> = ({
  flowers,
  onAddFlower,
  onUpdateFlower,
  onDeleteFlower,
}) => {
  const [noteInput, setNoteInput] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [editingFlower, setEditingFlower] = useState<Flower | null>(null);
  const [editForm, setEditForm] = useState({ note: '', date: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await handleImageUpload(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 800;
        const scale = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setTempImage(canvas.toDataURL('image/jpeg', 0.7));
        setShowUploadModal(true);
      };
      img.src = base64;
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败，请重试');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmUpload = () => {
    if (!tempImage) return;
    onAddFlower({
      id: Date.now().toString(),
      imageUrl: tempImage,
      date: new Date().toISOString(),
      note: noteInput || '送给最爱的你'
    });
    setTempImage(null);
    setNoteInput('');
    setShowUploadModal(false);
  };

  const handleEdit = (flower: Flower) => {
    setEditingFlower(flower);
    setEditForm({
      note: flower.note,
      date: flower.date.split('T')[0]
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingFlower || !onUpdateFlower) return;
    onUpdateFlower({
      ...editingFlower,
      note: editForm.note,
      date: editForm.date
    });
    setShowEditModal(false);
    setEditingFlower(null);
  };

  const handleDownload = (flower: Flower) => {
    const filename = generateFilename('flower', flower.date);
    downloadImage(flower.imageUrl, filename);
  };

  return (
    <div className="p-6 md:p-12 pb-24 max-w-6xl mx-auto space-y-12 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-slate-900 flex items-center justify-center gap-3">
          <Sprout className="w-8 h-8 text-rose-500" />
          我们的鲜花墙
        </h2>
        <p className="text-slate-500 mt-2">每一束花，都是一句"我爱你"</p>
      </div>

      <div className="bg-rose-50/50 p-8 rounded-2xl border border-rose-100 border-dashed flex flex-col items-center justify-center text-center hover:bg-rose-50 transition-colors cursor-pointer group max-w-md mx-auto"
           onClick={() => fileInputRef.current?.click()}>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.heic,.heif" onChange={handleFileSelect} />
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform text-rose-500">
          <Upload className="w-7 h-7" />
        </div>
        <h4 className="font-bold text-rose-800 text-lg">上传新照片</h4>
        <p className="text-rose-400 mt-1">记录收到的每一份惊喜</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {flowers.map(flower => (
          <div key={flower.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-lg transition-shadow">
            <div className="aspect-square relative overflow-hidden bg-slate-100">
                <img src={flower.imageUrl} alt="Flower" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(flower); }}
                    className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-blue-500 transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDownload(flower); }}
                    className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-green-500 transition-colors"
                    title="下载"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('删除这张照片?')) onDeleteFlower(flower.id); }}
                    className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-red-500 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
            </div>
            <div className="p-4 bg-white flex-1 flex flex-col">
              <p className="text-slate-800 text-sm font-medium flex items-start gap-2 flex-1 italic">
                  <MessageCircle className="w-3 h-3 mt-1 text-rose-400 shrink-0" />
                  "{flower.note}"
              </p>
              <div className="pt-3 mt-3 border-t border-slate-50 flex justify-end">
                  <p className="text-xs text-slate-400">{new Date(flower.date).toLocaleDateString('zh-CN')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {flowers.length === 0 && (
        <div className="text-center py-12 text-slate-400">
           <Sprout className="w-12 h-12 mx-auto mb-3 opacity-20" />
           <p>还没有鲜花照片，快去买一束吧！</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fadeInUp shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-slate-800">这一束花的寓意...</h3>
            {tempImage && <img src={tempImage} alt="Preview" className="w-full h-48 object-cover rounded-xl mb-4 shadow-sm" />}
            <label className="block text-sm font-medium text-slate-600 mb-2">写句悄悄话 / 表白：</label>
            <input 
              type="text" 
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="例如：这是我们的一周年..." 
              className="w-full border p-3 rounded-xl mb-6 focus:ring-2 focus:ring-rose-200 outline-none text-sm"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowUploadModal(false)} className="flex-1 py-3 text-slate-500 hover:bg-slate-100 rounded-xl font-medium transition-colors">取消</button>
              <button onClick={confirmUpload} className="flex-1 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-medium transition-colors shadow-lg shadow-rose-200">确认上传</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingFlower && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fadeInUp shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800">编辑鲜花</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={editingFlower.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl mb-4 shadow-sm" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">表白语/备注</label>
                <input 
                  type="text" 
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">日期</label>
                <input 
                  type="date" 
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none text-sm"
                />
              </div>
              <button 
                onClick={handleSaveEdit}
                className="w-full py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-medium transition-colors shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};