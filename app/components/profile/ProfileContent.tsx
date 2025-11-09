import React from 'react';
import { User } from 'lucide-react';

const ProfileContent: React.FC = () => (
  <div className="p-8 space-y-6">
    <h1 className="text-4xl font-bold text-gray-800">User Profile</h1>
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col items-center border-b pb-6">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3">
          <User className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Alex Johnson</h2>
        <p className="text-gray-500">Inventory Manager | Global Ops</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Account Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <p className="font-medium text-gray-700">Email:</p>
          <p className="text-gray-600">alex.johnson@nexastock.com</p>

          <p className="font-medium text-gray-700">Role:</p>
          <p className="text-gray-600">Administrator</p>

          <p className="font-medium text-gray-700">Last Login:</p>
          <p className="text-gray-600">November 5, 2025</p>

          <p className="font-medium text-gray-700">Department:</p>
          <p className="text-gray-600">Inventory Management</p>

          <p className="font-medium text-gray-700">Employee ID:</p>
          <p className="text-gray-600">NS-EMP-0042</p>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150">
            Edit Profile
          </button>
          <button className="px-4 py-3 bg-gray-600 text-white font-medium rounded-lg shadow-md hover:bg-gray-700 transition duration-150">
            Change Password
          </button>
          <button className="px-4 py-3 bg-yellow-600 text-white font-medium rounded-lg shadow-md hover:bg-yellow-700 transition duration-150">
            Notification Settings
          </button>
          <button className="px-4 py-3 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition duration-150">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ProfileContent;