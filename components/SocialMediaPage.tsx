import React, { useState, useRef, useEffect } from 'react';
import { SocialPost } from '../types';
import { Plus, X, ExternalLink, Instagram, Maximize2, Minimize2, Upload, Clipboard } from 'lucide-react';
import { compressImageDataUrl } from '../utils';

interface SocialMediaPageProps {
  posts: SocialPost[];
  onAddPost: (post: SocialPost) => void;
  onUpdatePost: (post: SocialPost) => void;
  onDeletePost: (id: string) => void;
}

export const SocialMediaPage: React.FC<SocialMediaPageProps> = ({
  posts,
  onAddPost,
  onUpdatePost,
  onDeletePost,
}) => {
  const screenshotCompress = { maxWidth: 1600, quality: 0.75 };
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPost, setNewPost] = useState<Partial<SocialPost>>({
    platform: 'douyin',
    url: '',
    title: '',
    coverImage: '',
    screenshot: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const handleAddPost = () => {
    if (!newPost.url || !newPost.title) {
      alert('请填写链接和标题');
      return;
    }
    const post: SocialPost = {
      id: Date.now().toString(),
      platform: newPost.platform as 'douyin' | 'weibo',
      url: newPost.url,
      title: newPost.title,
      coverImage: newPost.coverImage,
      screenshot: newPost.screenshot,
      date: newPost.date || new Date().toISOString().split('T')[0],
      description: newPost.description,
    };
    onAddPost(post);
    setShowAddModal(false);
    setNewPost({
      platform: 'douyin',
      url: '',
      title: '',
      coverImage: '',
      screenshot: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  // Handle paste event for screenshots
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
              compressImageDataUrl(base64, screenshotCompress)
                .then((compressed) => {
                  setNewPost(prev => ({ ...prev, screenshot: compressed }));
                })
                .catch(() => {
                  setNewPost(prev => ({ ...prev, screenshot: base64 }));
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

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        compressImageDataUrl(base64, screenshotCompress)
          .then((compressed) => {
            setNewPost(prev => ({ ...prev, screenshot: compressed }));
          })
          .catch(() => {
            setNewPost(prev => ({ ...prev, screenshot: base64 }));
          });
      };
      reader.readAsDataURL(file);
    }
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'douyin') return '🎵';
    if (platform === 'weibo') return '📱';
    return '🔗';
  };

  const getPlatformName = (platform: string) => {
    if (platform === 'douyin') return '抖音';
    if (platform === 'weibo') return '微博';
    return platform;
  };

  const toggleExpand = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 pb-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">社交平台</h2>
          <p className="text-slate-500 mt-1">我们在其他平台的精彩瞬间</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl shadow-md flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          添加内容
        </button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {posts.map((post) => {
          const isExpanded = expandedPostId === post.id;
          const displayImage = post.screenshot || post.coverImage;
          
          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Screenshot or Cover Image */}
              {displayImage && (
                <div 
                  className={`bg-slate-100 overflow-hidden relative group ${isExpanded ? '' : 'cursor-pointer'}`}
                  onClick={() => !isExpanded && toggleExpand(post.id)}
                >
                  <img
                    src={displayImage}
                    alt={post.title}
                    className={`w-full object-contain ${isExpanded ? 'max-h-[800px]' : 'max-h-[400px]'}`}
                  />
                  {!isExpanded && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                        <Maximize2 className="w-4 h-4" />
                        点击查看大图
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
                  <span className="text-xs font-medium text-slate-500">
                    {getPlatformName(post.platform)}
                  </span>
                  <span className="text-xs text-slate-400 ml-auto">{post.date}</span>
                </div>

                <h3 className="font-semibold text-slate-900 mb-2">
                  {post.title}
                </h3>

                {post.description && (
                  <p className="text-sm text-slate-600 mb-3">
                    {post.description}
                  </p>
                )}

                <div className="flex gap-2">
                  {displayImage && (
                    <button
                      onClick={() => toggleExpand(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <Minimize2 className="w-4 h-4" />
                          收起
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-4 h-4" />
                          查看大图
                        </>
                      )}
                    </button>
                  )}
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-slate-50 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    原文链接
                  </a>
                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {posts.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Instagram className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>还没有添加社交平台内容</p>
            <p className="text-sm mt-1">点击右上角"添加内容"开始记录</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 animate-fadeInUp max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-slate-900">
                添加社交平台内容
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  平台
                </label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={newPost.platform}
                  onChange={(e) =>
                    setNewPost({ ...newPost, platform: e.target.value as 'douyin' | 'weibo' })
                  }
                >
                  <option value="douyin">🎵 抖音</option>
                  <option value="weibo">📱 微博</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  原文链接 *
                </label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={newPost.url}
                  onChange={(e) => setNewPost({ ...newPost, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  标题 *
                </label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="给这条内容起个标题"
                />
              </div>

              {/* Screenshot Upload Area */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  截图 (推荐)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  {newPost.screenshot ? (
                    <div className="relative">
                      <img
                        src={newPost.screenshot}
                        alt="Screenshot preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <button
                        onClick={() => setNewPost(prev => ({ ...prev, screenshot: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Clipboard className="w-12 h-12 mx-auto text-slate-400" />
                      <p className="text-sm text-slate-600">
                        <strong>方法1:</strong> 截图后直接按 <kbd className="px-2 py-1 bg-slate-100 rounded">Ctrl+V</kbd> / <kbd className="px-2 py-1 bg-slate-100 rounded">Cmd+V</kbd> 粘贴
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
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  封面图片 URL (可选)
                </label>
                <input
                  className="w-full border rounded-lg p-2"
                  value={newPost.coverImage}
                  onChange={(e) => setNewPost({ ...newPost, coverImage: e.target.value })}
                  placeholder="https://..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  如果已上传截图，封面图可以不填
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  日期
                </label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2"
                  value={newPost.date}
                  onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  描述 (可选)
                </label>
                <textarea
                  className="w-full border rounded-lg p-2 h-20"
                  value={newPost.description}
                  onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                  placeholder="简单描述一下这条内容..."
                />
              </div>

              <button
                onClick={handleAddPost}
                className="w-full bg-rose-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
