import api from './api';

export const getVirtualNumberPrices = () =>
  api.get('/admin/virtual-number-prices').then(r => r.data.data);

export const createVirtualNumberPrice = (data) =>
  api.post('/admin/virtual-number-prices', data).then(r => r.data.data);

export const updateVirtualNumberPrice = (id, data) =>
  api.put(`/admin/virtual-number-prices/${id}`, data).then(r => r.data.data);

export const deleteVirtualNumberPrice = (id) =>
  api.delete(`/admin/virtual-number-prices/${id}`).then(r => r.data);
