import React, { useState, useRef } from 'react';
import { CityVisit } from '../types';
import { MapPin, Plus, Trash2, Camera, Edit2, X, Save, Upload, Download } from 'lucide-react';
import { downloadImage, generateFilename } from '../utils';

interface TravelLogProps {
  visits: CityVisit[];
  onAddVisit: (visit: CityVisit) => void;
  onUpdateVisit?: (visit: CityVisit) => void;
  onDeleteVisit: (id: string) => void;
}

export const TravelLog: React.FC<TravelLogProps> = ({ visits, onAddVisit, onUpdateVisit, onDeleteVisit }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ city: '', date: '', notes: '', imageUrl: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
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
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAdd = () => {
    if (!formData.city || !formData.date) return;
    onAddVisit({
      id: Date.now().toString(),
      city: formData.city,
      date: formData.date,
      notes: formData.notes || '打卡成功！',
      imageUrl: tempImage || undefined
    });
    setFormData({ city: '', date: '', notes: '', imageUrl: '' });
    setTempImage(null);
    setIsAdding(false);
  };

  const handleEdit = (visit: CityVisit) => {
    setEditingId(visit.id);
    setFormData({
      city: visit.city,
      date: visit.date,
      notes: visit.notes,
      imageUrl: visit.imageUrl || ''
    });
    setTempImage(visit.imageUrl || null);
  };

  const handleSaveEdit = () => {
    if (!editingId || !onUpdateVisit) return;
    const visit = visits.find(v => v.id === editingId);
    if (!visit) return;
    
    onUpdateVisit({
      ...visit,
      city: formData.city,
      date: formData.date,
      notes: formData.notes,
      imageUrl: tempImage || undefined
    });
    setEditingId(null);
    setFormData({ city: '', date: '', notes: '', imageUrl: '' });
    setTempImage(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ city: '', date: '', notes: '', imageUrl: '' });
    setTempImage(null);
  };

  const handleDownload = (visit: CityVisit) => {
    if (visit.imageUrl) {
      const filename = generateFilename(`travel_${visit.city}`, visit.date);
      downloadImage(visit.imageUrl, filename);
    }
  };

  return (
    <div className="p-6 md:p-12 pb-24 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-slate-900 flex items-center justify-center gap-3">
          <MapPin className="w-8 h-8 text-blue-500" />
          旅行足迹
        </h2>
        <p className="text-slate-500 mt-2">世界那么大，我想和你去看看</p>
      </div>

      <div className="relative border-l-2 border-blue-100 ml-4 md:ml-0 md:pl-8 space-y-8">
        <div className="absolute top-0 bottom-0 left-[-1px] md:left-0 w-0.5 bg-blue-100"></div>
        
        {/* Add Button */}
        <div className="relative pl-6 md:pl-0">
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 text-blue-500 font-medium hover:text-blue-600 transition-colors bg-white z-10 relative"
          >
            <div className="w-3 h-3 bg-blue-500 rounded-full md:absolute md:left-[-6px] md:top-1.5 shadow-[0_0_0_4px_white]"></div>
            <Plus className="w-4 h-4" /> 记录新城市
          </button>
          
          {isAdding && (
             <div className="mt-4 bg-white p-4 rounded-xl shadow-lg border border-blue-100 animate-fadeInUp max-w-md">
                <input 
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="城市名称 (如: 苏州)"
                  className="w-full mb-3 p-2 border rounded-lg text-sm"
                />
                <input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full mb-3 p-2 border rounded-lg text-sm"
                />
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="备注..."
                  className="w-full mb-3 p-2 border rounded-lg text-sm h-16 resize-none"
                />
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mb-3 py-2 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  {tempImage ? '已选择照片' : '上传照片（可选）'}
                </button>
                {tempImage && <img src={tempImage} className="w-full h-32 object-cover rounded-lg mb-3" alt="Preview" />}
                <button onClick={handleAdd} className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm">确认打卡</button>
             </div>
          )}
        </div>

        {visits.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(visit => (
          <div key={visit.id} className="relative pl-6 md:pl-0 group">
             {/* Dot */}
             <div className="absolute left-[-5px] top-1.5 w-3 h-3 bg-white border-2 border-blue-300 rounded-full md:left-[-6px] z-10 group-hover:border-blue-500 transition-colors"></div>
             
             {editingId === visit.id ? (
               <div className="bg-white p-5 rounded-2xl shadow-lg border border-blue-200 animate-fadeInUp">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg">编辑足迹</h3>
                   <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600">
                     <X className="w-5 h-5" />
                   </button>
                 </div>
                 <input 
                   value={formData.city}
                   onChange={e => setFormData({ ...formData, city: e.target.value })}
                   className="w-full mb-3 p-2 border rounded-lg text-sm"
                 />
                 <input 
                   type="date"
                   value={formData.date}
                   onChange={e => setFormData({ ...formData, date: e.target.value })}
                   className="w-full mb-3 p-2 border rounded-lg text-sm"
                 />
                 <textarea
                   value={formData.notes}
                   onChange={e => setFormData({ ...formData, notes: e.target.value })}
                   className="w-full mb-3 p-2 border rounded-lg text-sm h-16 resize-none"
                 />
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full mb-3 py-2 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 text-sm"
                 >
                   <Upload className="w-4 h-4" />
                   {tempImage ? '更换照片' : '上传照片'}
                 </button>
                 {tempImage && <img src={tempImage} className="w-full h-32 object-cover rounded-lg mb-3" alt="Preview" />}
                 <button 
                   onClick={handleSaveEdit}
                   className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                 >
                   <Save className="w-4 h-4" />
                   保存
                 </button>
               </div>
             ) : (
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                       <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                         {visit.city}
                         <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{visit.date}</span>
                       </h3>
                       <p className="text-slate-500 text-sm mt-1">{visit.notes}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => handleEdit(visit)}
                         className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                         title="编辑"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       {visit.imageUrl && (
                         <button 
                           onClick={() => handleDownload(visit)}
                           className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                           title="下载照片"
                         >
                           <Download className="w-4 h-4" />
                         </button>
                       )}
                       <button 
                         onClick={() => { if(confirm('删除这个足迹？')) onDeleteVisit(visit.id) }} 
                         className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                         title="删除"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                  {visit.imageUrl ? (
                    <img src={visit.imageUrl} className="w-full h-48 object-cover rounded-lg mt-3" alt={visit.city} />
                  ) : (
                    <div className="w-full h-32 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 mt-3">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
               </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};