// src/services/api.js

// axios 미사용 → 제거
// import axios from 'axios';

const RAW_BASE = process.env.REACT_APP_API_URL || 'https://34.47.66.169.sslip.io/api';

// 1) base URL 정규화: 끝 슬래시 제거
const NORMALIZED_BASE = (RAW_BASE || '').replace(/\/+$/, '');

// 2) HTTPS 강제: 페이지가 https이면 API도 https 아니면 에러(혼합콘텐츠 방지)
if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
  if (NORMALIZED_BASE.startsWith('http://')) {
    console.error(`[API] Mixed Content 방지: API_BASE_URL이 http입니다 → ${NORMALIZED_BASE}`);
    // 필요 시 자동 변환 (원치 않으면 throw로 교체)
    // throw new Error('API_BASE_URL must be HTTPS on HTTPS pages');
  }
}

// 3) 유틸: endpoint 결합 (/ 중복/누락 방지)
function joinURL(base, endpoint) {
  const b = base.replace(/\/+$/, '');
  const e = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${b}${e}`;
}

// 4) 유틸: 쿼리스트링 안전 생성
function toQuery(params) {
  if (!params) return '';
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    // 객체가 오면 id나 value로 안전 처리 (필요에 맞게 조절)
    const val =
      typeof v === 'object'
        ? (v.id ?? v.value ?? JSON.stringify(v))
        : v;
    usp.append(k, String(val));
  });
  const s = usp.toString();
  return s ? `?${s}` : '';
}

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
      // FormData일 때는 Content-Type 자동 설정되므로 지정 금지
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
      // JSON 이외 응답 대비 (필요 시 수정)
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

const apiClient = new APIClient(NORMALIZED_BASE);

// ===== Auth API =====
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  verifyToken: () => apiClient.get('/auth/me'),
};

// ===== Content API =====
// teamId가 객체일 수 있으니 여기서 안전하게 처리: { team: string|number }
export const contentAPI = {
  // 사용처: contentAPI.getContents(teamId) 또는 contentAPI.getContents({ id: 'bankis' })
  getContents: (teamId) => {
    // teamId가 값이면 team=teamId, 객체면 team=teamId.id 우선
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

// ===== Chat API =====
export const chatAPI = {
  // 백엔드가 /chat 또는 /chat/ 중 무엇이든 받도록 endpoint는 슬래시 없는 형태 유지
  sendMessage: (message) => apiClient.post('/chat', { message }),
};

// ===== Activity API =====
export const activityAPI = {
  getActivities: () => apiClient.get('/events'),
  createActivity: (data) => apiClient.post('/events/form', data),
  updateContent: (id, data) => apiClient.put(`/events/${encodeURIComponent(id)}`, data),
  deleteActivity: (id) => apiClient.delete(`/events/${encodeURIComponent(id)}`),
};
