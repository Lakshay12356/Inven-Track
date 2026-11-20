'use client';

import { createClient } from '@/app/lib/supabase-client';
import { Notification } from '@/app/types';

export const getNotifications = async (clerkUserId: string): Promise<Notification[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', clerkUserId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return (data || []) as Notification[];
};

export const getUnreadCount = async (clerkUserId: string): Promise<number> => {
  const supabase = createClient();

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', clerkUserId)
    .eq('read', false);

  if (error) {
    console.error('Error counting notifications:', error);
    return 0;
  }

  return count || 0;
};

export const markAsRead = async (notificationId: string | number): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const markAllAsRead = async (clerkUserId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', clerkUserId)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: Notification['type']
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type,
    });

  if (error) {
    console.error('Error creating notification:', error);
  }
};

export const createLowStockNotification = async (
  managerId: string,
  productName: string,
  productSku: string,
  currentQuantity: number
): Promise<void> => {
  await createNotification(
    managerId,
    'Low Stock Alert',
    `${productName} (${productSku}) is low on stock — only ${currentQuantity} units remaining.`,
    'low_stock'
  );
};

export const createAssignmentNotification = async (
  partnerId: string,
  orderId: string | number,
  customerName: string
): Promise<void> => {
  await createNotification(
    partnerId,
    'New Delivery Assigned',
    `Order #${orderId} for ${customerName} has been assigned to you.`,
    'new_assignment'
  );
};
