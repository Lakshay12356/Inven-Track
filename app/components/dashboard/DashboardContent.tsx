'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Package, Truck, TrendingUp, ShoppingCart,
  BarChart2, RefreshCw,
} from 'lucide-react';
import Loading from '@/app/components/ui/Loading';
import {
  getAnalytics,
  getRevenueOverTime,
  getOrderStatusBreakdown,
  getTopProducts,
  AnalyticsData,
  RevenuePoint,
  OrderStatusBreakdown,
  TopProduct,
} from '@/app/lib/api/analytics';
import { getUserRole } from '@/app/lib/api/users';
import DeliveryPartnerDashboard from './DeliveryPartnerDashboard';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';

// ──────────────────────────────────────────────
// Palette — validated categorical order
// Light surface: #ffffff  Dark surface: #0f1117
// ──────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  completed:  '#22c55e',  // green-500
  in_transit: '#f59e0b',  // amber-500
  assigned:   '#6366f1',  // indigo-500
  pending:    '#94a3b8',  // slate-400
  cancelled:  '#ef4444',  // red-500
};

const BAR_COLOR = '#3b82f6';   // blue-500
const AREA_COLOR = '#6366f1';  // indigo-500

// ── Stat card ──────────────────────────────────
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  gradient: string;
  shadow: string;
  delay?: string;
}
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, gradient, shadow, delay }) => (
  <div className="animate-fade-in-up" style={{ animationDelay: delay }}>
    <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl p-5 rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl shadow-lg ${gradient} ${shadow}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-white/35 font-medium uppercase tracking-wider">{label}</p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
        </div>
      </div>
    </div>
  </div>
);

// ── Chart card wrapper ─────────────────────────
const ChartCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; delay?: string }> = ({
  title, subtitle, children, delay,
}) => (
  <div className="animate-fade-in-up bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] p-5" style={{ animationDelay: delay }}>
    <div className="mb-4">
      <p className="text-sm font-semibold text-gray-800 dark:text-white/85">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-white/25 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// ── Custom tooltip ─────────────────────────────
const ChartTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number; name?: string; color?: string }>;
  label?: string;
  formatter?: (v: number) => string;
}> = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1c1f2a] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2.5 shadow-xl text-xs">
      {label && <p className="text-gray-400 dark:text-white/30 mb-1.5 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-gray-700 dark:text-white/70 font-semibold">
            {formatter ? formatter(p.value) : p.value}
          </span>
          {p.name && <span className="text-gray-400 dark:text-white/25 ml-0.5">{p.name}</span>}
        </div>
      ))}
    </div>
  );
};

