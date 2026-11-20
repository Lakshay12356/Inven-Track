import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { z } from 'zod';

const updateSchema = z.object({
  name:     z.string().min(1).max(200).trim().optional(),
  sku:      z.string().min(1).max(100).trim().optional(),
  quantity: z.number().int().min(0).max(1_000_000).optional(),
  price:    z.number().min(0).optional(),
  buyPrice: z.number().min(0).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.name     !== undefined) updates.name       = parsed.data.name;
    if (parsed.data.sku      !== undefined) updates.sku        = parsed.data.sku;
    if (parsed.data.quantity !== undefined) updates.quantity   = parsed.data.quantity;
    if (parsed.data.price    !== undefined) updates.sale_price = parsed.data.price;
    if (parsed.data.buyPrice !== undefined) updates.buy_price  = parsed.data.buyPrice;

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)   // ownership check — RLS also enforces this
      .select()
      .single();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('PATCH /api/products/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
