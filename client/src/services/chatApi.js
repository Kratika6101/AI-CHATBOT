import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function sendMessage({ message, signal, sessionId }) {
  const response = await api.post('/chat', { message, sessionId }, { signal });
  return response.data;
}

export async function checkHealth() {
  const response = await api.get('/health');
  return response.data;
}

export default api;