import http from './http';

export const register = async (data) => (await http.post('/api/auth/register', data)).data;
export const login = async (credentials) => {
  const res = await http.post('/api/auth/login', credentials);
  if (res.data?.token) localStorage.setItem('token', res.data.token);
  return res.data;
};

export const checkAvailability = async (params) => (await http.get('/api/auth/check', { params })).data;
export const updateProfile = async (data) => (await http.patch('/api/auth/profile', data)).data;