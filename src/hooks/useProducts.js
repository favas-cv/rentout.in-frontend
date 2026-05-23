import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { selectApiParams } from '../store/filterSlice';
import { fetchProducts } from '../services/productService';

/**
 * useProducts — single source of truth for product data.
 *
 * Reads the clean API params from Redux (via selectApiParams selector),
 * uses them as the queryKey so TanStack Query only re-fetches when params change.
 *
 * Returns the full query object so the caller can access isLoading, isError, etc.
 */
export function useProducts() {
  const params = useSelector(selectApiParams);

  return useQuery({
    queryKey: ['products', params],
    queryFn:  () => fetchProducts(params),
    // Keep the previous page data visible while new data loads (no flash)
    placeholderData: (prev) => prev,
    staleTime: 30_000, // 30s — avoid redundant refetches on component remount
  });
}
 