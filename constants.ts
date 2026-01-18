import { Memory, DashboardStats } from './types';

export const INITIAL_MEMORIES: Memory[] = [
  {
    id: '1',
    title: '第一次咖啡约会',
    date: '2023-02-14',
    description: '我们在街角的咖啡馆相遇。那天虽然下着雨，你却点了一杯冰拿铁。',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    location: '上海, 静安区',
    tags: ['第一次', '咖啡', '雨天'],
    mood: 'cozy'
  },
  {
    id: '2',
    title: '攀登黄山',
    date: '2023-06-20',
    description: '爬到半山腰差点放弃，但云海出现的那一刻，一切都值了。',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    location: '安徽, 黄山',
    tags: ['冒险', '自然', '徒步'],
    mood: 'adventure'
  },
  {
    id: '3',
    title: '一周年纪念晚餐',
    date: '2024-02-14',
    description: '一年后，回到同一个城市，但这次是在外滩的餐厅，看着江景。',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    location: '上海, 外滩',
    tags: ['庆祝', '美食', '爱'],
    mood: 'romantic'
  },
  {
    id: '4',
    title: '海边公路自驾',
    date: '2023-08-15',
    description: '车窗摇下来，我们大声唱着周杰伦的歌，海风吹乱了头发。',
    imageUrl: 'https://picsum.photos/800/600?random=4',
    location: '海南, 万宁',
    tags: ['旅行', '音乐', '海滩'],
    mood: 'happy'
  },
  {
    id: '5',
    title: '搬家日',
    date: '2023-11-01',
    description: '满地的纸箱，坐在地板上吃外卖披萨。这是我们小家的开始。',
    imageUrl: 'https://picsum.photos/800/600?random=5',
    location: '我们的新家',
    tags: ['家', '里程碑', '混乱'],
    mood: 'cozy'
  }
];

export const MOCK_STATS: DashboardStats = {
  totalPhotos: 1203,
  citiesVisited: 8,
  daysTogether: 432,
  monthlyActivity: [
    { month: '2月', count: 45 },
    { month: '3月', count: 30 },
    { month: '4月', count: 60 },
    { month: '5月', count: 25 },
    { month: '6月', count: 90 },
    { month: '7月', count: 120 },
    { month: '8月', count: 85 },
    { month: '9月', count: 50 },
    { month: '10月', count: 40 },
    { month: '11月', count: 110 },
    { month: '12月', count: 150 },
    { month: '1月', count: 70 },
  ],
  categories: [
    { name: '旅行', value: 40 },
    { name: '美食', value: 30 },
    { name: '居家', value: 20 },
    { name: '活动', value: 10 },
  ]
};
