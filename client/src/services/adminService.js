import http from './http';

export const fetchAdminData = async () => (await http.get('/api/admin/dashboard')).data;
export const listUsers = async (params = {}) => (await http.get('/api/admin/users', { params })).data;
// Submissions endpoint removed; do not call it from client.
export const banUser = async (id) => (await http.post(`/api/admin/users/${id}/ban`)).data;
export const unbanUser = async (id) => (await http.post(`/api/admin/users/${id}/unban`)).data;