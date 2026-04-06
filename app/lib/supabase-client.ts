'use client';

import { createBrowserClient } from '@supabase/ssr';

declare global {
  interface Window {
    Clerk: any;
  }
}

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      global: {
        fetch: async (url, options = {}) => {
          // Fetch the Clerk token transparently
          let clerkToken = null;
          try {
            if (typeof window !== 'undefined' && window.Clerk?.session) {
              clerkToken = await window.Clerk.session.getToken({ template: 'supabase' });
            }
          } catch (e) {
            console.error('Failed to grab Clerk JWT', e);
          }

          const headers = new Headers(options?.headers);
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
};

