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
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">Inventory List</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Search Input */}
      <div className="flex max-w-md bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <Search className="w-5 h-5 text-gray-400 m-3" />
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 text-gray-700 focus:outline-none"
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