import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/auth',  // Porta 5000 para o backend
});

export default api;
