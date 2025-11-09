export interface Product {
    id: number;
    name: string;
    sku: string;
    stock: number;
    price: number;
    lastUpdated: string;
  }
  
  export interface DeliveryPartner {
    id: number;
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
  }
  
  export type NavItem = {
    name: string;
    icon: React.ComponentType<any>;
    comingSoon?: boolean;
  };
  
  export interface NewProductForm {
    name: string;
    sku: string;
    stock: string;
    price: string;
  }