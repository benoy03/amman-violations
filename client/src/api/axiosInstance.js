import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// اعتراض الطلبات لإرفاق التوكن تلقائياً
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aml_auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// اعتراض الاستجابات للتعامل مع انتهاء الصلاحية
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('aml_auth_token');
      localStorage.removeItem('aml_user_info');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
