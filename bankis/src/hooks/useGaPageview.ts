// src/hooks/useGaPageview.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window { dataLayer?: any[] }
}

export default function useGaPageview() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'virtual_page_view',   // ← GTM에서 이 이벤트명을 트리거로 사용
      page_path: pathname + search,
      page_location: window.location.href,
      page_title: document.title
    });
  }, [pathname, search]);
}
