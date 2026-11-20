export interface Profile {
  id: string;
  email?: string;
  role: 'manager' | 'delivery_partner';
  company_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string | number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  buyPrice: number;
  lastUpdated: string;
}

export interface DeliveryPartner {
  id: string | number;
  name: string;
  rating: number;
  status: 'Active' | 'Pending Review';
  region: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  productsInStock: number;
  activeDeliveries: number;
  totalOrders?: number;
  inventoryValue?: number;
}

export type NavItem = {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
  comingSoon?: boolean;
  role?: 'manager' | 'delivery_partner';
};

export interface NewProductForm {
  name: string;
  sku: string;
  quantity: string;
  price: string;
}

export interface Notification {
  id: string | number;
  user_id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'new_assignment';
  read: boolean;
  created_at: string;
}
