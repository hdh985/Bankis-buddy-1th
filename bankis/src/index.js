// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 성능 측정 (선택사항)
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// React 18의 createRoot 사용
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 성능 측정 시작 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  reportWebVitals(console.log);
}

// 에러 바운더리
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// PWA 업데이트 감지
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // 새 버전이 활성화되면 페이지 새로고침 안내
    if (window.confirm('새 버전이 사용 가능합니다. 페이지를 새로고침하시겠습니까?')) {
      window.location.reload();
    }
  });
}