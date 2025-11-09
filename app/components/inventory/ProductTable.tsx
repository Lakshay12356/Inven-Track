import React, { useMemo } from 'react';
import { Product } from '@/app/types';

interface ProductTableProps {
  products: Product[];
  searchTerm: string;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, searchTerm }) => {
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchTerm]);

  return (
    <div className="glass dark:glass-dark rounded-3xl shadow-lg overflow-hidden border border-white/30 dark:border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/20 dark:divide-white/10">
          <thead className="glass dark:glass-dark">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Product Name</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">SKU</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Stock</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Price</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 dark:divide-white/5">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="glass-hover hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-300">
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{product.name}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{product.sku}</td>
                <td className={`px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-semibold ${product.stock < 50 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                  {product.stock}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${product.price.toFixed(2)}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">{product.lastUpdated}</td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400 px-4">
                  No products found matching "{searchTerm}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;