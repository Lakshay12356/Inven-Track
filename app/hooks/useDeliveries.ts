'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  getDeliveryOrders, 
  createDeliveryOrder as apiCreateOrder, 
  updateOrderStatus as apiUpdateStatus,
  DeliveryOrder, 
  CreateOrderData 
} from '@/app/lib/api/deliveries';

export const useDeliveries = () => {
  const { user } = useUser();
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const email = user.emailAddresses?.[0]?.emailAddress;
      const data = await getDeliveryOrders(user.id, email);
      setDeliveries(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch delivery orders';
      setError(new Error(errorMessage));
      console.error('Error fetching delivery orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.emailAddresses]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (data: CreateOrderData) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const newOrder = await apiCreateOrder(data);
      setDeliveries(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      console.error('Error creating delivery order:', err);
      throw err;
    }
  };

  const setDeliveryStatus = async (orderId: string | number, status: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const updatedOrder = await apiUpdateStatus(String(orderId), status as any, user.id);
      setDeliveries(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      return updatedOrder;
    } catch (err) {
      console.error('Error updating delivery order status:', err);
      throw err;
    }
  };

  return {
    deliveries,
    loading,
    error,
    refreshDeliveries: fetchOrders,
    createOrder,
    setDeliveryStatus,
  };
};
