import React from 'react';
import { Store, MapPin, Users, Clock } from 'lucide-react';

const BranchesContent: React.FC = () => (
  <div className="p-8 space-y-8">
    <div className="text-center space-y-4">
      <Store className="w-20 h-20 text-yellow-500 animate-pulse mx-auto" />
      <h1 className="text-5xl font-extrabold text-gray-800">Branches Management</h1>
      <p className="text-2xl text-gray-600">
        <span className="font-bold text-yellow-600">Coming Soon!</span> Manage multiple business locations from one place.
      </p>
    </div>

    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 max-w-4xl mx-auto rounded-lg">
      <div className="flex items-start">
        <Clock className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Feature Under Development</h3>
          <p className="text-yellow-700">
            We're actively working on this feature to bring multi-branch inventory sync, user roles per location, 
            and localized reporting. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {/* Feature Preview Cards */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Multi-Location Sync</h3>
        <p className="text-gray-600">
          Real-time inventory synchronization across all your business locations and warehouses.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Role-Based Access</h3>
        <p className="text-gray-600">
          Assign specific permissions and access levels to team members based on their location.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-4">
          <Store className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Localized Reporting</h3>
        <p className="text-gray-600">
          Generate detailed reports for individual branches or consolidated views across all locations.
        </p>
      </div>
    </div>

    <div className="bg-gray-50 p-8 rounded-xl max-w-4xl mx-auto text-center">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Stay Updated</h3>
      <p className="text-gray-600 mb-6">
        We'll notify you as soon as the Branches feature is ready. Expected launch: Q1 2026
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150">
          Notify Me When Ready
        </button>
        <button className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg shadow-md hover:bg-gray-700 transition duration-150">
          Learn More About Roadmap
        </button>
      </div>
    </div>
  </div>
);

export default BranchesContent;