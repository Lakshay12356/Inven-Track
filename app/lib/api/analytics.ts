import { createClient } from '@/app/lib/supabase-client';
import { getOrCreateUser } from './users';

export interface AnalyticsData {
  totalRevenue: number;
  productsInStock: number;
  activeDeliveries: number;
  totalOrders: number;
  inventoryValue: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  label: string;
}

export interface TopProduct {
  name: string;
  sku: string;
  revenue: number;
  unitsSold: number;
}

export const getAnalytics = async (clerkUserId: string): Promise<AnalyticsData> => {
  const supabase = createClient();
  const supabaseUserId = await getOrCreateUser(clerkUserId);

  const [stockRes, activeRes, revenueRes, inventoryRes] = await Promise.all([
    supabase.from('products').select('id, quantity').eq('user_id', supabaseUserId),
    supabase
      .from('delivery_orders')
      .select('id')
      .eq('manager_id', supabaseUserId)
      .in('status', ['assigned', 'in_transit']),
    supabase.rpc('get_total_revenue', { p_manager_id: supabaseUserId }),
    supabase
      .from('products')
      .select('quantity, sale_price')
      .eq('user_id', supabaseUserId),
  ]);

  const productsInStock = stockRes.data?.filter(p => p.quantity > 0).length || 0;
  const activeDeliveries = activeRes.data?.length || 0;
  const totalRevenue = (revenueRes.data as number) || 0;
  const inventoryValue =
    inventoryRes.data?.reduce((sum, p) => sum + p.quantity * p.sale_price, 0) || 0;

  const { data: allOrders } = await supabase
    .from('delivery_orders')
    .select('id')
    .eq('manager_id', supabaseUserId);

  return {
    totalRevenue,
    productsInStock,
    activeDeliveries,
    totalOrders: allOrders?.length || 0,
    inventoryValue,
  };
};

export const getRevenueOverTime = async (
  clerkUserId: string,
  days = 30
): Promise<RevenuePoint[]> => {
  const supabase = createClient();
  const supabaseUserId = await getOrCreateUser(clerkUserId);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from('delivery_orders')
    .select(`
      created_at,
      delivery_order_items (
        quantity,
        products ( sale_price )
      )
    `)
    .eq('manager_id', supabaseUserId)
    .eq('status', 'completed')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  const byDay: Record<string, number> = {};

  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDay[d.toISOString().slice(0, 10)] = 0;
  }

  for (const order of data || []) {
    const day = order.created_at.slice(0, 10);
    const orderRevenue = (order.delivery_order_items || []).reduce(
      (sum: number, item: { quantity: number; products: { sale_price: number }[] | { sale_price: number } | null }) => {
        const sp = Array.isArray(item.products)
          ? (item.products[0]?.sale_price || 0)
          : (item.products?.sale_price || 0);
        return sum + item.quantity * sp;
      },
      0
    );
    if (byDay[day] !== undefined) {
      byDay[day] += orderRevenue;
    }
  }

  return Object.entries(byDay).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue * 100) / 100,
  }));
};

export const getOrderStatusBreakdown = async (
  clerkUserId: string
): Promise<OrderStatusBreakdown[]> => {
  const supabase = createClient();
  const supabaseUserId = await getOrCreateUser(clerkUserId);

  const { data } = await supabase
    .from('delivery_orders')
    .select('status')
    .eq('manager_id', supabaseUserId);

  const counts: Record<string, number> = {};
  for (const order of data || []) {
    counts[order.status] = (counts[order.status] || 0) + 1;
  }

  const labels: Record<string, string> = {
    completed: 'Completed',
    in_transit: 'In Transit',
    assigned: 'Assigned',
    pending: 'Pending',
    cancelled: 'Cancelled',
  };

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ status, count, label: labels[status] || status }))
    .sort((a, b) => b.count - a.count);
};

export const getTopProducts = async (
  clerkUserId: string,
  limit = 6
): Promise<TopProduct[]> => {
  const supabase = createClient();
  const supabaseUserId = await getOrCreateUser(clerkUserId);

  const { data } = await supabase
    .from('delivery_orders')
    .select(`
      delivery_order_items (
        quantity,
        products ( name, sku, sale_price )
      )
    `)
    .eq('manager_id', supabaseUserId)
    .eq('status', 'completed');

  const productMap: Record<string, TopProduct> = {};
  for (const order of data || []) {
    for (const item of order.delivery_order_items || []) {
      const raw = item.products;
      const p = Array.isArray(raw) ? raw[0] : raw;
      if (!p) continue;
      const key = p.sku;
      if (!productMap[key]) {
        productMap[key] = { name: p.name, sku: p.sku, revenue: 0, unitsSold: 0 };
      }
      productMap[key].revenue += item.quantity * p.sale_price;
      productMap[key].unitsSold += item.quantity;
    }
  }

  return Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map(p => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));
};
