import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { 
      managerId, 
      partnerId, 
      customerName, 
      customerAddress, 
      customerPhone, 
      items 
    } = await request.json();

    if (!managerId) {
      return NextResponse.json({ error: 'Unauthorized: Manager ID required' }, { status: 401 });
    }


    const supabase = await createServerSupabaseClient();

    // 1. Create delivery order
    const { data: order, error: orderError } = await supabase
      .from('delivery_orders')
      .insert({
        manager_id: managerId,
        delivery_partner_id: partnerId || null,
        customer_name: customerName,
        customer_address: customerAddress,
        customer_phone: customerPhone,
        status: partnerId ? 'assigned' : 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('delivery_order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Resolve Store ID for inventory movements
    // Find a default store for this manager to pull stock from
    const { data: userBranches } = await supabase.from('branches').select('id').eq('user_id', managerId).limit(1).single();
    let fromStoreId = null;
    if (userBranches?.id) {
      const { data: userStores } = await supabase.from('stores').select('id').eq('branch_id', userBranches.id).limit(1).single();
      if (userStores?.id) {
        fromStoreId = userStores.id;
      }
    }

    // 4. Create inventory movements
    if (fromStoreId) {
      const movements = items.map((item: any) => ({
        product_id: item.productId,
        from_store_id: fromStoreId,
        delivery_partner_id: partnerId || null,
        delivery_order_id: order.id,
        type: 'fulfillment',
        quantity: item.quantity,
      }));

      const { error: movementsError } = await supabase
        .from('inventory_movements')
        .insert(movements);

      if (movementsError) {
        console.error('Movement creation error:', movementsError);
        // We continue anyway as the order is created, but log the error
      }
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error creating delivery order:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
