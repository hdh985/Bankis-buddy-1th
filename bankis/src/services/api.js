// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('buddy_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
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
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
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
  
};

// Content API
export const contentAPI = {
  getContents: (teamId) => apiClient.get(`/qna${teamId ? `?team=${teamId}` : ''}`),
  getContent: (id) => apiClient.get(`/qna/${id}`),
  createContent: (data) => apiClient.post('/qna', data),
  updateContent: (id, data) => apiClient.put(`/qna/${id}`, data),
  deleteContent: (id) => apiClient.delete(`/qna/${id}`),
  likeContent: (id) => apiClient.post(`/qna/${id}/like`),
};

// Chat API
export const chatAPI = {
  sendMessage: (message) => apiClient.post('/chat', { message }),

};

// Activity API
export const activityAPI = {
  getActivities: () => apiClient.get('/events'),
  createActivity: (data) => apiClient.post('/events', data),
  updateContent: (id, data) => apiClient.put(`/events/${id}`, data),
  deleteActivity: (id) => apiClient.delete(`/events/${id}`)
};

