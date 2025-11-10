'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Loading from '@/app/components/ui/Loading';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isLoaded, isSignedIn, router]);

  return <Loading size="lg" text="Loading..." fullScreen />;
}