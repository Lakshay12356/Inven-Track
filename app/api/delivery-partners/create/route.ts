import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { name, email, password, rating, status, region, clerkUserId } = await request.json();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized: Manager ID required' }, { status: 401 });
    }

    // 1. Create user in Clerk
    const client = await clerkClient();
    let user;
    try {
      user = await client.users.createUser({
        emailAddress: [email],
        password,
        firstName: name,
        publicMetadata: {
          role: 'delivery_partner',
          managerId: clerkUserId,
        },
      });
    } catch (clerkError: any) {
      console.error('Clerk user creation error:', clerkError);
      const message = clerkError.errors?.[0]?.longMessage || clerkError.message || 'Failed to create user in Clerk';
      return NextResponse.json({ error: message }, { status: 422 });
    }


    // 2. Sync to Supabase profiles table
    const supabase = await createServerSupabaseClient();
    
    const { error: userError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: email,
        role: 'delivery_partner',
      });

    if (userError) {
      console.error('Supabase user sync error:', userError);
      throw new Error(`Failed to sync user to database: ${userError.message}`);
    }

    // 3. Resolve Store ID (logic from existing addDeliveryPartner)
    let targetStoreId = null;
    const { data: userBranches } = await supabase.from('branches').select('id').eq('user_id', clerkUserId).limit(1).single();
    if (userBranches?.id) {
      const { data: userStores } = await supabase.from('stores').select('id').eq('branch_id', userBranches.id).limit(1).single();
      if (userStores?.id) {
        targetStoreId = userStores.id;
      }
    }

    if (!targetStoreId) {
      throw new Error('No store available to attach the delivery partner to. Please create a store first.');
    }

    // 4. Create delivery partner record
    const { data: partner, error: partnerError } = await supabase
      .from('delivery_partners')
      .insert({
        store_id: targetStoreId,
        clerk_user_id: user.id, // Link to auth user
        company_name: name,
        contact_info: email,
        rating: rating || 4.5,
        status: status || 'Active',
        region: region || 'Local Region',
      })
      .select()
      .single();

    if (partnerError) {
      console.error('Supabase partner creation error:', partnerError);
      throw new Error(`Failed to create partner record: ${partnerError.message}`);
    }

    return NextResponse.json(partner);
  } catch (error: any) {
    console.error('Error in delivery partner creation route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
