'use client';

import React from 'react';
import { UserProfile } from '@clerk/nextjs';

const ProfileContent: React.FC = () => (
  <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100">User Profile</h1>
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "shadow-lg rounded-3xl",
            },
          }}
        />
      </div>
    </div>
  </div>
);

export default ProfileContent;
