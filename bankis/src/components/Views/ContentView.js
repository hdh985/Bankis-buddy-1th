// src/components/Views/ContentView.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, Heart, Share2, Plus, X, Trash2, Edit, Filter, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { contentAPI } from '../../services/api';

/* ---------- Reusable Modal ---------- */
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

/* ---------- Helpers ---------- */
const parseDate = (d) => {
  const t = d ? new Date(d).getTime() : 0;
  return Number.isFinite(t) ? t : 0;
};
// 최근 72시간 이내면 NEW
const isNewItem = (createdAt) => {
  const THREE_DAYS = 72 * 60 * 60 * 1000;
  return Date.now() - parseDate(createdAt) <= THREE_DAYS;
};

const ContentView = () => {
  const { isAdmin } = useAuth();

  // 필터(카테고리)
  const categories = ['전체', '한국투자증권', '뱅키스', '금융', '진로', '버디'];
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // 데이터
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // 작성/수정 모달
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', content: '' });
  const [formErr, setFormErr] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchContents(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchContents = async (signal) => {
    setLoading(true);
    setErr('');
    try {
      // 기대 응답: [{ id, title, category, content, likes, author, company, createdAt }]
      const raw = await (contentAPI?.getContents
        ? contentAPI.getContents({}, { signal })
        : Promise.resolve([
            { id: 2, title: '뱅키스 계좌 관련 질문', category: '뱅키스', content: '해외주식 수수료는...', likes: 28, author: '익명', company: '', createdAt: '2025-08-08T09:00:00Z' },
            { id: 1, title: 'React 18 핵심', category: '한국투자증권', content: 'Concurrent / Suspense 정리...', likes: 12, author: '익명', company: 'Korea Inv.', createdAt: '2025-08-01T12:00:00Z' },
          ])
      );
      const data = raw?.data ?? raw;
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e.name !== 'AbortError' && e.name !== 'CanceledError') {
        console.error(e);
        setErr('콘텐츠를 불러오지 못했어요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1) 카테고리 필터 → 2) 최신순 정렬
  const filtered = useMemo(() => {
    const base = selectedCategory === '전체'
      ? list
      : list.filter((it) => it.category === selectedCategory);
    return [...base].sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));
  }, [list, selectedCategory]);

  /* ---------- Handlers ---------- */
  const handleLike = async (id) => {
    setList((prev) =>
      prev.map((it) => (it.id === id ? { ...it, likes: (it.likes ?? 0) + 1, _liking: true } : it))
    );
    try {
      await contentAPI.likeContent?.(id);
    } catch (e) {
      setList((prev) =>
        prev.map((it) => (it.id === id ? { ...it, likes: Math.max((it.likes ?? 1) - 1, 0) } : it))
      );
      console.error('좋아요 실패:', e);
    } finally {
      setList((prev) => prev.map((it) => (it.id === id ? { ...it, _liking: false } : it)));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const backup = list;
    setList((prev) => prev.filter((it) => it.id !== id));
    try {
      await contentAPI.deleteContent?.(id);
    } catch (e) {
      console.error('삭제 실패:', e);
      setList(backup);
      alert('삭제에 실패했어요.');
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ title: '', category: '', content: '' });
    setFormErr('');
    setShowModal(true);
  };

  const openEdit = (content) => {
    setEditId(content.id);
    setForm({ title: content.title, category: content.category, content: content.content });
    setFormErr('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.content.trim()) {
      setFormErr('모든 필드를 입력해주세요.');
      return;
    }
    setFormErr('');
    try {
      if (editId) {
        await contentAPI.updateContent?.(editId, { ...form });
      } else {
        await contentAPI.createContent?.({ ...form });
      }
      setShowModal(false);
      setForm({ title: '', category: '', content: '' });
      setEditId(null);
      fetchContents();
    } catch (e) {
      console.error('등록/수정 실패:', e);
      setFormErr('서버 오류가 발생했습니다.');
    }
  };

  const shareItem = async (item) => {
    const url = window.location.href;
    const text = `Q&A: ${item.title}\n\n#한국투자증권 #뱅키스 #버디 #QnA`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert('공유 텍스트와 링크를 클립보드에 복사했어요. 인스타에서 붙여넣기 하세요!');
      }
    } catch {/* no-op */}
  };

  const refresh = () => {
    const controller = new AbortController();
    fetchContents(controller.signal);
  };

  /* ---------- UI ---------- */
  return (
    <div className="flex-1 overflow-y-auto">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">현직자 Q &amp; A</h1>

            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
                title="새로고침"
              >
                <RefreshCw className="h-4 w-4" />
                새로고침
              </button>
              <button
                onClick={openCreate}
                className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                title="Q&A 등록"
              >
                <Plus className="mr-1 inline h-4 w-4" />
                새 글
              </button>
            </div>
          </div>

          {/* 카테고리 필터: 높이/정렬 통일 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="hidden h-9 items-center gap-1 rounded-full bg-gray-100 px-3 text-xs text-gray-600 sm:inline-flex">
              <Filter className="h-4 w-4" /> 
            </span>
            {categories.map((c) => {
              const active = selectedCategory === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={[
                    'h-9 whitespace-nowrap rounded-full px-4 text-sm font-medium transition',
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ].join(' ')}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="mx-auto max-w-5xl p-4">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-gray-100 to-transparent" />
                <div className="mb-3 h-4 w-2/3 rounded bg-gray-200" />
                <div className="mb-2 h-3 w-1/2 rounded bg-gray-200" />
                <div className="h-14 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : err ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{err}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500">해당 카테고리에 콘텐츠가 없습니다.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((content) => {
              const isNew = isNewItem(content.createdAt);
              return (
                <article
                  key={content.id}
                  className="group relative flex cursor-default flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* 헤더 라인 */}
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700">
                        {content.category}
                      </span>
                      {content.createdAt && (
                        <span className="text-gray-500">{content.createdAt}</span>
                      )}
                      {isNew && (
                        <span className="ml-1 inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          NEW
                        </span>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(content)}
                          className="rounded-md px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
                          title="수정"
                        >
                          <Edit className="mr-1 inline h-4 w-4" />
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(content.id)}
                          className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          title="삭제"
                        >
                          <Trash2 className="mr-1 inline h-4 w-4" />
                          삭제
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 본문 */}
                  <h3 className="mb-1 line-clamp-2 text-base font-semibold text-gray-900">
                    {content.title}
                  </h3>
                  <p className="mb-3 line-clamp-5 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {content.content}
                  </p>

                  {/* 풋터: 좋아요 + 공유만 */}
                  <div className="mt-auto flex items-center justify-between">
                    <button
                      onClick={() => handleLike(content.id)}
                      className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
                      title="좋아요"
                      disabled={content._liking}
                    >
                      <Heart className={`mr-1 h-4 w-4 ${content._liking ? 'animate-pulse text-red-500' : 'text-gray-700'}`} />
                      {content.likes ?? 0}
                    </button>

                    <button
                      onClick={() => shareItem(content)}
                      className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
                      title="인스타 공유"
                    >
                      <Share2 className="mr-1 h-4 w-4" />
                      공유
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* 작성/수정 모달 */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="mb-4 text-lg font-bold">{editId ? 'Q&A 수정' : 'Q&A 등록'}</h2>

        <label className="mb-1 block text-xs text-gray-600">제목</label>
        <input
          type="text"
          placeholder="제목"
          className="mb-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-blue-200 transition focus:ring-2"
          value={form.title}
          onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
        />

        <label className="mb-1 block text-xs text-gray-600">카테고리</label>
        <select
          className="mb-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-blue-200 transition focus:ring-2"
          value={form.category}
          onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.filter(c => c !== '전체').map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <label className="mb-1 block text-xs text-gray-600">내용</label>
        <textarea
          placeholder="내용을 입력하세요"
          className="mb-2 h-40 w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-blue-200 transition focus:ring-2"
          value={form.content}
          onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
        />

        {formErr && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formErr}</div>}

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setShowModal(false)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {editId ? '수정하기' : '등록하기'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ContentView;
