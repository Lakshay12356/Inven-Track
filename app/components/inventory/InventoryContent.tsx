'use client';

import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Product } from '@/app/types';
import ProductTable from '@/app/components/inventory/ProductTable';
import AddProductModal from '@/app/components/inventory/AddProductModal';

interface InventoryContentProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
}

const InventoryContent: React.FC<InventoryContentProps> = ({ products, setProducts, addProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white">Inventory List</h1>
          <p className="text-gray-500 dark:text-white/35 mt-1 text-sm">Manage and track all your products</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200 text-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Search Input */}
      <div className="flex w-full sm:max-w-md bg-white/40 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl rounded-xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-200 focus-within:bg-white/60 dark:focus-within:bg-white/[0.07] focus-within:border-blue-300/40 dark:focus-within:border-indigo-500/30 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.06)] dark:focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <Search className="w-4 h-4 text-gray-400 dark:text-white/25 m-3 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2.5 pr-3 text-sm text-gray-700 dark:text-white/80 bg-transparent focus:outline-none placeholder-gray-400 dark:placeholder-white/20"
        />
      </div>

      {/* Product Table */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <ProductTable 
          products={products} 
          searchTerm={searchTerm} 
        />
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProduct={addProduct}
      />
    </div>
  );
};

export default InventoryContent;