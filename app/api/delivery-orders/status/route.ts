import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';

export async function PATCH(request: Request) {
  try {
    const { orderId, status, clerkUserId } = await request.json();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const supabase = await createServerSupabaseClient();

    // Verify ownership or assignment
    const { data: order, error: fetchError } = await supabase
      .from('delivery_orders')
      .select('manager_id, delivery_partner_id')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if the user is the manager or the assigned partner
    let authorized = order.manager_id === clerkUserId;
    if (!authorized && order.delivery_partner_id) {
      const { data: partner } = await supabase
        .from('delivery_partners')
        .select('clerk_user_id')
        .eq('id', order.delivery_partner_id)
        .single();
      
      if (partner?.clerk_user_id === clerkUserId) {
        authorized = true;
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized to update this order' }, { status: 403 });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('delivery_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('Error updating delivery order status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
