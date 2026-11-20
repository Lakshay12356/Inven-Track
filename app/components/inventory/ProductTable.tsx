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
    <div className="bg-white/45 dark:bg-white/[0.04] backdrop-blur-2xl dark:backdrop-blur-3xl rounded-2xl border border-white/50 dark:border-white/[0.07] dark:border-t-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/30 dark:divide-white/[0.04]">
          <thead>
            <tr className="bg-white/30 dark:bg-white/[0.02]">
              <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider">Product Name</th>
              <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider">SKU</th>
              <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider">Quantity</th>
              <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider">Buy Price</th>
              <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider">Sell Price</th>
              <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider">Profit</th>
              <th className="px-4 sm:px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 dark:text-white/30 uppercase tracking-wider hidden sm:table-cell">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50 dark:divide-white/[0.03]">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-white/40 dark:hover:bg-white/[0.03] transition-colors duration-200">
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white/85">{product.name}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white/35 font-mono">{product.sku}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${product.quantity < 50 ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${product.quantity < 50 ? 'bg-red-400 dark:shadow-[0_0_4px_rgba(239,68,68,0.4)]' : 'bg-emerald-400 dark:shadow-[0_0_4px_rgba(52,211,153,0.4)]'}`} />
                    {product.quantity}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-white/50 font-medium">${product.buyPrice?.toFixed(2) || '0.00'}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-white/50 font-medium">${product.price.toFixed(2)}</td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center text-xs font-bold ${product.price - (product.buyPrice || 0) > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    ${(product.price - (product.buyPrice || 0)).toFixed(2)}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-white/25 hidden sm:table-cell">{product.lastUpdated}</td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 dark:text-white/25 px-4">
                  No products found matching &quot;{searchTerm}&quot;.
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
