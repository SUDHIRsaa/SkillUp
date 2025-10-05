import http from './http';

export const fetchQuestions = async (params = {}) => {
	const res = await http.get('/api/questions', { params });
	const data = res.data;
	return Array.isArray(data) ? data : (data?.items || []);
};