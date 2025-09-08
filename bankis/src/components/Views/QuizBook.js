// src/components/Views/QuizBook.jsx
import React, { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, Bookmark, BookmarkPlus, Layers } from "lucide-react";

// ✅ 카드형 금융 퀴즈 해설 페이지 (난이도 제거 + 가독성 강화)

const SAMPLE_QUIZZES = [
  { 
    id: "q1",
    question: "ETF와 ETN의 가장 큰 차이는?",
    answer: "발행 주체와 상환 구조",
    explanation:
      "ETF(상장지수펀드)는 자산운용사가 설정한 펀드로 기초자산을 실제로 보유하고, ETN(상장지수증권)은 증권사가 발행하는 파생결합증권으로 발행사의 신용위험(발행사 부도 위험)에 노출됩니다.",
    category: "투자상품",
  },
  {
    id: "q2",
    question: "채권의 수익률이 상승하면 채권 가격은?",
    answer: "하락한다",
    explanation:
      "시장수익률(요구수익률)이 오르면 기존 고정 쿠폰의 상대적 매력이 떨어져 가격이 하락합니다. 채권 가격과 수익률은 역의 관계입니다.",
    category: "채권",
  },
  {
    id: "q3",
    question: "원/달러 환율이 상승(원화 약세)하면 보통 수혜를 보는 업종은?",
    answer: "수출 비중이 높은 업종(예: 반도체, 자동차)",
    explanation:
      "원화가 약세면 동일 달러 매출의 원화 환산액이 늘어 수출 기업의 실적 개선 기대가 커질 수 있습니다. 다만 원자재 수입비용 증가 등 변수도 함께 고려해야 합니다.",
    category: "거시/환율",
  },
  {
    id: "q4",
    question: "PER가 낮다는 의미를 가장 정확히 해석한 것은?",
    answer: "현재 이익 대비 주가가 상대적으로 낮게 평가됨을 시사",
    explanation:
      "PER(주가수익비율)은 주가/주당순이익(EPS)입니다. 낮을수록 이익 대비 가격이 저렴하다는 뜻이지만, 업황 침체·일시적 이익 급증 등 맥락을 함께 봐야 합니다.",
    category: "밸류에이션",
  },
  {
    id: "q5",
    question: "분산투자의 핵심 목적은?",
    answer: "동일한 기대수익에서 변동성(위험)을 낮추는 것",
    explanation:
      "상관관계가 낮은 자산을 혼합하면 개별 자산의 변동이 상쇄되어 전체 포트폴리오의 변동성을 줄일 수 있습니다.",
    category: "포트폴리오",
  },
];

const categories = ["전체", "투자상품", "채권", "거시/환율", "밸류에이션", "포트폴리오"];

export default function QuizBook() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [openIds, setOpenIds] = useState(new Set());
  const [bookmarks, setBookmarks] = useState(new Set());

  const filtered = useMemo(() => {
    return SAMPLE_QUIZZES.filter((q) => {
      const matchQuery =
        !query ||
        q.question.toLowerCase().includes(query.toLowerCase()) ||
        q.answer.toLowerCase().includes(query.toLowerCase()) ||
        q.explanation.toLowerCase().includes(query.toLowerCase());
      const matchCat = category === "전체" || q.category === category;
      return matchQuery && matchCat;
    });
  }, [query, category]);

  const toggleOpen = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleBookmark = (id) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-5 pb-28">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold tracking-tight">금융 퀴즈 해설집</h1>
        <div className="text-xs text-gray-500">총 {filtered.length}문항</div>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="질문/정답/해설을 검색하세요"
          className="w-full pl-11 pr-3 py-3 rounded-2xl border border-gray-200 bg-white text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 필터 */}
      <div className="flex gap-3 mb-5 overflow-x-auto">
        <FilterChip icon={Layers} label="카테고리" value={category} setValue={setCategory} options={categories} />
      </div>

      {/* 카드 리스트 */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((q, idx) => {
          const opened = openIds.has(q.id);
          const bookmarked = bookmarks.has(q.id);
          return (
            <article
              key={q.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* 카드 헤더 */}
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">#{String(idx + 1).padStart(2, "0")}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                        {q.category}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold leading-6 text-gray-900">
                      {q.question}
                    </h2>
                  </div>

                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => toggleBookmark(q.id)}
                      className={`p-2 rounded-xl border ${
                        bookmarked
                          ? "bg-yellow-50 border-yellow-200 text-yellow-600"
                          : "bg-white border-gray-200 text-gray-400 hover:text-gray-600"
                      }`}
                      aria-pressed={bookmarked}
                      aria-label={bookmarked ? "즐겨찾기 해제" : "즐겨찾기"}
                      title={bookmarked ? "즐겨찾기 해제" : "즐겨찾기"}
                    >
                      {bookmarked ? <Bookmark className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => toggleOpen(q.id)}
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
                      aria-expanded={opened}
                      aria-label={opened ? "해설 접기" : "해설 보기"}
                      title={opened ? "해설 접기" : "해설 보기"}
                    >
                      {opened ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 접히는 영역 */}
              {opened && (
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                    <div className="text-green-700 font-medium">정답</div>
                    <div className="text-green-800 mt-0.5 leading-relaxed">{q.answer}</div>
                  </div>

                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                    <div className="text-gray-800 font-medium">해설</div>
                    <p className="text-gray-700 mt-1 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* 빈 상태 */}
      {filtered.length === 0 && (
        <div className="text-center text-gray-500 py-16">
          검색 조건에 맞는 문제가 없습니다.
        </div>
      )}
    </div>
  );
}

function FilterChip({ icon: Icon, label, value, setValue, options }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <Icon className="w-3.5 h-3.5" /> {label}
      </span>
      <div className="flex gap-1.5">
        {options.map((op) => (
          <button
            key={op}
            onClick={() => setValue(op)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              value === op
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
            }`}
          >
            {op}
          </button>
        ))}
      </div>
    </div>
  );
}
