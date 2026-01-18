import React, { useState, useRef } from 'react';
import { CityVisit } from '../types';
import { MapPin, Plus, Trash2, Camera, Edit2, X, Save, Upload, Download } from 'lucide-react';
import { downloadImage, generateFilename, handleImageUpload } from '../utils';

interface TravelLogProps {
  visits: CityVisit[];
  onAddVisit: (visit: CityVisit) => void;
  onUpdateVisit?: (visit: CityVisit) => void;
  onDeleteVisit: (id: string) => void;
}

export const TravelLog: React.FC<TravelLogProps> = ({ visits, onAddVisit, onUpdateVisit, onDeleteVisit }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ city: '', date: '', notes: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImages, setTempImages] = useState<string[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const promises: Promise<string>[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const promise = new Promise<string>(async (resolve, reject) => {
        try {
          const base64 = await handleImageUpload(files[i]);
          // Compress image
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 800;
            const scale = Math.min(maxWidth / img.width, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = () => reject(new Error('图片加载失败'));
          img.src = base64;
        } catch (error) {
          reject(error);
        }
      });
      promises.push(promise);
    }

    try {
      const compressedImages = await Promise.all(promises);
      setTempImages(prev => [...prev, ...compressedImages]);
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('部分图片上传失败，请重试');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setTempImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    if (!formData.city || !formData.date) return;
    onAddVisit({
      id: Date.now().toString(),
      city: formData.city,
      date: formData.date,
      notes: formData.notes || '打卡成功！',
      images: tempImages.length > 0 ? tempImages : undefined,
      imageUrl: tempImages[0] || undefined // Backward compatibility
    });
    setFormData({ city: '', date: '', notes: '' });
    setTempImages([]);
    setIsAdding(false);
  };

  const handleEdit = (visit: CityVisit) => {
    setEditingId(visit.id);
    setFormData({
      city: visit.city,
      date: visit.date,
      notes: visit.notes
    });
    // Load existing images
    const existingImages = visit.images || (visit.imageUrl ? [visit.imageUrl] : []);
    setTempImages(existingImages);
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
      images: tempImages.length > 0 ? tempImages : undefined,
      imageUrl: tempImages[0] || undefined // Backward compatibility
    });
    setEditingId(null);
    setFormData({ city: '', date: '', notes: '' });
    setTempImages([]);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ city: '', date: '', notes: '' });
    setTempImages([]);
  };

  const handleDownloadAll = (visit: CityVisit) => {
    const images = visit.images || (visit.imageUrl ? [visit.imageUrl] : []);
    images.forEach((img, index) => {
      const filename = generateFilename(`travel_${visit.city}_${index + 1}`, visit.date);
      downloadImage(img, filename);
    });
  };

  const getVisitImages = (visit: CityVisit): string[] => {
    return visit.images || (visit.imageUrl ? [visit.imageUrl] : []);
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
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,.heic,.heif" 
                  onChange={handleFileSelect}
                  multiple
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mb-3 py-2 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  {tempImages.length > 0 ? `已选择 ${tempImages.length} 张照片` : '上传照片（可多选）'}
                </button>
                
                {/* Image Preview Grid */}
                {tempImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {tempImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img src={img} className="w-full h-20 object-cover rounded-lg" alt={`Preview ${index + 1}`} />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <button onClick={handleAdd} className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm">确认打卡</button>
             </div>
          )}
        </div>

        {visits.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(visit => {
          const visitImages = getVisitImages(visit);
          
          return (
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
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*,.heic,.heif" 
                   onChange={handleFileSelect}
                   multiple
                 />
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full mb-3 py-2 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 text-sm"
                 >
                   <Upload className="w-4 h-4" />
                   {tempImages.length > 0 ? `已选择 ${tempImages.length} 张照片` : '上传照片（可多选）'}
                 </button>
                 
                 {/* Image Preview Grid */}
                 {tempImages.length > 0 && (
                   <div className="grid grid-cols-3 gap-2 mb-3">
                     {tempImages.map((img, index) => (
                       <div key={index} className="relative group">
                         <img src={img} className="w-full h-20 object-cover rounded-lg" alt={`Preview ${index + 1}`} />
                         <button
                           onClick={() => handleRemoveImage(index)}
                           className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <X className="w-3 h-3" />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
                 
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
                       {visitImages.length > 0 && (
                         <button 
                           onClick={() => handleDownloadAll(visit)}
                           className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                           title="下载所有照片"
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
                  
                  {/* Image Gallery */}
                  {visitImages.length > 0 ? (
                    <div className={`grid gap-2 mt-3 ${
                      visitImages.length === 1 ? 'grid-cols-1' :
                      visitImages.length === 2 ? 'grid-cols-2' :
                      'grid-cols-3'
                    }`}>
                      {visitImages.map((img, index) => (
                        <img 
                          key={index}
                          src={img} 
                          className={`w-full object-cover rounded-lg ${
                            visitImages.length === 1 ? 'h-64' : 'h-32'
                          }`}
                          alt={`${visit.city} ${index + 1}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 mt-3">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
               </div>
             )}
          </div>
        )})}
      </div>
    </div>
  );
};