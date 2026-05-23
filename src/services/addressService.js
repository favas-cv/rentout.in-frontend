import api from './api';

export const fetchAddresses = async () => {
  const res = await api.get('/address/');
  return res.data;
};

export const createAddress = async (data) => {
  const res = await api.post('/address/', data);
  return res.data;
};

export const updateAddress = async ({ id, data }) => {
  const res = await api.put(`/address/${id}/`, data);
  return res.data;
};

export const deleteAddress = async (id) => {
  const res = await api.delete(`/address/${id}/`);
  return res.data;
};
