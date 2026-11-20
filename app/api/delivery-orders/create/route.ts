import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { z } from 'zod';

const LOW_STOCK_THRESHOLD = 10;

const schema = z.object({
  partnerId:       z.string().optional().nullable(),
  customerName:    z.string().min(1).max(200).trim(),
  customerAddress: z.string().min(1).max(500).trim(),
  customerPhone:   z.string().max(30).trim().optional().nullable(),
  items: z.array(z.object({
    productId: z.union([z.string(), z.number()]),
    quantity:  z.number().int().min(1).max(10000),
  })).min(1),
});

export async function POST(request: Request) {
  try {
    // H-02 fix: derive managerId from server-side auth, never from request body
    const { userId: managerId } = await auth();
    if (!managerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { partnerId, customerName, customerAddress, customerPhone, items } = parsed.data;

    const supabase = await createServerSupabaseClient();

    // 1. Create delivery order
    const { data: order, error: orderError } = await supabase
      .from('delivery_orders')
      .insert({
        manager_id:          managerId,
        delivery_partner_id: partnerId || null,
        customer_name:       customerName,
        customer_address:    customerAddress,
        customer_phone:      customerPhone,
        status:              partnerId ? 'assigned' : 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const { error: itemsError } = await supabase
      .from('delivery_order_items')
      .insert(items.map(item => ({
        order_id:   order.id,
        product_id: item.productId,
        quantity:   item.quantity,
      })));

    if (itemsError) throw itemsError;

    // 3. H-01 fix: atomic stock decrement via Postgres RPC (no race condition)
    for (const item of items) {
      const { data: newQty } = await supabase
        .rpc('decrement_product_quantity', { p_id: Number(item.productId), delta: item.quantity });

      // Fetch name/sku for notification message
      const { data: product } = await supabase
        .from('products')
        .select('name, sku')
        .eq('id', item.productId)
        .single();

      if (product && newQty !== null) {
        if (newQty > 0 && newQty <= LOW_STOCK_THRESHOLD) {
          await supabase.from('notifications').insert({
            user_id: managerId,
            title:   'Low Stock Alert',
            message: `${product.name} (${product.sku}) is low on stock — only ${newQty} units remaining.`,
            type:    'low_stock',
          });
        } else if (newQty === 0) {
          await supabase.from('notifications').insert({
            user_id: managerId,
            title:   'Out of Stock',
            message: `${product.name} (${product.sku}) is now out of stock.`,
            type:    'low_stock',
          });
        }
      }
    }

    // 4. Partner assignment notification
    if (partnerId) {
      const { data: partner } = await supabase
        .from('delivery_partners')
        .select('clerk_user_id')
        .eq('id', partnerId)
        .single();

      if (partner?.clerk_user_id) {
        await supabase.from('notifications').insert({
          user_id: partner.clerk_user_id,
          title:   'New Delivery Assigned',
          message: `Order #${order.id} for ${customerName} has been assigned to you.`,
          type:    'new_assignment',
        });
      }
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error creating delivery order:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
