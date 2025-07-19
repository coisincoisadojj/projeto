import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // ajuste conforme backend
});

export default api;
import api from './api';

const handleLogin = async () => {
  const res = await api.post('/login', { email, senha });
  localStorage.setItem('token', res.data.token);
};
