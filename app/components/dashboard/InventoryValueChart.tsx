'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartData {
  analytics_date: string;
  daily_revenue: number;
  daily_profit: number;
}

interface InventoryValueChartProps {
  data: ChartData[];
}

const InventoryValueChart: React.FC<InventoryValueChartProps> = ({ data }) => {
  const [filter, setFilter] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort by date with better parsing
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.analytics_date).getTime();
      const dateB = new Date(b.analytics_date).getTime();
      return (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
    });

    if (filter === 'daily') {
      return sortedData.map(item => {
        const dateObj = new Date(item.analytics_date);
        const name = isNaN(dateObj.getTime()) 
            ? item.analytics_date 
            : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        
        return {
            name,
            revenue: Number(item.daily_revenue) || 0,
            profit: Number(item.daily_profit) || 0,
        };
      });
    }

    if (filter === 'monthly') {
      const monthly: Record<string, { revenue: number; profit: number }> = {};
      sortedData.forEach(item => {
        const dateObj = new Date(item.analytics_date);
        const month = isNaN(dateObj.getTime())
            ? 'Unknown'
            : dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
        
        if (!monthly[month]) monthly[month] = { revenue: 0, profit: 0 };
        monthly[month].revenue += Number(item.daily_revenue) || 0;
        monthly[month].profit += Number(item.daily_profit) || 0;
      });
      return Object.entries(monthly).map(([name, vals]) => ({
        name,
        revenue: vals.revenue,
        profit: vals.profit,
      }));
    }

    if (filter === 'yearly') {
      const yearly: Record<string, { revenue: number; profit: number }> = {};
      sortedData.forEach(item => {
        const dateObj = new Date(item.analytics_date);
        const year = isNaN(dateObj.getTime())
            ? 'Unknown'
            : dateObj.getFullYear().toString();
            
        if (!yearly[year]) yearly[year] = { revenue: 0, profit: 0 };
        yearly[year].revenue += Number(item.daily_revenue) || 0;
        yearly[year].profit += Number(item.daily_profit) || 0;
      });
      return Object.entries(yearly).map(([name, vals]) => ({
        name,
        revenue: vals.revenue,
        profit: vals.profit,
      }));
    }

    return [];
  }, [data, filter]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl p-4 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl z-50">
          <p className="text-xs font-bold text-gray-400 dark:text-white/30 mb-2 uppercase tracking-widest">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-white/50">Revenue</span>
                </div>
                <span className="text-sm font-bold text-blue-500">${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between gap-10">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-white/50">Profit</span>
                </div>
                <span className="text-sm font-bold text-emerald-500">${payload[1].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <div className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest">
                {processedData.length} Data point{processedData.length !== 1 ? 's' : ''} active
            </div>
        </div>
        <div className="flex gap-2">
            {(['daily', 'monthly', 'yearly'] as const).map((f) => (
            <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 border ${
                filter === f
                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                    : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-gray-300'
                }`}
            >
                {f}
            </button>
            ))}
        </div>
      </div>
      
      <div className="flex-1 w-full relative min-h-[250px]">
        {processedData.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-40">
                <div className="p-4 bg-white/5 rounded-full mb-3">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-400">No transaction data available yet</p>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight">Complete more deliveries to see your trend</p>
            </div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
            {/* Using BarChart with minPointSize for visibility */}
            <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" opacity={0.05} />
                <XAxis 
                    dataKey="name" 
                    axisLine={{ stroke: '#ffffff', opacity: 0.1 }}
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    dy={10}
                />
                <YAxis 
                    axisLine={{ stroke: '#ffffff', opacity: 0.1 }}
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                    domain={[0, 'auto']}
                />
                <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }} 
                />
                <Bar 
                    dataKey="revenue" 
                    fill="#3b82f6" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                    minPointSize={10}
                    animationDuration={1500}
                />
                <Bar 
                    dataKey="profit" 
                    fill="#10b981" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30}
                    minPointSize={5}
                    animationDuration={2000}
                />
            </BarChart>
            </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default InventoryValueChart;
