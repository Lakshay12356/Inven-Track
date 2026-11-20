import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { z } from 'zod';

const VALID_STATUSES = ['pending', 'assigned', 'in_transit', 'completed', 'cancelled'] as const;

const schema = z.object({
  orderId: z.union([z.string(), z.number()]),
  status: z.enum(VALID_STATUSES),
});

export async function PATCH(request: Request) {
  try {
    // H-02/H-03: derive identity from server-side auth, never from request body
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { orderId, status } = parsed.data;

    const supabase = await createServerSupabaseClient();

    // Verify ownership or assignment before updating
    const { data: order, error: fetchError } = await supabase
      .from('delivery_orders')
      .select('manager_id, delivery_partner_id')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let authorized = order.manager_id === userId;
    if (!authorized && order.delivery_partner_id) {
      const { data: partner } = await supabase
        .from('delivery_partners')
        .select('clerk_user_id')
        .eq('id', order.delivery_partner_id)
        .single();
      if (partner?.clerk_user_id === userId) authorized = true;
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
