import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Groups API
export const groupsApi = {
  list: () => axios.get(`${API}/groups`),
  get: (id) => axios.get(`${API}/groups/${id}`),
  create: (data) => axios.post(`${API}/groups`, data),
  update: (id, data) => axios.put(`${API}/groups/${id}`, data),
  delete: (id) => axios.delete(`${API}/groups/${id}`),
  addMember: (groupId, email) => axios.post(`${API}/groups/${groupId}/members`, { email }),
  removeMember: (groupId, userId) => axios.delete(`${API}/groups/${groupId}/members/${userId}`),
  getBalances: (groupId) => axios.get(`${API}/groups/${groupId}/balances`),
};

// Expenses API
export const expensesApi = {
  list: (groupId) => axios.get(`${API}/expenses?group_id=${groupId}`),
  create: (data) => axios.post(`${API}/expenses`, data),
  update: (id, data) => axios.put(`${API}/expenses/${id}`, data),
  delete: (id) => axios.delete(`${API}/expenses/${id}`),
};

// Settlements API
export const settlementsApi = {
  list: (groupId) => axios.get(`${API}/settlements?group_id=${groupId}`),
  create: (data) => axios.post(`${API}/settlements`, data),
};

// Dashboard API
export const dashboardApi = {
  get: () => axios.get(`${API}/dashboard`),
};
