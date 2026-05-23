import api from './api';

/**
 * Fetch the user's KYC verification documents and status.
 */
export const fetchKYCDocuments = async () => {
  const res = await api.get('/kyc/docs/');
  return res.data;
};

/**
 * Upload KYC verification documents (Aadhaar, PAN, and selfie).
 * Supports image file uploads via FormData.
 */
export const addKYCDocuments = async (formData) => {
  const res = await api.post('/kyc/add-docs/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

/**
 * Fetch all KYC verification documents for admin review.
 */
export const fetchAdminKYCDocuments = async () => {
  const res = await api.get('/admin/kyc/');
  return res.data;
};

/**
 * Update the status of a specific KYC document.
 */
export const updateAdminKYCStatus = async (pk, status) => {
  const res = await api.patch(`/admin/kyc/docs-update/${pk}/`, { status });
  return res.data;
};

/**
 * Fetch all products for admin review.
 */
export const fetchAdminProducts = async () => {
  const res = await api.get('/admin/products/');
  return res.data;
};

/**
 * Update active or featured/trending/seasonal status of a product.
 */
export const updateAdminProduct = async (pk, data) => {
  const res = await api.patch(`/admin/products/${pk}/`, data);
  return res.data;
};

/**
 * Fetch all users for admin view.
 */
export const fetchAdminUsers = async () => {
  const res = await api.get('/admin/users/');
  return res.data;
};

/**
 * Update active status of a user.
 */
export const updateAdminUser = async (pk, data) => {
  const res = await api.patch(`/admin/users/${pk}/`, data);
  return res.data;
};


