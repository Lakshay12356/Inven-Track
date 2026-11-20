import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { z } from 'zod';

const createSchema = z.object({
  name:     z.string().min(1).max(200).trim(),
  location: z.string().max(500).trim().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { name, location } = parsed.data;
    const supabase = await createServerSupabaseClient();

    const { data: branch, error } = await supabase
      .from('branches')
      .insert({ user_id: userId, name, location: location || null })
      .select()
      .single();

    if (error) throw error;

    // Auto-create a warehouse store for the new branch
    await supabase
      .from('stores')
      .insert({ branch_id: branch.id, name: `${name} Store`, type: 'warehouse_store' })
      .then(({ error: storeError }) => {
        if (storeError) console.error('Failed to auto-create store:', storeError);
      });

    return NextResponse.json(branch, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/branches error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
