import http from './http';

export const fetchAdminData = async () => (await http.get('/api/admin/dashboard')).data;
export const listUsers = async (params = {}) => (await http.get('/api/admin/users', { params })).data;
export const listAdminSubmissions = async (params = {}) => (await http.get('/api/admin/submissions', { params })).data;
export const banUser = async (id) => (await http.post(`/api/admin/users/${id}/ban`)).data;
export const unbanUser = async (id) => (await http.post(`/api/admin/users/${id}/unban`)).data;