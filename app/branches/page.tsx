'use client';

import React from 'react';
import AppLayout from '@/app/components/layout/AppLayout';
import BranchesContent from '@/app/components/branches/BranchesContent';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function BranchesPage() {
  return (
    <AppLayout>
      <BranchesContent />
    </AppLayout>
  );
}


