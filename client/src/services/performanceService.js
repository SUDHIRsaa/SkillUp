import http from './http';

export const fetchPerformance = async () => (await http.get('/api/performance/me')).data;