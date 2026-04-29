import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/middleware';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  // Refresh Supabase session if needed
  const response = createClient(request);
  
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
  
  return response;
});

// Note: Profile routes are protected but use catch-all routing for Clerk's UserProfile component

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

