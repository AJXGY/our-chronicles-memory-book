import React, { useRef, useState } from 'react';
import { Snack } from '../types';
import { Upload, Trash2, Star, Utensils, MessageSquareQuote, Edit2, Download, X, Save } from 'lucide-react';
import { downloadImage, generateFilename } from '../utils';

interface SnackWallProps {
  snacks: Snack[];
  onAddSnack: (snack: Snack) => void;
  onUpdateSnack?: (snack: Snack) => void;
  onDeleteSnack: (id: string) => void;
}

export const SnackWall: React.FC<SnackWallProps> = ({ snacks, onAddSnack, onUpdateSnack, onDeleteSnack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [snackName, setSnackName] = useState('');
  const [snackNote, setSnackNote] = useState('');
  const [rating, setRating] = useState(5);
  const [editingSnack, setEditingSnack] = useState<Snack | null>(null);
  const [editForm, setEditForm] = useState({ name: '', note: '', rating: 5 });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
         const canvas = document.createElement('canvas');
         const ctx = canvas.getContext('2d');
         // Aggressive compression for snacks
         const maxWidth = 600; 
         const scale = Math.min(maxWidth / img.width, 1);
         canvas.width = img.width * scale;
         canvas.height = img.height * scale;
         ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
         setTempImage(canvas.toDataURL('image/jpeg', 0.6));
         setShowModal(true);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmAdd = () => {
    if(!tempImage) return;
    onAddSnack({
      id: Date.now().toString(),
      imageUrl: tempImage,
      date: new Date().toISOString(),
      name: snackName || '未知美味',
      rating: rating,
      note: snackNote
    });
    setShowModal(false);
    setTempImage(null);
    setSnackName('');
    setSnackNote('');
    setRating(5);
  };

  const handleEdit = (snack: Snack) => {
    setEditingSnack(snack);
    setEditForm({
      name: snack.name,
      note: snack.note || '',
      rating: snack.rating
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingSnack || !onUpdateSnack) return;
    onUpdateSnack({
      ...editingSnack,
      name: editForm.name,
      note: editForm.note,
      rating: editForm.rating
    });
    setShowEditModal(false);
    setEditingSnack(null);
  };

  const handleDownload = (snack: Snack) => {
    const filename = generateFilename(`snack_${snack.name}`, snack.date);
    downloadImage(snack.imageUrl, filename);
  };

  return (
    <div className="p-6 md:p-12 pb-24 max-w-5xl mx-auto space-y-8 animate-fadeIn">
       <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-slate-900 flex items-center justify-center gap-3">
          <Utensils className="w-8 h-8 text-orange-400" />
          吃货零食墙
        </h2>
        <p className="text-slate-500 mt-2">只有爱和美食不可辜负</p>
      </div>

      <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 border-dashed flex flex-col items-center justify-center text-center hover:bg-orange-50 transition-colors cursor-pointer mb-8"
           onClick={() => fileInputRef.current?.click()}>
         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
         <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-orange-400">
           <Upload className="w-6 h-6" />
         </div>
         <h4 className="font-bold text-orange-800">晒晒好吃的</h4>
         <p className="text-xs text-orange-400 mt-1">上传照片并写下评价</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {snacks.map(snack => (
          <div key={snack.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 group flex flex-col">
             <div className="aspect-square relative overflow-hidden bg-slate-100">
                <img src={snack.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={snack.name} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(snack); }}
                    className="p-1.5 bg-white/20 backdrop-blur rounded-full text-white hover:bg-blue-500 transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDownload(snack); }}
                    className="p-1.5 bg-white/20 backdrop-blur rounded-full text-white hover:bg-green-500 transition-colors"
                    title="下载"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('删除这个零食?')) onDeleteSnack(snack.id); }}
                    className="p-1.5 bg-white/20 backdrop-blur rounded-full text-white hover:bg-red-500 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
             </div>
             <div className="p-3 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-slate-800 text-sm truncate flex-1">{snack.name}</h4>
                </div>
                <div className="flex text-yellow-400 gap-0.5 mb-2">
                   {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < snack.rating ? 'fill-current' : 'text-slate-200'}`} />
                   ))}
                </div>
                
                {snack.note && (
                  <div className="bg-orange-50 p-2 rounded-lg mb-2 mt-auto">
                    <p className="text-xs text-orange-800 line-clamp-2">"{snack.note}"</p>
                  </div>
                )}
                
                <p className="text-[10px] text-slate-400 mt-auto text-right border-t border-slate-50 pt-2">
                  {new Date(snack.date).toLocaleDateString('zh-CN')}
                </p>
             </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fadeInUp shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-orange-900">这个好吃吗？</h3>
            {tempImage && <img src={tempImage} className="w-full h-40 object-cover rounded-xl mb-4 shadow-sm" />}
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">零食/菜名</label>
                <input 
                  value={snackName} 
                  onChange={e => setSnackName(e.target.value)} 
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                  placeholder="例如：超级好吃的薯片"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">评价/备注</label>
                <textarea 
                  value={snackNote} 
                  onChange={e => setSnackNote(e.target.value)} 
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm h-16 resize-none"
                  placeholder="味道怎么样？在哪里买的？"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">打个分 (1-5)</label>
                <div className="flex gap-2">
                   {[1,2,3,4,5].map(star => (
                     <button key={star} onClick={() => setRating(star)} className={`transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}>
                       <Star className="w-6 h-6 fill-current" />
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-medium">取消</button>
              <button onClick={confirmAdd} className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium shadow-md shadow-orange-200">上菜！</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSnack && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-fadeInUp shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-orange-900">编辑零食</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={editingSnack.imageUrl} className="w-full h-40 object-cover rounded-xl mb-4 shadow-sm" alt={editingSnack.name} />
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">零食/菜名</label>
                <input 
                  value={editForm.name} 
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })} 
                  className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">评价/备注</label>
                <textarea 
                  value={editForm.note} 
                  onChange={e => setEditForm({ ...editForm, note: e.target.value })} 
                  className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none text-sm h-16 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">打个分 (1-5)</label>
                <div className="flex gap-2">
                   {[1,2,3,4,5].map(star => (
                     <button 
                       key={star} 
                       onClick={() => setEditForm({ ...editForm, rating: star })} 
                       className={`transition-transform hover:scale-110 ${editForm.rating >= star ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
                     >
                       <Star className="w-6 h-6 fill-current" />
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveEdit}
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium shadow-md shadow-orange-200 mt-6 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
};