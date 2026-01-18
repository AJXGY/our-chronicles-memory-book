import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { MemoryCard } from './components/MemoryCard';
import { Dashboard } from './components/Dashboard';
import { Chatbot } from './components/Chatbot';
import { QuizModal } from './components/QuizModal';
import { FlowerWall } from './components/FlowerWall';
import { SnackWall } from './components/SnackWall';
import { TravelLog } from './components/TravelLog';
import { AnniversaryPage } from './components/AnniversaryPage';
import { SocialMediaPage } from './components/SocialMediaPage';
import { TodoListPage } from './components/TodoListPage';
import { AppView, Memory, Flower, TodoItem, Snack, CityVisit, SpecialDate, SocialPost } from './types';
import { INITIAL_MEMORIES, MOCK_STATS } from './constants';
import { syncService } from './services/syncService';
import type { SyncResult } from './services/syncService';
import { compressImageDataUrl, handleImageUpload } from './utils';
import { Gamepad2, Plus, Printer, X, Save, Cloud, CloudOff, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';

// Storage Keys
const KEYS = {
  MEMORIES: 'chronicles_memories_v2',
  FLOWERS: 'chronicles_flowers_v2',
  TODOS: 'chronicles_todos_v2',
  SNACKS: 'chronicles_snacks_v1',
  CITIES: 'chronicles_cities_v1',
  DATES: 'chronicles_dates_v1',
  SOCIAL_POSTS: 'chronicles_social_posts_v1',
  AUTH: 'chronicles_auth_v1',
  USERNAME: 'chronicles_username_v1',
};

// Login Credentials
const CREDENTIALS = {
  USERNAME: 'CHLJ',
  PASSWORD: '20250119',
};

const MAX_SYNC_SIZE_MB = 45;
const MEMORY_IMAGE_COMPRESS = { maxWidth: 1600, quality: 0.75 };

// Initial Data
const INITIAL_CITIES: CityVisit[] = [
  { id: '1', city: '泰山', date: '2023-05-01', notes: '五岳独尊，看日出' },
  { id: '2', city: '济南', date: '2023-05-03', notes: '大明湖畔夏雨荷' },
  { id: '3', city: '无锡', date: '2023-10-01', notes: '太湖美，鼋头渚' },
  { id: '4', city: '苏州', date: '2023-10-03', notes: '园林之美，平江路' },
];

const INITIAL_DATES: SpecialDate[] = [
  { id: '1', title: '我的生日', date: '2002-12-29', type: 'birthday' },
  { id: '2', title: '她的生日', date: '2003-08-15', type: 'birthday' },
  { id: '3', title: '在一起纪念日', date: '2023-02-14', type: 'anniversary' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.TIMELINE);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const syncAbortRef = useRef<AbortController | null>(null);
  const syncRequestIdRef = useRef(0);
  
  // Conflict Detection States
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [cloudData, setCloudData] = useState<any>(null);
  
  // Data States
  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([{ id: '1', text: '一起去看极光', completed: false }]);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [cities, setCities] = useState<CityVisit[]>(INITIAL_CITIES);
  const [dates, setDates] = useState<SpecialDate[]>(INITIAL_DATES);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);

  // UI States
  const [isLoaded, setIsLoaded] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tempMemoryImages, setTempMemoryImages] = useState<string[]>([]);
  const [newMemory, setNewMemory] = useState<Partial<Memory>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    location: '',
    imageUrl: '',
    tags: []
  });


  useEffect(() => {
    if (import.meta.env.VITE_ZHIPU_API_KEY) {
      setHasApiKey(true);
    }
    
    // Check authentication status
    const authStatus = localStorage.getItem(KEYS.AUTH);
    const savedUsername = localStorage.getItem(KEYS.USERNAME);
    
    if (authStatus === 'true' && savedUsername) {
      setIsAuthenticated(true);
      // Restore username for sync service
      syncService.setUsername(savedUsername);
    }
    
    // Load all data from LocalStorage
    const load = (key: string, setter: any) => {
      const saved = localStorage.getItem(key);
      if (saved) try { setter(JSON.parse(saved)); } catch (e) { console.error(e); }
    };

    load(KEYS.MEMORIES, setMemories);
    load(KEYS.FLOWERS, setFlowers);
    load(KEYS.TODOS, setTodos);
    load(KEYS.SNACKS, setSnacks);
    load(KEYS.CITIES, setCities);
    load(KEYS.DATES, setDates);
    load(KEYS.SOCIAL_POSTS, setSocialPosts);
    
    // Mark as loaded to enable auto-save
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage effects - only after initial load
  useEffect(() => { if (isLoaded) localStorage.setItem(KEYS.MEMORIES, JSON.stringify(memories)); }, [memories, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem(KEYS.FLOWERS, JSON.stringify(flowers)); }, [flowers, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem(KEYS.TODOS, JSON.stringify(todos)); }, [todos, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem(KEYS.SNACKS, JSON.stringify(snacks)); }, [snacks, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem(KEYS.CITIES, JSON.stringify(cities)); }, [cities, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem(KEYS.DATES, JSON.stringify(dates)); }, [dates, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem(KEYS.SOCIAL_POSTS, JSON.stringify(socialPosts)); }, [socialPosts, isLoaded]);

  const buildSyncPayload = () => ({
    memories,
    flowers,
    todos,
    snacks,
    cities,
    dates,
    socialPosts,
  });

  const estimateSyncSizeMB = (data: ReturnType<typeof buildSyncPayload>) => {
    const json = JSON.stringify(data);
    return json.length / (1024 * 1024);
  };

  // Cloud Sync Logic
  const syncToCloud = async (): Promise<SyncResult> => {
    const payload = buildSyncPayload();
    const sizeMB = estimateSyncSizeMB(payload);
    if (sizeMB > MAX_SYNC_SIZE_MB) {
      const message = `数据体积约 ${sizeMB.toFixed(1)}MB，超过云端同步限制，请减少照片数量或压缩后再同步。`;
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
      return { success: false, message };
    }

    syncAbortRef.current?.abort();
    const controller = new AbortController();
    syncAbortRef.current = controller;
    const requestId = ++syncRequestIdRef.current;

    setSyncStatus('syncing');
    const result = await syncService.saveToCloud(payload, controller.signal);
    
    if (requestId !== syncRequestIdRef.current || result.aborted) {
      return result;
    }

    if (result.success) {
      setSyncStatus('success');
      setLastSyncTime(new Date().toLocaleString('zh-CN'));
      setTimeout(() => setSyncStatus('idle'), 2000);
    } else {
      setSyncStatus('error');
      console.error('Sync failed:', result.message);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }

    return result;
  };

  // Debounced sync - only sync 3 seconds after last change
  useEffect(() => {
    if (!isLoaded || !isAuthenticated) return;
    
    const syncTimer = setTimeout(() => {
      if (syncService.isOnline()) {
        void syncToCloud();
      }
    }, 3000);

    return () => clearTimeout(syncTimer);
  }, [memories, flowers, todos, snacks, cities, dates, socialPosts, isLoaded, isAuthenticated]);

  // Authentication Logic
  const handleLogin = async (username: string, password: string) => {
    if (username === CREDENTIALS.USERNAME && password === CREDENTIALS.PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(KEYS.AUTH, 'true');
      localStorage.setItem(KEYS.USERNAME, username);
      setLoginError('');
      
      // Set username for sync service
      syncService.setUsername(username);
      
      // Load cloud data and merge with local
      const cloudResult = await syncService.loadFromCloud();
      if (cloudResult.success && cloudResult.data) {
        const localData = {
          memories,
          flowers,
          todos,
          snacks,
          cities,
          dates,
          socialPosts,
        };
        
        const mergedData = syncService.mergeData(localData, cloudResult.data);
        setMemories(mergedData.memories);
        setFlowers(mergedData.flowers);
        setTodos(mergedData.todos);
        setSnacks(mergedData.snacks);
        setCities(mergedData.cities);
        setDates(mergedData.dates);
        setSocialPosts(mergedData.socialPosts);
        setLastSyncTime(new Date().toLocaleString('zh-CN'));
      }
    } else {
      setLoginError('账号或密码错误，请重试');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(KEYS.AUTH);
    localStorage.removeItem(KEYS.USERNAME);
  };

  // Pull from Cloud - Load latest data from cloud
  const handlePullFromCloud = async () => {
    if (!confirm('确定要从云端拉取最新数据吗？\n\n这将用云端数据覆盖本地数据。')) {
      return;
    }

    syncAbortRef.current?.abort();
    const controller = new AbortController();
    syncAbortRef.current = controller;
    const requestId = ++syncRequestIdRef.current;

    setSyncStatus('syncing');
    const cloudResult = await syncService.loadFromCloud(controller.signal);
    
    if (requestId !== syncRequestIdRef.current || cloudResult.aborted) {
      return;
    }

    if (cloudResult.success && !cloudResult.data) {
      setSyncStatus('success');
      alert('ℹ️ 云端暂无数据');
      setTimeout(() => setSyncStatus('idle'), 2000);
      return;
    }

    if (cloudResult.success && cloudResult.data) {
      // Apply cloud data
      setMemories(cloudResult.data.memories || []);
      setFlowers(cloudResult.data.flowers || []);
      setTodos(cloudResult.data.todos || []);
      setSnacks(cloudResult.data.snacks || []);
      setCities(cloudResult.data.cities || []);
      setDates(cloudResult.data.dates || []);
      setSocialPosts(cloudResult.data.socialPosts || []);
      
      setSyncStatus('success');
      setLastSyncTime(new Date().toLocaleString('zh-CN'));
      alert('✅ 已从云端拉取最新数据');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } else {
      setSyncStatus('error');
      alert('❌ 拉取失败: ' + (cloudResult.message || '未知错误'));
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  // Push to Cloud - Upload local data to cloud
  const handlePushToCloud = async () => {
    if (!confirm('确定要推送本地数据到云端吗？\n\n这将用本地数据覆盖云端数据。')) {
      return;
    }

    const result = await syncToCloud();
    if (result.aborted) {
      return;
    }
    if (result.success) {
      alert('✅ 已推送本地数据到云端');
      return;
    }
    alert('❌ 推送失败: ' + (result.message || '未知错误'));
  };

  // Handle conflict resolution
  const handleUseCloudData = () => {
    if (cloudData) {
      setMemories(cloudData.memories || []);
      setFlowers(cloudData.flowers || []);
      setTodos(cloudData.todos || []);
      setSnacks(cloudData.snacks || []);
      setCities(cloudData.cities || []);
      setDates(cloudData.dates || []);
      setSocialPosts(cloudData.socialPosts || []);
      setLastSyncTime(new Date().toLocaleString('zh-CN'));
    }
    setShowConflictModal(false);
    setCloudData(null);
  };

  const handleKeepLocalData = () => {
    setShowConflictModal(false);
    setCloudData(null);
    // Keep local data, do nothing
  };

  // Export Data Logic
  const handleExportData = () => {
    const data = {
      memories,
      flowers,
      todos,
      snacks,
      cities,
      dates,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `our_chronicles_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle paste event for images in memory modal
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!showAddModal) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              compressImageDataUrl(base64, MEMORY_IMAGE_COMPRESS)
                .then((compressed) => {
                  setNewMemory(prev => ({ ...prev, imageUrl: compressed }));
                })
                .catch(() => {
                  setNewMemory(prev => ({ ...prev, imageUrl: base64 }));
                });
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [showAddModal]);


  // Handle file upload for memory images (supports HEIC)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await handleImageUpload(file);
        const compressed = await compressImageDataUrl(base64, MEMORY_IMAGE_COMPRESS);
        setNewMemory(prev => ({ ...prev, imageUrl: compressed }));
      } catch (error) {
        console.error('图片上传失败:', error);
        alert('图片上传失败，请重试');
      }
    }
  };

  // Import Data Logic
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (confirm(`准备导入备份 (日期: ${json.exportDate || '未知'})?\n当前数据将被覆盖。`)) {
           if(json.memories) setMemories(json.memories);
           if(json.flowers) setFlowers(json.flowers);
           if(json.todos) setTodos(json.todos);
           if(json.snacks) setSnacks(json.snacks);
           if(json.cities) setCities(json.cities);
           if(json.dates) setDates(json.dates);
           alert('数据恢复成功！');
        }
      } catch (err) {
        alert('文件格式错误，导入失败。');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  // Handlers
  const handleMemoryUpdate = (u: Memory) => setMemories(p => p.map(m => m.id === u.id ? u : m));
  const handleMemoryDelete = (id: string) => setMemories(p => p.filter(m => m.id !== id));
  
  const handleAddMemory = () => {
    const memory: Memory = {
      id: Date.now().toString(),
      title: newMemory.title || '未命名回忆',
      date: newMemory.date || new Date().toISOString(),
      description: newMemory.description || '',
      location: newMemory.location || '未知地点',
      imageUrl: tempMemoryImages[0] || newMemory.imageUrl || 'https://picsum.photos/800/600',
      images: tempMemoryImages.length > 0 ? tempMemoryImages : undefined,
      tags: ['新回忆'],
      mood: 'happy'
    };
    setMemories([memory, ...memories]);
    setShowAddModal(false);
    setNewMemory({ title: '', date: new Date().toISOString().split('T')[0], description: '', location: '', imageUrl: '', tags: [] });
    setTempMemoryImages([]);
  };

  const handleRemoveMemoryImage = (index: number) => {
    setTempMemoryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddFlower = (f: Flower) => setFlowers([f, ...flowers]);
  const handleUpdateFlower = (f: Flower) => setFlowers(p => p.map(flower => flower.id === f.id ? f : flower));
  const handleDeleteFlower = (id: string) => setFlowers(p => p.filter(f => f.id !== id));
  
  const handleAddSnack = (s: Snack) => setSnacks([s, ...snacks]);
  const handleUpdateSnack = (s: Snack) => setSnacks(p => p.map(snack => snack.id === s.id ? s : snack));
  const handleDeleteSnack = (id: string) => setSnacks(p => p.filter(s => s.id !== id));

  const handleAddCity = (c: CityVisit) => setCities([c, ...cities]);
  const handleUpdateVisit = (v: CityVisit) => setCities(p => p.map(city => city.id === v.id ? v : city));
  const handleDeleteCity = (id: string) => setCities(p => p.filter(c => c.id !== id));

  const handleAddTodo = (t: string) => setTodos([{ id: Date.now().toString(), text: t, completed: false }, ...todos]);
  const handleToggleTodo = (id: string) => setTodos(p => p.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const handleUpdateTodo = (t: TodoItem) => setTodos(p => p.map(todo => todo.id === t.id ? t : todo));
  const handleDeleteTodo = (id: string) => setTodos(p => p.filter(t => t.id !== id));

  const handleAddDate = (d: SpecialDate) => setDates([d, ...dates]);
  const handleUpdateDate = (d: SpecialDate) => setDates(p => p.map(date => date.id === d.id ? d : date));
  const handleDeleteDate = (id: string) => setDates(p => p.filter(d => d.id !== id));

  const handleAddSocialPost = (post: SocialPost) => setSocialPosts([post, ...socialPosts]);
  const handleUpdateSocialPost = (post: SocialPost) => setSocialPosts(p => p.map(sp => sp.id === post.id ? post : sp));
  const handleDeleteSocialPost = (id: string) => setSocialPosts(p => p.filter(sp => sp.id !== id));

  const printBook = () => window.print();

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  if (!hasApiKey) {
    return (
      <div className="flex h-screen items-center justify-center bg-rose-50 text-center p-6">
        <div className="max-w-md">
          <h1 className="text-2xl font-serif font-bold text-slate-900 mb-4">缺少环境配置</h1>
          <p className="text-slate-600">请确保 <code>VITE_ZHIPU_API_KEY</code> 已配置以启用 AI 功能。</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case AppView.TIMELINE:
        return (
          <div className="max-w-3xl mx-auto p-6 md:p-12 pb-24 print:p-0 print:max-w-none">
             <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
               <div>
                  <h2 className="text-3xl font-serif font-bold text-slate-900">时光书</h2>
                  <p className="text-slate-500 mt-1">每一页，都是我们的故事。</p>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => setShowAddModal(true)} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl shadow-md flex items-center gap-2 text-sm"><Plus className="w-4 h-4" />新增一页</button>
                 <button onClick={printBook} className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2 text-sm"><Printer className="w-4 h-4" />下载 PDF</button>
                 <button onClick={() => setShowQuiz(true)} className="bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2 text-sm"><Gamepad2 className="w-4 h-4" />回忆问答</button>
               </div>
             </div>
             <div className="hidden print:block text-center mb-12 border-b pb-8">
                <h1 className="text-4xl font-serif font-bold mb-2">我们的时光书</h1>
                <p className="text-slate-500 italic">Created with Love & AI</p>
             </div>
             <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-rose-200 before:to-transparent print:before:hidden">
                {memories.map((memory) => (
                  <div key={memory.id} className="relative z-10 print:mb-8 print:break-inside-avoid">
                     <MemoryCard memory={memory} onUpdate={handleMemoryUpdate} onDelete={handleMemoryDelete} />
                  </div>
                ))}
             </div>
          </div>
        );
      case AppView.FLOWER_WALL:
        return <FlowerWall flowers={flowers} onAddFlower={handleAddFlower} onUpdateFlower={handleUpdateFlower} onDeleteFlower={handleDeleteFlower} />;
      case AppView.TODO_LIST:
        return <TodoListPage todos={todos} onAddTodo={handleAddTodo} onToggleTodo={handleToggleTodo} onUpdateTodo={handleUpdateTodo} onDeleteTodo={handleDeleteTodo} />;
      case AppView.SNACK_WALL:
        return <SnackWall snacks={snacks} onAddSnack={handleAddSnack} onUpdateSnack={handleUpdateSnack} onDeleteSnack={handleDeleteSnack} />;
      case AppView.MAP:
        return <TravelLog visits={cities} onAddVisit={handleAddCity} onUpdateVisit={handleUpdateVisit} onDeleteVisit={handleDeleteCity} />;
      case AppView.ANNIVERSARY:
        return <AnniversaryPage dates={dates} onAddDate={handleAddDate} onUpdateDate={handleUpdateDate} onDeleteDate={handleDeleteDate} />;
      case AppView.SOCIAL_MEDIA:
        return <SocialMediaPage posts={socialPosts} onAddPost={handleAddSocialPost} onUpdatePost={handleUpdateSocialPost} onDeletePost={handleDeleteSocialPost} />;
      case AppView.DASHBOARD:
        return <Dashboard stats={MOCK_STATS} />;
      case AppView.CHAT:
        return <div className="p-6 md:p-12 h-full"><Chatbot memories={memories} /></div>;
      default: return null;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      onExportData={handleExportData}
      onImportData={handleImportData}
      syncStatus={syncStatus}
      lastSyncTime={lastSyncTime}
      onManualSync={syncToCloud}
      onPullFromCloud={handlePullFromCloud}
      onPushToCloud={handlePushToCloud}
      onLogout={handleLogout}
    >
      {renderContent()}
      {showQuiz && <QuizModal memories={memories} onClose={() => setShowQuiz(false)} />}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-fadeInUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-slate-900">记录新回忆</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <input className="w-full border rounded-lg p-2" value={newMemory.title} onChange={e => setNewMemory({...newMemory, title: e.target.value})} placeholder="标题" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="w-full border rounded-lg p-2" value={newMemory.date} onChange={e => setNewMemory({...newMemory, date: e.target.value})} />
                <input className="w-full border rounded-lg p-2" value={newMemory.location} onChange={e => setNewMemory({...newMemory, location: e.target.value})} placeholder="地点" />
              </div>
              
              {/* Image Upload Area */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  图片
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                  {newMemory.imageUrl ? (
                    <div className="relative">
                      <img
                        src={newMemory.imageUrl}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <button
                        onClick={() => setNewMemory(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 text-center">
                      <ImageIcon className="w-10 h-10 mx-auto text-slate-400" />
                      <p className="text-sm text-slate-600">
                        <strong>方法1:</strong> 截图后按 <kbd className="px-2 py-1 bg-slate-100 rounded text-xs">Ctrl+V</kbd> / <kbd className="px-2 py-1 bg-slate-100 rounded text-xs">Cmd+V</kbd> 粘贴
                      </p>
                      <p className="text-sm text-slate-600">或</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mx-auto"
                      >
                        <Upload className="w-4 h-4" />
                        <strong>方法2:</strong> 点击上传图片
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.heic,.heif"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-slate-500">或</p>
                      <input 
                        className="w-full border rounded-lg p-2 text-sm" 
                        value={newMemory.imageUrl || ''} 
                        onChange={e => setNewMemory({...newMemory, imageUrl: e.target.value})} 
                        placeholder="方法3: 粘贴图片链接" 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <textarea className="w-full border rounded-lg p-2 h-24" value={newMemory.description} onChange={e => setNewMemory({...newMemory, description: e.target.value})} placeholder="描述..." />
              <button onClick={handleAddMemory} className="w-full bg-rose-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Save className="w-5 h-5" />保存</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
