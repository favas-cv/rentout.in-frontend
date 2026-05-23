import api from './api';

export const fetchCart = async () => {
  const res = await api.get('/cart/');
  return res.data; // { items: [...] }
};

export const addToCart = async ({ productId, quantity = 1 }) => {
  const res = await api.post('/cart/', { product_id: productId, quantity });
  return res.data;
};

export const removeFromCart = async (itemId) => {
  const res = await api.delete(`/cart/${itemId}/`);
  return res.data;
};

export const clearCart = async () => {
  const res = await api.delete('/cart/clear/');
  return res.data;
};


export const fetchwishlist = async () => {
  const res = await api.get('/cart/wishlist/');
  return res.data;
};

export const removefromwishlist = async ({ productId }) => {
  const res = await api.delete(`/cart/wishlist/`, { data: { product_id: productId } });
  return res.data;
};

export const addtowishlist = async ({ productId }) => {
  const res = await api.post(`/cart/wishlist/`, { product_id: productId });
  return res.data;
};
