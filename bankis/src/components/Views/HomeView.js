// src/components/Views/HomeView.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, MessageCircle, ChevronRight, Star, Heart, MessageSquare, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { contentAPI, activityAPI } from '../../services/api';
import hankuk from '../../assets/hankuk.png';

const HomeView = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();

  // 대시보드 지표
  const [stats, setStats] = useState({ contentViews: 0, aiResponses: 0, messages: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsErr, setStatsErr] = useState('');

  // 핫한 질문(QnA)
  const [popularContents, setPopularContents] = useState([]);
  const [hotLoading, setHotLoading] = useState(true);
  const [hotErr, setHotErr] = useState('');

  // 최초 로드
  useEffect(() => {
    const controller = new AbortController();
    fetchStats(controller.signal);
    fetchHot(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 지표 불러오기
  const fetchStats = async (signal) => {
    setStatsLoading(true);
    setStatsErr('');
    try {
      // 예시: 백엔드에 맞게 수정 가능
      // 기대 응답: { contentViews: number, aiResponses: number, messages: number }
      const res = await (activityAPI?.getStats
        ? activityAPI.getStats({ scope: 'home' }, { signal })
        : Promise.resolve({ data: { contentViews: 47, aiResponses: 128, messages: 234 } })
      );

      const data = res?.data ?? res ?? {};
      setStats({
        contentViews: Number(data.contentViews ?? 0),
        aiResponses: Number(data.aiResponses ?? 0),
        messages: Number(data.messages ?? 0),
      });
    } catch (e) {
      if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
        console.error(e);
        setStatsErr('지표를 불러오지 못했어요.');
      }
    } finally {
      setStatsLoading(false);
    }
  };

  // 핫한 질문 불러오기 (좋아요 상위)
  const fetchHot = async (signal) => {
    setHotLoading(true);
    setHotErr('');
    try {
      // 예시: 기대 응답
      // { items: [{ id, title, category, author, team, likes, comments, readTime, thumbnail }] }
      const res = await (contentAPI?.getQnaHot
        ? contentAPI.getQnaHot({ limit: 5 }, { signal })
        : Promise.resolve({
            data: {
              items: [
                {
                  id: 1, title: 'React 18의 새로운 기능과 성능 최적화', category: '프론트엔드',
                  author: '김개발', team: '1조', likes: 124, comments: 18, readTime: '8분', thumbnail: 'bg-blue-100'
                },
                {
                  id: 2, title: 'UX/UI 디자인 시스템 구축하기', category: '디자인',
                  author: '이디자인', team: '2조', likes: 156, comments: 34, readTime: '10분', thumbnail: 'bg-purple-100'
                },
              ]
            }
          })
      );

      const raw = res?.data?.items ?? res?.items ?? [];
      const normalized = raw.map((it) => ({
        id: it.id,
        title: it.title,
        category: it.category ?? '기타',
        author: it.author ?? '익명',
        team: it.team ?? '-',
        likes: Number(it.likes ?? 0),
        comments: Number(it.comments ?? 0),
        readTime: it.readTime ?? '',
        thumbnail: it.thumbnail ?? 'bg-blue-50',
      }));

      // 좋아요 내림차순 정렬 + 상위 5개
      const sorted = normalized.sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
      setPopularContents(sorted);
    } catch (e) {
      if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
        console.error(e);
        setHotErr('핫한 질문을 불러오지 못했어요.');
      }
    } finally {
      setHotLoading(false);
    }
  };

  const refreshAll = () => {
    const controller = new AbortController();
    fetchStats(controller.signal);
    fetchHot(controller.signal);
  };

  // 단일 퀵 메뉴 (챗봇 진입)
  const chatAction = useMemo(
    () => ({ icon: MessageCircle, label: 'AI 챗봇', action: () => onNavigate?.('chat') }),
    [onNavigate]
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {/* 상단 인사/지표 */}
      {isAdmin ? (
        <div className="mx-6 mb-4 rounded-2xl bg-white/80 p-4 shadow-md ring-1 ring-gray-100 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="mb-1 text-lg font-bold text-gray-900">
                안녕하세요, {user?.name || '버디 활동 인원'}님! 👋
              </h2>
              <p className="text-sm text-blue-600">관리자 권한으로 모든 기능을 이용할 수 있습니다</p>
            </div>
            <button
              onClick={refreshAll}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              title="새로고침"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </button>
          </div>

          <StatsRow
            loading={statsLoading}
            error={statsErr}
            stats={stats}
            admin
          />
        </div>
      ) : (
        <div className="mx-6 mb-4 rounded-2xl bg-white p-4 shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="mb-1 text-lg font-bold text-gray-800">익명 사용자님 환영합니다! 👋</h2>
              <p className="text-sm text-gray-600">AI 어시스턴트와 함께하는 커리어 성장 여정</p>
            </div>
            <button
              onClick={refreshAll}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              title="새로고침"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </button>
          </div>

          <StatsRow
            loading={statsLoading}
            error={statsErr}
            stats={stats}
          />
        </div>
      )}

      {/* 한국이 카드 (챗봇 진입) */}
      <div className="mt-2 flex justify-center px-6">
        <button
          onClick={chatAction.action}
          className="group w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition hover:shadow-lg"
        >
          <div className="flex flex-col items-center gap-3">
            <img
              src={hankuk}
              alt="AI 캐릭터"
              className="h-56 w-56 object-contain transition-transform group-hover:scale-[1.02]"
            />
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">한국이</span>
            </div>
            <p className="text-center text-sm text-gray-500">
              한국투자증권 뱅키스 버디 AI 한국이
            </p>
          </div>
        </button>
      </div>

      {/* 핫한 질문 */}
      <div className="mt-6 px-4">
        <div className="mb-3 flex items-center justify-between px-2">
          <h2 className="text-lg font-bold text-gray-900">🔥 실시간 핫한 질문</h2>
          <button
            onClick={() => onNavigate?.('content')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            전체보기 <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>

        {hotLoading ? (
          <div className="space-y-3 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : hotErr ? (
          <div className="px-2 text-sm text-red-600">{hotErr}</div>
        ) : popularContents.length === 0 ? (
          <div className="px-2 text-sm text-gray-500">아직 인기 QnA가 없어요.</div>
        ) : (
          <div className="space-y-3 px-2">
            {popularContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>

      <div className="h-6" />
    </div>
  );
};

/* ----- 소컴포넌트 ----- */

// 지표 카드 묶음
const StatsRow = ({ loading, error, stats, admin = false }) => {
  const items = [
    {
      key: 'contentViews',
      label: admin ? '콘텐츠 관리' : '누적 방문수',
      value: stats.contentViews,
      tone: admin ? 'text-white' : 'text-gray-900',
      subTone: admin ? 'text-blue-200' : 'text-gray-500',
      bg: admin ? 'from-blue-600 to-indigo-600 text-white' : 'from-blue-50 to-indigo-50',
    },
    {
      key: 'aiResponses',
      label: admin ? '사용자 응답' : 'AI 응답',
      value: stats.aiResponses,
      tone: admin ? 'text-white' : 'text-gray-900',
      subTone: admin ? 'text-blue-200' : 'text-gray-500',
      bg: admin ? 'from-blue-600 to-indigo-600 text-white' : 'from-blue-50 to-indigo-50',
    },
    {
      key: 'messages',
      label: admin ? '전체 메시지' : '질문 수',
      value: stats.messages,
      tone: admin ? 'text-white' : 'text-gray-900',
      subTone: admin ? 'text-blue-200' : 'text-gray-500',
      bg: admin ? 'from-blue-600 to-indigo-600 text-white' : 'from-blue-50 to-indigo-50',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3 text-center">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      {items.map((it) => (
        <div
          key={it.key}
          className={[
            'rounded-xl p-3 ring-1',
            it.bg.includes('text-white')
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 ring-blue-800/30'
              : 'bg-gradient-to-br from-blue-50 to-indigo-50 ring-blue-100',
          ].join(' ')}
        >
          <div className={`text-xl font-bold ${it.tone}`}>{it.value}</div>
          <div className={`text-xs ${it.subTone}`}>{it.label}</div>
        </div>
      ))}
    </div>
  );
};

// QnA 카드
const ContentCard = ({ content }) => (
  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="flex gap-3">
      <div className={`${content.thumbnail || 'bg-blue-50'} flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg`}>
        <BookOpen className="h-8 w-8 text-gray-600" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 line-clamp-2 font-semibold text-gray-900">{content.title}</h3>
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <span>{content.author}</span>
          <span>•</span>
          <span>{content.team}</span>
          {content.readTime && (
            <>
              <span>•</span>
              <span>{content.readTime}</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center">
              <Heart className="mr-1 h-3 w-3" />
              {content.likes}
            </span>
            <span className="flex items-center">
              <MessageSquare className="mr-1 h-3 w-3" />
              {content.comments}
            </span>
          </div>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600">
            {content.category}
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default HomeView;
