export interface Product {
    id: string | number;
    name: string;
    sku: string;
    stock: number;
    price: number;
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
    newCustomers: number;
    stockAlerts?: any[];
    dailyAnalytics?: any[];
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
    stock: string;
    price: string;
  }