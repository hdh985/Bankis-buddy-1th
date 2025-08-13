// src/services/api.js

// ==============================
// Base URL 설정
// ==============================
const RAW_BASE = process.env.REACT_APP_API_URL || 'https://34.47.66.169.sslip.io/api';

// 1) 끝 슬래시 제거 + http를 https로 강제 변환
const API_BASE_URL = (RAW_BASE || '')
  .replace(/\/+$/, '')              // 끝 슬래시 제거
  .replace(/^http:\/\//, 'https://'); // Mixed Content 방지

// 2) 페이지가 https이면 API도 반드시 https
if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
  if (API_BASE_URL.startsWith('http://')) {
    console.error(`[API] Mixed Content 방지: API_BASE_URL이 http입니다 → ${API_BASE_URL}`);
  }
}

// ==============================
// URL/쿼리 유틸
// ==============================
function joinURL(base, endpoint) {
  const b = base.replace(/\/+$/, '');
  const e = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${b}${e}`;
}

function toQuery(params) {
  if (!params) return '';
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const val = typeof v === 'object'
      ? (v.id ?? v.value ?? JSON.stringify(v))
      : v;
    usp.append(k, String(val));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

// ==============================
// API Client 클래스
// ==============================
class APIClient {
  constructor(baseURL) {
    this.baseURL = (baseURL || '').replace(/\/+$/, '');
    this.defaultTimeoutMs = 10_000; // 10초
  }

  async request(endpoint, { method = 'GET', headers = {}, body, noAuth = false, timeoutMs } = {}) {
    const url = joinURL(this.baseURL, endpoint);

    const token = typeof window !== 'undefined' ? localStorage.getItem('buddy_token') : null;
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const finalHeaders = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(!noAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs ?? this.defaultTimeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers: finalHeaders,
        body,
        signal: controller.signal,
      });

      if (!res.ok) {
        let errMsg = 'API request failed';
        try {
          const errJson = await res.json();
          errMsg = errJson.message || errMsg;
        } catch { /* noop */ }
        throw new Error(errMsg);
      }
      return await res.json();
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  get(endpoint, params) {
    const qs = toQuery(params);
    return this.request(`${endpoint}${qs}`);
  }

  post(endpoint, data, options = {}) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data ?? {}),
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      ...options,
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data ?? {}),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// ==============================
// API 인스턴스 생성
// ==============================
const apiClient = new APIClient(API_BASE_URL);

// ==============================
// API 모듈 정의
// ==============================

// Auth API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  verifyToken: () => apiClient.get('/auth/me'),
};

// Content API
export const contentAPI = {
  getContents: (teamId) => {
    const teamParam =
      teamId && typeof teamId === 'object' ? (teamId.id ?? teamId.value) : teamId;
    return apiClient.get('/qna', teamParam ? { team: teamParam } : undefined);
  },
  getContent: (id) => apiClient.get(`/qna/${encodeURIComponent(id)}`),
  createContent: (data) => apiClient.post('/qna', data),
  updateContent: (id, data) => apiClient.put(`/qna/${encodeURIComponent(id)}`, data),
  deleteContent: (id) => apiClient.delete(`/qna/${encodeURIComponent(id)}`),
  likeContent: (id) => apiClient.post(`/qna/${encodeURIComponent(id)}/like`),
};

// Chat API
export const chatAPI = {
  sendMessage: (message) => apiClient.post('/chat', { message }),
};

// Activity API
export const activityAPI = {
  getActivities: () => apiClient.get('/events'),
  createActivity: (data) => apiClient.post('/events/form', data),
  updateContent: (id, data) => apiClient.put(`/events/${encodeURIComponent(id)}`, data),
  deleteActivity: (id) => apiClient.delete(`/events/${encodeURIComponent(id)}`),
};
