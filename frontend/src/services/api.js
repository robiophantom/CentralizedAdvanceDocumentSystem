import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.cadms.mock',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