// ── Pie label line renderer ────────────────────
interface PieLabelProps {
  cx?: number; cy?: number;
  midAngle?: number;
  innerRadius?: number; outerRadius?: number;
  percent?: number; name?: string;
}
const renderPieLabel = ({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0, name = '' }: PieLabelProps) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Main dashboard ─────────────────────────────
const DashboardContent: React.FC = () => {
  const { user } = useUser();
  const [role, setRole] = useState<'manager' | 'delivery_partner' | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<OrderStatusBreakdown[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (showSpinner = false) => {
    if (!user?.id) return;
    if (showSpinner) setRefreshing(true);
    try {
      const [roleResult, analyticsResult, revenueResult, statusResult, productsResult] =
        await Promise.all([
          getUserRole(user.id),
          getAnalytics(user.id),
          getRevenueOverTime(user.id, 30),
          getOrderStatusBreakdown(user.id),
          getTopProducts(user.id, 6),
        ]);
      setRole(roleResult);
      setAnalytics(analyticsResult);
      setRevenue(revenueResult);
      setStatusBreakdown(statusResult);
      setTopProducts(productsResult);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <Loading size="md" text="Loading dashboard…" />;
  if (role === 'delivery_partner') return <DeliveryPartnerDashboard />;

  const fmt$ = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // Slim the revenue data to show only every-other date label
  const revenueLabeled = revenue.map((r, i) => ({
    ...r,
    displayDate: i % 5 === 0 ? r.date.slice(5) : '',
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-white/35 mt-1 text-sm">
            Live analytics for your inventory and deliveries.
          </p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 dark:text-white/40 bg-white/40 dark:bg-white/[0.04] border border-white/40 dark:border-white/[0.07] rounded-xl hover:bg-white/60 dark:hover:bg-white/[0.07] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={fmt$(analytics?.totalRevenue || 0)}
          gradient="bg-gradient-to-br from-emerald-400 to-teal-500"
          shadow="shadow-emerald-500/20 dark:shadow-emerald-500/30"
          delay="0.05s"
        />
        <StatCard
          icon={Package}
          label="Products In Stock"
          value={analytics?.productsInStock || 0}
          gradient="bg-gradient-to-br from-blue-400 to-indigo-500"
          shadow="shadow-blue-500/20 dark:shadow-blue-500/30"
          delay="0.1s"
        />
        <StatCard
          icon={Truck}
          label="Active Deliveries"
          value={analytics?.activeDeliveries || 0}
          gradient="bg-gradient-to-br from-amber-400 to-orange-500"
          shadow="shadow-amber-500/20 dark:shadow-amber-500/30"
          delay="0.15s"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={analytics?.totalOrders || 0}
          gradient="bg-gradient-to-br from-violet-400 to-purple-600"
          shadow="shadow-violet-500/20 dark:shadow-violet-500/30"
          delay="0.2s"
        />
      </div>

      {/* Revenue area chart */}
      <ChartCard title="Revenue — Last 30 Days" subtitle="Completed orders only" delay="0.25s">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueLabeled} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={AREA_COLOR} stopOpacity={0.25} />
                <stop offset="95%" stopColor={AREA_COLOR} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.6)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => v === 0 ? '0' : `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.6)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip formatter={fmt$} />}
              cursor={{ stroke: AREA_COLOR, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={AREA_COLOR}
              strokeWidth={2}
              fill="url(#revGrad)"
              dot={false}
              activeDot={{ r: 4, fill: AREA_COLOR, stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Bottom row: pie + bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Order status pie */}
        <ChartCard title="Orders by Status" delay="0.3s">
          {statusBreakdown.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-white/20">
              No orders yet
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={44}
                    strokeWidth={2}
                    stroke="transparent"
                    labelLine={false}
                    label={renderPieLabel}
                  >
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<ChartTooltip formatter={v => `${v} orders`} />}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusBreakdown.map(s => (
                  <div key={s.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s.status] || '#94a3b8' }} />
                      <span className="text-xs text-gray-600 dark:text-white/50">{s.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-white/70">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>

        {/* Top products bar chart */}
        <ChartCard title="Top Products by Revenue" subtitle="Completed orders" delay="0.35s">
          {topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-white/20">
              No sales data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={v => v === 0 ? '0' : `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.6)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 10, fill: 'rgba(148,163,184,0.7)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v.length > 16 ? v.slice(0, 14) + '…' : v}
                />
                <Tooltip content={<ChartTooltip formatter={fmt$} />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar dataKey="revenue" fill={BAR_COLOR} radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Inventory value + low stock summary */}
      <div className="animate-fade-in-up grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ animationDelay: '0.4s' }}>
        <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl p-5 rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-3 mb-1">
            <BarChart2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Inventory Value</p>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{fmt$(analytics?.inventoryValue || 0)}</p>
          <p className="text-xs text-gray-400 dark:text-white/20 mt-1">Current stock × sell price</p>
        </div>
        <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl p-5 rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider">Top Sellers</p>
          </div>
          <div className="space-y-2">
            {topProducts.slice(0, 3).map(p => (
              <div key={p.sku} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700 dark:text-white/65 truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/20 font-mono">{p.sku}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-xs font-bold text-gray-800 dark:text-white/80">{fmt$(p.revenue)}</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/20">{p.unitsSold} units</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-white/20">No completed sales yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
