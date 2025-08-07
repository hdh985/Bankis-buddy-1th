// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

 async request(endpoint, options = {}) {
  const url = `${this.baseURL}${endpoint}`;
  const token = localStorage.getItem('buddy_token');

  const noAuth = options.noAuth || false;
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(!noAuth && token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const fetchConfig = {
    method: options.method || 'GET',
    headers,
    body: options.body,
  };

  try {
    const response = await fetch(url, fetchConfig);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}


  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
  const isFormData = data instanceof FormData;

  return this.request(endpoint, {
    method: 'POST',
    body: isFormData ? data : JSON.stringify(data),
    headers: isFormData ? {} : { 'Content-Type': 'application/json' }, // FormData면 Content-Type 생략
  });
}


  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

const apiClient = new APIClient(API_BASE_URL);

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  verifyToken: () => apiClient.get('/auth/me'),
};

// Content API
export const contentAPI = {
  getContents: (teamId) => apiClient.get(`/qna${teamId ? `?team=${teamId}` : ''}`),
  getContent: (id) => apiClient.get(`/qna/${id}`),
  createContent: (data) => apiClient.post('/qna', data),
  updateContent: (id, data) => apiClient.put(`/qna/${id}`, data),
  deleteContent: (id) => apiClient.delete(`/qna/${id}`),
  likeContent: (id) => apiClient.post(`/qna/${id}/like`),
  // services/api.js 또는 api.ts


};

// Chat API
export const chatAPI = {
  sendMessage: (message) => apiClient.post('/chat', { message }),

};

// Activity API
export const activityAPI = {
  getActivities: () => apiClient.get('/events'),
  createActivity: (data) => apiClient.post('/events/form', data),
  updateContent: (id, data) => apiClient.put(`/events/${id}`, data),
  deleteActivity: (id) => apiClient.delete(`/events/${id}`)
};

