import { AnalyticsData } from '@/app/types';
import { supabase } from '@/app/lib/supabase';

export const getAnalytics = async (clerkUserId: string, email?: string): Promise<AnalyticsData> => {
  // 1. Total Revenue & Gross Profit from the daily_analytics view
  const { data: analyticsData } = await supabase
    .from('tenant_daily_analytics')
    .select('daily_revenue, daily_profit')
    .eq('user_id', clerkUserId);

  const totalRevenue = analyticsData?.reduce((sum, day) => sum + Number(day.daily_revenue), 0) || 0;

  // 2. Products In Stock (Total unique products with quantity > 0)
  const { data: stockData } = await supabase
    .from('products')
    .select('id, stock_levels(quantity)')
    .eq('user_id', clerkUserId);

  const productsInStock = stockData?.filter(p => 
    (p.stock_levels as any[])?.reduce((sum, s) => sum + s.quantity, 0) > 0
  ).length || 0;

  // 3. Stock Alerts (Items < 50)
  const { data: stockAlerts } = await supabase
    .from('tenant_stock_alerts')
    .select('*')
    .eq('user_id', clerkUserId);

  // 4. Placeholder values for Deliveries and Customers (can be updated as those features are built)
  const activeDeliveries = 0;
  const newCustomers = 0;

  return {
    totalRevenue: totalRevenue || 0,
    productsInStock: productsInStock || 0,
    activeDeliveries: activeDeliveries || 0,
    newCustomers: newCustomers || 0,
    stockAlerts: stockAlerts || [],
    dailyAnalytics: analyticsData || []
  };
};

