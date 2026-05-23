import api from './api';

/**
 * Fetch products with optional filters.
 * Supported params:
 *   category (id), color, brand_name, search (title), locality,
 *   ordering (e.g. 'price_per_day' or '-price_per_day'), page
 */
export const fetchProducts = async (filters = {}) => {
  // Remove empty/null/undefined values so they don't pollute the query string
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  const res = await api.get('/products/', { params: cleanFilters });
  return res.data; // { count, next, previous, results: [...] }
};

export const fetchProductById = async (id) => {
  const res = await api.get(`/products/${id}/`);
  return res.data;
};

export const fetchCategories = async () => {
  const res = await api.get('/products/category/');
  return res.data;
};
 