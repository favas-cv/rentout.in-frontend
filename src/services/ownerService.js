import api from './api';

/**
 * Fetch products owned by the current user.
 */
export const fetchOwnerProducts = async () => {
  const res = await api.get('/owner/products/');
  return res.data;
};

/**
 * Fetch owner dashboard statistics.
 */
export const fetchOwnerDashboard = async () => {
  const res = await api.get('/owner/dashboard/');
  return res.data;
};

/**
 * Fetch orders received for owner's products.
 */
export const fetchOwnerOrders = async () => {
  const res = await api.get('/owner/orders/');
  return res.data;
};

/**
 * Create a new product listing.
 * Supports multi-image upload via FormData.
 */
export const createProduct = async (formData) => {
  const res = await api.post('/owner/products/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

/**
 * Delete a product listing.
 */
export const deleteProduct = async (id) => {
  await api.delete(`/owner/products/${id}/`);
};

/**
 * Update an existing product listing.
 * Supports partial updates and file uploads via FormData.
 */
export const updateProduct = async ({ id, formData }) => {
  const res = await api.patch(`/owner/products/${id}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const updateOrderStatus = async (orderId, statusData) => {
  const res = await api.patch(`/owner/orders/${orderId}/`, statusData);
  return res.data;
};

