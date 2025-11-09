import { Product, DeliveryPartner, AnalyticsData } from '@/app/types';

export const initialProducts: Product[] = [
  { id: 1, name: 'Wireless Mouse Pro', sku: 'WM-001', stock: 150, price: 29.99, lastUpdated: '2025-10-25' },
  { id: 2, name: 'Mechanical Keyboard TKL', sku: 'MK-102', stock: 75, price: 89.99, lastUpdated: '2025-10-28' },
  { id: 3, name: '4K Ultra Monitor 32"', sku: 'MU-320', stock: 30, price: 499.99, lastUpdated: '2025-11-01' },
  { id: 4, name: 'USB-C Docking Station', sku: 'DS-500', stock: 210, price: 59.99, lastUpdated: '2025-11-03' },
  { id: 5, name: 'Noise Cancelling Headset', sku: 'NC-H11', stock: 95, price: 129.99, lastUpdated: '2025-11-05' },
];

export const initialPartners: DeliveryPartner[] = [
  { id: 101, name: 'Swift Logistics Inc.', rating: 4.8, status: 'Active', region: 'North America' },
  { id: 102, name: 'Reliable Couriers Co.', rating: 4.1, status: 'Pending Review', region: 'Europe' },
  { id: 103, name: 'Global Haulers Ltd.', rating: 4.9, status: 'Active', region: 'Asia-Pacific' },
];

export const mockAnalytics: AnalyticsData = {
  totalRevenue: 750000,
  productsInStock: 560,
  activeDeliveries: 124,
  newCustomers: 350,
};