import React from 'react';
import { TrendingUp } from 'lucide-react';

// responsive shadow fix
export const StatCard = ({ title, value, icon: Icon, trend, t, isLive = false }) => (
  <div className={`${t.card} p-6 rounded-xl border ${t.border} shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col justify-between relative overflow-hidden`}>
    {isLive && <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />}
    <div className="flex justify-between items-start">
      <div>
        <p className={`${t.muted} text-sm font-medium mb-1`}>{title}</p>
        <h3 className={`text-2xl font-bold ${t.text} ${isLive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''}`}>{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${isLive ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
        <Icon className={`w-6 h-6 ${isLive ? 'text-emerald-500' : 'text-blue-500'}`} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
      <span className="text-emerald-500 font-medium">{trend}</span>
      <span className={`${t.muted} ml-2`}>vs prev. month</span>
    </div>
  </div>
);