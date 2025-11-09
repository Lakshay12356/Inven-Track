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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100">Inventory List</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 sm:px-6 py-2 sm:py-3 glass dark:glass-dark glass-hover text-gray-700 dark:text-gray-200 font-medium rounded-2xl shadow-lg hover:bg-white/90 dark:hover:bg-white/10 transition-all duration-300 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Search Input */}
      <div className="flex w-full sm:max-w-md glass dark:glass-dark rounded-2xl shadow-lg overflow-hidden border border-white/30 dark:border-white/10">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 m-3 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 text-sm sm:text-base text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Product Table */}
      <ProductTable 
        products={products} 
        searchTerm={searchTerm} 
      />

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