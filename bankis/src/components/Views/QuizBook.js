// src/components/Views/QuizBook.jsx
import React, { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronUp, Bookmark, BookmarkPlus, Layers } from "lucide-react";

// ✅ 카드형 금융 퀴즈 해설 페이지 (난이도 제거 + 가독성 강화)
// NOTE: 본 퀴즈 데이터는 사용자가 제공한 PPT 자료를 기반으로 정리했습니다.
//       일부 항목은 원문 표기와 상충될 수 있어, 주석(TODO)로 표기했습니다.

const SAMPLE_QUIZZES = [
  // --- 거시/환율 ---
  {
    id: "q_fx_1",
    question: "환율이 상승하면 주가는 (상승/하락) 한다.",
    answer: "하락",
    explanation:
      "일반적으로 원화 약세(환율 상승)는 외국인 자금 유출 및 수입물가 상승 압력으로 주식시장에 부담이 될 수 있습니다. 다만 수출기업엔 실적 개선 기대가 반영되기도 하므로 업종별 차이는 존재합니다.",
    category: "거시/환율",
  },
  {
    id: "q_fx_2",
    question: "원/달러 환율이 상승(원화 약세)하면 보통 수혜를 보는 업종은?",
    answer: "수출 비중이 높은 업종(예: 반도체, 자동차)",
    explanation:
      "원화 약세 시 같은 달러 매출의 원화 환산액이 커져 수출기업의 실적이 개선될 수 있습니다. 원자재 수입가격 상승 등 상쇄요인도 함께 고려해야 합니다.",
    category: "거시/환율",
  },
  {
    id: "q_fx_3",
    question: "환율이 오르면(원화 약세) 해외여행 비용이 줄어들 가능성이 크다. (O/X)",
    answer: "X",
    explanation:
      "원화 약세면 같은 달러 지출에 더 많은 원화가 필요하므로 해외여행 비용 부담은 커지는 경향이 있습니다.",
    category: "거시/환율",
  },
  {
    id: "q_macro_1",
    question: "일시적으로 회복세를 보이던 경기가 다시 침체되는 현상을 '더블 딥'이라고 한다. (O/X)",
    answer: "O",
    explanation:
      "더블 딥은 경기 회복 후 재차 침체되는 이중침체를 의미합니다.",
    category: "거시/환율",
  },

  // --- 금리/채권 ---
  {
    id: "q_rate_1",
    question: "금리가 떨어지면 주가는 (상승/하락) 한다.",
    answer: "상승",
    explanation:
      "금리 하락은 할인율 하락 및 유동성 완화로 자산가격(특히 성장주)에 우호적으로 작용하는 경우가 많습니다.",
    category: "금리/채권",
  },
  {
    id: "q_bond_1",
    question: "기준금리가 오른다면 채권의 가치는 낮아진다. (O/X)",
    answer: "O",
    explanation:
      "채권가격과 수익률은 역의 관계입니다. 시장금리(요구수익률)가 오르면 기존 고정쿠폰 채권의 상대매력이 떨어져 가격이 하락합니다.",
    category: "금리/채권",
  },
  {
    id: "q_bond_2",
    question: "금리가 오르면 채권값이 내려간다. (O/X)",
    answer: "X", // TODO: 원문 데이터에는 X로 표기되어 있으나, 이론상 정답은 보통 O 입니다.
    explanation:
      "일반적으로 금리 상승은 채권 가격 하락을 의미합니다. (자료 원문 표기와 상충함)",
    category: "금리/채권",
  },

  // --- 주식/시장 일반 ---
  {
    id: "q_equity_1",
    question: "매출액이 감소하면 주가는 (상승/하락)할 가능성이 높다.",
    answer: "하락",
    explanation:
      "기대이익 감소와 성장성 둔화로 밸류에이션이 낮아지며 주가에 부정적으로 작용할 수 있습니다.",
    category: "주식/시장",
  },
  {
    id: "q_equity_2",
    question: "외국인 투자자의 매도세가 강할수록 주가는 (상승/하락)할 가능성이 크다.",
    answer: "하락",
    explanation:
      "외국인 순매도는 수급 측면에서 지수 및 대형주에 압력으로 작용하는 경우가 많습니다.",
    category: "주식/시장",
  },
  {
    id: "q_equity_3",
    question: "시가총액이 큰 기업일수록 주가 변동성이 (작다/크다).",
    answer: "작다",
    explanation:
      "대형주는 유동성과 사업 안정성이 비교적 높아, 통상 변동성이 소형주 대비 낮은 경향이 있습니다.",
    category: "주식/시장",
  },
  {
    id: "q_equity_4",
    question: "경기 호황기에는 기술주가 (상승/하락)할 가능성이 높다.",
    answer: "상승",
    explanation:
      "성장 기대와 투자 확대가 기술주 실적 및 멀티플에 긍정적일 수 있습니다.",
    category: "주식/시장",
  },
  {
    id: "q_equity_5",
    question: "주가가 시가보다 하락한 경우에는 양봉(빨간차트)으로 표현한다. (O/X)",
    answer: "X",
    explanation:
      "국내 차트 관례상 종가가 시가보다 낮으면 음봉(대개 파란색)으로 표시됩니다.",
    category: "주식/시장",
  },

  // --- 밸류에이션/지표 ---
  {
    id: "q_val_1",
    question: "PER가 낮다는 의미를 가장 정확히 해석한 것은?",
    answer: "현재 이익 대비 주가가 상대적으로 낮게 평가됨을 시사",
    explanation:
      "PER = 주가 / 주당순이익(EPS). 낮은 PER은 이익 대비 가격이 저렴할 수 있음을 시사하지만, 업황/일회성 요인 등 맥락을 함께 봐야 합니다.",
    category: "밸류에이션/지표",
  },
  {
    id: "q_val_2",
    question: "PER(주가수익비율)이 높으면 가격 대비 (고/저)평가되어 있는 것이다.",
    answer: "고",
    explanation:
      "다른 조건이 동일하다면 높은 PER은 이익 대비 가격이 비싼(프리미엄) 상태일 가능성을 의미합니다.",
    category: "밸류에이션/지표",
  },
  {
    id: "q_val_3",
    question: "시가총액을 통해 기업의 가치를 알 수 있다. (O/X)",
    answer: "O",
    explanation:
      "시가총액은 시장이 평가한 기업가치(지분가치)의 한 지표입니다. 다만 부채, 현금흐름, 성장성 등은 별도 분석이 필요합니다.",
    category: "밸류에이션/지표",
  },

  // --- 투자상품/파생 ---
  {
    id: "q_prod_1",
    question: "최소 10종목 이상을 묶어 만든 ETF 상품은, 한 번에 여러 종목에 투자하는 방식이다 보니 보다 위험한 상품이다. (O/X)",
    answer: "X",
    explanation:
      "ETF는 분산투자를 통해 개별 종목 위험을 낮출 수 있습니다. 다만 지수 구성/레버리지 여부에 따라 위험수준은 달라집니다.",
    category: "투자상품/파생",
  },
  {
    id: "q_prod_2",
    question: "ETF와 ETN의 가장 큰 차이는?",
    answer: "발행 주체와 상환 구조",
    explanation:
      "ETF는 자산운용사가 운용하는 펀드이고, ETN은 증권사가 발행하는 채무증권으로 발행사 신용위험에 노출됩니다.",
    category: "투자상품/파생",
  },
  {
    id: "q_prod_3",
    question: "선물거래는 표준화되어 있지 않으며, 선도거래는 표준화가 되어있다. (O/X)",
    answer: "X",
    explanation:
      "선물은 거래소 상장 표준화 계약, 선도는 장외(OTC) 비표준화 맞춤 계약입니다.",
    category: "투자상품/파생",
  },
  {
    id: "q_gold_1",
    question: "금의 가격은 대체로 주식시장과 반대로 움직인다. (O/X)",
    answer: "O",
    explanation:
      "위험회피 상황에서 금이 선호되며, 위험자산(주식)과 반대 방향 상관을 보이는 경우가 많습니다.",
    category: "투자상품/파생",
  },

  // --- 기술적 지표/차트 ---
  {
    id: "q_ta_1",
    question: "MACD는 거래량을 활용한 지표이다. (O/X)",
    answer: "X",
    explanation:
      "MACD는 이동평균을 기반으로 한 추세/모멘텀 지표이며, 거래량 지표는 아닙니다.",
    category: "기술적 지표",
  },
  {
    id: "q_ta_2",
    question: "단기이동평균선이 중·장기 이동평균선을 뚫고 상승하면 주가는 (상승/하락)한다.",
    answer: "상승",
    explanation:
      "골든 크로스는 통상 상승 추세 전환 신호로 해석됩니다.",
    category: "기술적 지표",
  },
  {
    id: "q_ta_3",
    question: "이평선(주가가 어떻게 움직였는지 평균을 내고 선으로 만든 것)은 하나만 존재한다. (O/X)",
    answer: "X",
    explanation:
      "단기/중기/장기 등 다양한 기간의 이동평균선이 함께 사용됩니다.",
    category: "기술적 지표",
  },
  {
    id: "q_ta_4",
    question: "거래량이 상승하면 주가도 상승한다. (O/X)",
    answer: "O",
    explanation:
      "거래량 증가는 추세의 힘을 뒷받침하는 신호로 자주 해석되지만, 항상 상승을 의미하는 것은 아니므로 맥락 분석이 필요합니다.",
    category: "기술적 지표",
  },

  // --- 기업행위/지배구조 ---
  {
    id: "q_corp_1",
    question: "주주들에게 공짜로 주식을 나눠주는 ‘무상증자’는 주가에 부정적이다. (O/X)",
    answer: "X",
    explanation:
      "무상증자는 주식 수 증가로 주가가 기계적으로 희석되지만, 유통주식수 확대·유동성 개선 기대 등으로 중립~긍정적 반응이 나올 수 있습니다.",
    category: "기업행위/지배구조",
  },
  {
    id: "q_corp_2",
    question: "자사주를 소각하면 자기자본이 줄어들기 때문에 ROE가 낮아진다. (O/X)",
    answer: "X",
    explanation:
      "소각은 유통주식수 감소로 주당지표가 개선될 수 있으며, ROE는 순이익/자기자본으로 산출되므로 효과는 단순 감소로 보기 어렵습니다.",
    category: "기업행위/지배구조",
  },
  {
    id: "q_corp_3",
    question: "모든 주식에는 의결권이 있다. (O/X)",
    answer: "X",
    explanation:
      "우선주 등 의결권이 없는 주식도 존재합니다.",
    category: "기업행위/지배구조",
  },
  {
    id: "q_corp_4",
    question: "기업이 주식을 발행해 자금을 조달하는 것을 '유상증자'라고 한다. (O/X)",
    answer: "O",
    explanation:
      "유상증자는 투자자로부터 납입을 받아 자본금을 늘리는 방식의 자금 조달입니다.",
    category: "기업행위/지배구조",
  },
  {
    id: "q_corp_5",
    question: "'배당금'은 주식을 보유하고 있다는 이유만으로 기업의 이익을 나눠 받는 것을 말한다. (O/X)",
    answer: "O",
    explanation:
      "배당은 이익잉여금의 일부를 주주에게 분배하는 행위입니다.",
    category: "기업행위/지배구조",
  },
  {
    id: "q_corp_6",
    question: "'액면분할'은 주식의 액면가를 일정 비율로 쪼개 주식 수를 늘리는 것이다. (O/X)",
    answer: "O",
    explanation:
      "액면분할은 거래 편의성 제고를 위해 주식 수를 늘리는 조치로, 기업가치 자체를 바꾸진 않습니다.",
    category: "기업행위/지배구조",
  },

  // --- 시장/거래소/용어 ---
  {
    id: "q_mkt_1",
    question: "나스닥(Nasdaq)은 세계 2위 규모의 증권거래소이며 벤처기업의 주식이 주로 거래된다. (O/X)",
    answer: "O",
    explanation:
      "나스닥은 기술·성장주 비중이 높은 대표 거래소로, 시가총액 기준 세계 상위권입니다.",
    category: "시장/용어",
  },
  {
    id: "q_mkt_2",
    question: "삼성전자, 현대차 등 규모가 큰 기업은 보통 코스닥에 상장되어있다. (O/X)",
    answer: "X",
    explanation:
      "국내 대형주는 통상 유가증권시장(KOSPI)에 상장되어 있습니다.",
    category: "시장/용어",
  },
  {
    id: "q_mkt_3",
    question: "주식 시장에서 '공매도'는 주가 하락이 예상될 때 주식을 빌려서 판 후, 나중에 싼값에 되사서 갚는 행위이다. (O/X)",
    answer: "O",
    explanation:
      "공매도는 보유하지 않은 주식을 차입해 매도 후, 이후 매수(상환)로 포지션을 정리합니다.",
    category: "시장/용어",
  },
  {
    id: "q_mkt_4",
    question: "주식 시장에서 '불 마켓(Bull Market)'은 주가가 지속적으로 하락하는 약세장을 의미한다. (O/X)",
    answer: "X",
    explanation:
      "불 마켓은 강세장(상승장), 약세장은 베어 마켓입니다.",
    category: "시장/용어",
  },
  {
    id: "q_mkt_5",
    question: "기업의 재무 상태와 사업 전망을 분석하여 투자하는 방식을 '기술적 분석'이라고 한다. (O/X)",
    answer: "X",
    explanation:
      "재무제표/산업/경쟁력을 분석하는 것은 '기본적 분석'이며, 가격/거래량 패턴을 보는 것이 '기술적 분석'입니다.",
    category: "시장/용어",
  },

  // --- 코스톨라니/자산배분 ---
  {
    id: "q_asset_1",
    question: "코스톨라니의 모형에 따르면 금리가 정점일 때는 채권을 매도하고 부동산을 매수하는 것이 유리하다. (O/X)",
    answer: "X",
    explanation:
      "코스톨라니 달걀은 금리와 자산 선호의 순환을 설명합니다. 단편화된 문장만으로는 일반화가 어렵습니다.",
    category: "자산배분",
  },

  // --- 뱅키스/브랜드 ---
  {
    id: "q_brand_1",
    question: "뱅키스는 영업점 방문 없이도 계좌개설이 가능하다. (O/X)",
    answer: "O",
    explanation:
      "비대면 계좌 개설 프로세스를 통해 모바일로 개설할 수 있습니다.",
    category: "브랜드/뱅키스",
  },
  {
    id: "q_brand_2",
    question: "한국투자증권 계좌가 있다면 뱅키스 대학생 모의투자대회에 참가할 수 있다. (O/X)",
    answer: "X",
    explanation:
      "대회 규정에 따라 계좌 유형/자격 요건이 별도로 정해질 수 있습니다.",
    category: "브랜드/뱅키스",
  },
  {
    id: "q_brand_3",
    question: "지금(8/1~9/30) 뱅키스 ISA 일임형을 가입하면, 다양한 혜택과 상품을 받을 수 있다. (O/X)",
    answer: "X",
    explanation:
      "특정 기간/프로모션 문구로 보이며, 현재 시점에서는 유효 여부를 별도 확인해야 합니다.",
    category: "브랜드/뱅키스",
  },
  {
    id: "q_brand_4",
    question: "뱅키스 대학생 모의투자 대회는 개인 리그/팀 리그로 구성되어 있고, 중복 참여가 가능하다. (O/X)",
    answer: "O",
    explanation:
      "행사 규정상 복수 리그 참여가 허용되는 경우가 있었음을 반영한 문항입니다. 상세 요강은 해당연도 공지를 따릅니다.",
    category: "브랜드/뱅키스",
  },
  {
    id: "q_brand_5",
    question: "한국투자증권은 올해 처음으로 자기자본 10조를 돌파하였다. (O/X)",
    answer: "O",
    explanation:
      "브랜드·IR 관련 진술로 보이며, 시점별로 사실 여부가 달라질 수 있습니다.",
    category: "브랜드/뱅키스",
  },
  {
    id: "q_brand_6",
    question: "뱅키스 서비스의 핵심 차별점은 비대면 편의성, 수수료 할인, 다양한 이벤트 지원에 있다. (O/X)",
    answer: "O",
    explanation:
      "모바일 중심의 비대면 투자 경험과 각종 우대정책을 강조하는 포지셔닝입니다.",
    category: "브랜드/뱅키스",
  },
  {
    id: "q_brand_7",
    question: "뱅키스 서포터즈는 SNS 콘텐츠 제작, 캠퍼스 마케팅 기획 등 다양한 활동을 수행한다. (O/X)",
    answer: "O",
    explanation:
      "대학생 마케팅/홍보 중심의 운영 취지를 반영한 문항입니다.",
    category: "브랜드/뱅키스",
  },
];

const categories = [
  "전체",
  "거시/환율",
  "금리/채권",
  "주식/시장",
  "밸류에이션/지표",
  "투자상품/파생",
  "기술적 지표",
  "기업행위/지배구조",
  "시장/용어",
  "자산배분",
  "브랜드/뱅키스",
];

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
        <div className="text-center text-gray-500 py-16">검색 조건에 맞는 문제가 없습니다.</div>
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
