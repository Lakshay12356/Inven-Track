'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Product } from '@/app/types';
import { getProducts, addProduct as addProductToDB } from '@/app/lib/api/products';

export const useProducts = () => {
  const { user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const email = user.emailAddresses?.[0]?.emailAddress;
        const data = await getProducts(user.id, email);
        setProducts(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
        setError(new Error(errorMessage));
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user?.id, user?.emailAddresses]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      const email = user.emailAddresses?.[0]?.emailAddress;
      const newProduct = await addProductToDB(product, user.id, email);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add product'));
      throw err;
    }
  };

  return {
    products,
    setProducts,
    addProduct,
    loading,
    error,
  };
};