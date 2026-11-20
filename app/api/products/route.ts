import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { z } from 'zod';

const createSchema = z.object({
  name:     z.string().min(1).max(200).trim(),
  sku:      z.string().min(1).max(100).trim(),
  quantity: z.number().int().min(0).max(1_000_000),
  price:    z.number().min(0),
  buyPrice: z.number().min(0),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { name, sku, quantity, price, buyPrice } = parsed.data;
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .insert({ user_id: userId, name, sku, quantity, sale_price: price, buy_price: buyPrice })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
