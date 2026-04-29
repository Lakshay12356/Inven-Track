import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export const createServerSupabaseClient = async () => {
  const { getToken } = await auth();
  const token = await getToken({ template: 'supabase' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return createClient(supabaseUrl, supabaseKey as string, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};
