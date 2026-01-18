import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { DashboardStats } from '../types';
import { Camera, Map, Calendar, Heart } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
}

const COLORS = ['#e11d48', '#fb7185', '#fecdd3', '#fda4af'];

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="p-6 space-y-8 animate-fadeIn max-w-6xl mx-auto w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-slate-900">情感仪表盘</h2>
        <p className="text-slate-500 mt-2">我们化学反应背后的科学</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-50 text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{stats.totalPhotos}</h3>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-1">记录瞬间</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-50 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Map className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{stats.citiesVisited}</h3>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-1">探索城市</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-50 text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{stats.daysTogether}</h3>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-1">相伴天数</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-50 text-center">
          <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900">∞</h3>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mt-1">心动指数</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Over Time */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6">每月回忆热度</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyActivity}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#fff1f2' }}
                />
                <Bar dataKey="count" fill="#fb7185" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6">我们最爱做的事</h4>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {stats.categories.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-sm text-slate-600">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
