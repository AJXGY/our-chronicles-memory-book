// Cloud Sync Service for Our Chronicles
// Handles data synchronization between localStorage and cloud storage

export interface SyncData {
  memories: any[];
  flowers: any[];
  todos: any[];
  snacks: any[];
  cities: any[];
  dates: any[];
  socialPosts: any[];
  lastSyncTime: string;
}

export interface SyncResult {
  success: boolean;
  message?: string;
  data?: SyncData;
}

class SyncService {
  private baseUrl: string;
  private username: string;

  constructor() {
    // Use localhost:3001 for local development, relative URL for production
    this.baseUrl = import.meta.env.DEV 
      ? 'http://localhost:3001/api/sync'
      : '/api/sync';
    this.username = '';
  }

  setUsername(username: string) {
    this.username = username;
  }

  // Check if online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Save data to cloud
  async saveToCloud(data: Partial<SyncData>): Promise<SyncResult> {
    if (!this.isOnline()) {
      return { success: false, message: '离线状态,无法同步到云端' };
    }

    if (!this.username) {
      return { success: false, message: '未登录,无法同步' };
    }

    try {
      const syncData: SyncData = {
        ...data,
        lastSyncTime: new Date().toISOString(),
      } as SyncData;

      const response = await fetch(`${this.baseUrl}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          data: syncData,
        }),
      });

      if (!response.ok) {
        throw new Error(`同步失败: ${response.statusText}`);
      }

      const result = await response.json();
      return { success: true, message: '数据已同步到云端' };
    } catch (error) {
      console.error('Cloud sync error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '同步失败' 
      };
    }
  }

  // Load data from cloud
  async loadFromCloud(): Promise<SyncResult> {
    if (!this.isOnline()) {
      return { success: false, message: '离线状态,使用本地数据' };
    }

    if (!this.username) {
      return { success: false, message: '未登录,无法加载云端数据' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/load?username=${encodeURIComponent(this.username)}`);

      if (!response.ok) {
        if (response.status === 404) {
          return { success: true, message: '云端暂无数据', data: undefined };
        }
        throw new Error(`加载失败: ${response.statusText}`);
      }

      const result = await response.json();
      return { 
        success: true, 
        message: '已从云端加载数据',
        data: result.data 
      };
    } catch (error) {
      console.error('Cloud load error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '加载失败' 
      };
    }
  }

  // Merge local and cloud data (cloud takes precedence)
  mergeData(localData: Partial<SyncData>, cloudData?: SyncData): SyncData {
    if (!cloudData) {
      return {
        memories: localData.memories || [],
        flowers: localData.flowers || [],
        todos: localData.todos || [],
        snacks: localData.snacks || [],
        cities: localData.cities || [],
        dates: localData.dates || [],
        socialPosts: localData.socialPosts || [],
        lastSyncTime: new Date().toISOString(),
      };
    }

    // Cloud data takes precedence, but merge arrays by ID
    const mergeArrays = (local: any[], cloud: any[]) => {
      const cloudIds = new Set(cloud.map(item => item.id));
      const uniqueLocal = local.filter(item => !cloudIds.has(item.id));
      return [...cloud, ...uniqueLocal];
    };

    return {
      memories: mergeArrays(localData.memories || [], cloudData.memories || []),
      flowers: mergeArrays(localData.flowers || [], cloudData.flowers || []),
      todos: mergeArrays(localData.todos || [], cloudData.todos || []),
      snacks: mergeArrays(localData.snacks || [], cloudData.snacks || []),
      cities: mergeArrays(localData.cities || [], cloudData.cities || []),
      dates: mergeArrays(localData.dates || [], cloudData.dates || []),
      socialPosts: mergeArrays(localData.socialPosts || [], cloudData.socialPosts || []),
      lastSyncTime: cloudData.lastSyncTime || new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const syncService = new SyncService();
