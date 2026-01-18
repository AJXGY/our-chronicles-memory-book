import React, { useRef } from 'react';
import { AppView } from '../types';
import { Book, BarChart2, MessageCircle, MapPin, Menu, Sprout, Utensils, Gift, ListChecks, Download, Upload, Share2, Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface LayoutProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime?: string;
  onManualSync?: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onViewChange, onExportData, onImportData, syncStatus = 'idle', lastSyncTime, onManualSync, children }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: AppView.TIMELINE, label: '时光书', icon: Book },
    { id: AppView.TODO_LIST, label: '恋爱清单', icon: ListChecks },
    { id: AppView.FLOWER_WALL, label: '鲜花墙', icon: Sprout },
    { id: AppView.SNACK_WALL, label: '零食墙', icon: Utensils },
    { id: AppView.MAP, label: '旅行打卡', icon: MapPin },
    { id: AppView.ANNIVERSARY, label: '纪念日', icon: Gift },
    { id: AppView.SOCIAL_MEDIA, label: '社交平台', icon: Share2 },
    { id: AppView.DASHBOARD, label: '情感数据', icon: BarChart2 },
    { id: AppView.CHAT, label: '时空对话', icon: MessageCircle },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
    }
    // Reset input
    if (e.target) e.target.value = '';
  };

  return (
    <div className="flex h-screen bg-rose-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-rose-100 shadow-sm z-10 print:hidden">
        <div className="p-8 border-b border-rose-100">
          <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            欧欧小储
          </h1>
          <p className="text-xs text-rose-500 mt-2 font-medium">2025.1.19～forever~</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive 
                    ? 'bg-rose-50 text-rose-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-rose-500' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-rose-100 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-2">数据备份</div>
          <button 
            onClick={onExportData}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-rose-600 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            导出数据 (JSON)
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-rose-600 transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            导入备份
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
        </div>
        
        {/* Sync Status Indicator */}
        <div className="p-4 border-t border-rose-100">
          <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-2">云端同步</div>
          <div className="px-2 py-2 rounded-lg bg-slate-50">
            <div className="flex items-center gap-2 text-xs">
              {syncStatus === 'syncing' && (
                <>
                  <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                  <span className="text-blue-600">同步中...</span>
                </>
              )}
              {syncStatus === 'success' && (
                <>
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">已同步</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">同步失败</span>
                </>
              )}
              {syncStatus === 'idle' && (
                <>
                  <Cloud className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-500">待同步</span>
                </>
              )}
            </div>
            {lastSyncTime && (
              <div className="text-[10px] text-slate-400 mt-1">
                上次: {lastSyncTime}
              </div>
            )}
            {onManualSync && (
              <button
                onClick={onManualSync}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors text-xs border border-slate-200"
              >
                <RefreshCw className="w-3 h-3" />
                手动同步
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-rose-100 z-20 flex items-center justify-between px-4 print:hidden">
        <span className="font-serif font-bold text-lg text-slate-900">我们的时光书</span>
        <div className="flex gap-2">
          {/* Mobile Export Button */}
          <button onClick={onExportData} className="p-2 text-slate-500 hover:text-rose-600">
             <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto no-scrollbar pt-20 md:pt-0">
          {children}
        </div>
        
        {/* Mobile Tab Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-2 pb-safe z-20 print:hidden overflow-x-auto">
          {navItems.map((item) => {
             const Icon = item.icon;
             const isActive = currentView === item.id;
             return (
               <button
                 key={item.id}
                 onClick={() => onViewChange(item.id)}
                 className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px] ${isActive ? 'text-rose-600' : 'text-slate-400'}`}
               >
                 <Icon className="w-5 h-5" />
                 <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
               </button>
             );
          })}
        </div>
      </main>
    </div>
  );
};