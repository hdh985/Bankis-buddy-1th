// src/components/Views/QuizBook.js
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkPlus,
  PartyPopper,
  Instagram,
  Sparkles,
  Layers,
} from "lucide-react";

/* ===================== THEME ===================== */
const CAMPUS_NAME = "한국외국어대학교";
const INSTAGRAM_URL = "https://www.instagram.com/bankiszone?igsh=MWxhM3JnNW4zYjE4cg==";

/* ================= Confetti (no deps) ================= */
function Confetti({ fireKey }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!fireKey) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = (canvas.width = window.innerWidth);
      H = (canvas.height = window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    const colors = ["#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];
    const N = 130;
    const parts = Array.from({ length: N }).map(() => ({
      x: Math.random() * W,
      y: -30 - Math.random() * 120,
      r: 3 + Math.random() * 7,
      c: colors[(Math.random() * colors.length) | 0],
      vx: -2.2 + Math.random() * 4.4,
      vy: 2 + Math.random() * 3.2,
      rot: Math.random() * Math.PI,
      vr: -0.12 + Math.random() * 0.24,
    }));

    let life = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r, -p.r * 0.4, p.r * 2, p.r * 0.8);
        ctx.restore();
      });
      life++;
      if (life < 180) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, W, H);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      const ctx2 = canvas.getContext("2d");
      ctx2 && ctx2.clearRect(0, 0, W, H);
    };
  }, [fireKey]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40"
      aria-hidden
    />
  );
}

/* ===================== DATA (퀴즈) ===================== */
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
    question:
      "일시적으로 회복세를 보이던 경기가 다시 침체되는 현상을 '더블 딥'이라고 한다. (O/X)",
    answer: "O",
    explanation: "더블 딥은 경기 회복 후 재차 침체되는 이중침체를 의미합니다.",
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
    answer: "O",
    explanation:
      "일반적으로 금리(수익률) 상승 ↔ 채권가격 하락입니다.",
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
    question:
      "외국인 투자자의 매도세가 강할수록 주가는 (상승/하락)할 가능성이 크다.",
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
    question:
      "주가가 시가보다 하락한 경우에는 양봉(빨간차트)으로 표현한다. (O/X)",
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
    question:
      "PER(주가수익비율)이 높으면 가격 대비 (고/저)평가되어 있는 것이다.",
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
    question:
      "최소 10종목 이상을 묶어 만든 ETF 상품은, 한 번에 여러 종목에 투자하는 방식이다 보니 보다 위험한 상품이다. (O/X)",
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
    question:
      "선물거래는 표준화되어 있지 않으며, 선도거래는 표준화가 되어있다. (O/X)",
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
    question:
      "단기이동평균선이 중·장기 이동평균선을 뚫고 상승하면 주가는 (상승/하락)한다.",
    answer: "상승",
    explanation: "골든 크로스는 통상 상승 추세 전환 신호로 해석됩니다.",
    category: "기술적 지표",
  },
  {
    id: "q_ta_3",
    question:
      "이평선(주가가 어떻게 움직였는지 평균을 내고 선으로 만든 것)은 하나만 존재한다. (O/X)",
    answer: "X",
    explanation: "단기/중기/장기 등 다양한 기간의 이동평균선이 함께 사용됩니다.",
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
    question:
      "주주들에게 공짜로 주식을 나눠주는 ‘무상증자’는 주가에 부정적이다. (O/X)",
    answer: "X",
    explanation:
      "무상증자는 주식 수 증가로 주가가 기계적으로 희석되지만, 유통주식수 확대·유동성 개선 기대 등으로 중립~긍정적 반응이 나올 수 있습니다.",
    category: "기업행위/지배구조",
  },
  {
    id: "q_corp_2",
    question:
      "자사주를 소각하면 자기자본이 줄어들기 때문에 ROE가 낮아진다. (O/X)",
    answer: "X",
    explanation:
      "소각은 유통주식수 감소로 주당지표가 개선될 수 있으며, ROE는 순이익/자기자본으로 산출되므로 효과는 단순 감소로 보기 어렵습니다.",
    category: "기업행위/지배구조",
  },
  {
    id: "q_corp_3",
    question: "모든 주식에는 의결권이 있다. (O/X)",
    answer: "X",
    explanation: "우선주 등 의결권이 없는 주식도 존재합니다.",
    category: "기업행위/지배구조",
  },
  {
    id: "q_corp_4",
    question:
      "기업이 주식을 발행해 자금을 조달하는 것을 '유상증자'라고 한다. (O/X)",
    answer: "O",
    explanation:
      "유상증자는 투자자로부터 납입을 받아 자본금을 늘리는 방식의 자금 조달입니다.",
    category: "기업행위/지배구조",
  },
  {
    id: "q_corp_5",
    question:
      "'배당금'은 주식을 보유하고 있다는 이유만으로 기업의 이익을 나눠 받는 것을 말한다. (O/X)",
    answer: "O",
    explanation: "배당은 이익잉여금의 일부를 주주에게 분배하는 행위입니다.",
    category: "기업행위/지배구조",
  },
  {
    id: "q_corp_6",
    question:
      "'액면분할'은 주식의 액면가를 일정 비율로 쪼개 주식 수를 늘리는 것이다. (O/X)",
    answer: "O",
    explanation:
      "액면분할은 거래 편의성 제고를 위해 주식 수를 늘리는 조치로, 기업가치 자체를 바꾸진 않습니다.",
    category: "기업행위/지배구조",
  },

  // --- 시장/거래소/용어 ---
  {
    id: "q_mkt_1",
    question:
      "나스닥(Nasdaq)은 세계 2위 규모의 증권거래소이며 벤처기업의 주식이 주로 거래된다. (O/X)",
    answer: "O",
    explanation:
      "나스닥은 기술·성장주 비중이 높은 대표 거래소로, 시가총액 기준 세계 상위권입니다.",
    category: "시장/용어",
  },
  {
    id: "q_mkt_2",
    question:
      "삼성전자, 현대차 등 규모가 큰 기업은 보통 코스닥에 상장되어있다. (O/X)",
    answer: "X",
    explanation: "국내 대형주는 통상 유가증권시장(KOSPI)에 상장되어 있습니다.",
    category: "시장/용어",
  },
  {
    id: "q_mkt_3",
    question:
      "주식 시장에서 '공매도'는 주가 하락이 예상될 때 주식을 빌려서 판 후, 나중에 싼값에 되사서 갚는 행위이다. (O/X)",
    answer: "O",
    explanation:
      "공매도는 보유하지 않은 주식을 차입해 매도 후, 이후 매수(상환)로 포지션을 정리합니다.",
    category: "시장/용어",
  },
  {
    id: "q_mkt_4",
    question:
      "주식 시장에서 '불 마켓(Bull Market)'은 주가가 지속적으로 하락하는 약세장을 의미한다. (O/X)",
    answer: "X",
    explanation: "불 마켓은 강세장(상승장), 약세장은 베어 마켓입니다.",
    category: "시장/용어",
  },
  {
    id: "q_mkt_5",
    question:
      "기업의 재무 상태와 사업 전망을 분석하여 투자하는 방식을 '기술적 분석'이라고 한다. (O/X)",
    answer: "X",
    explanation:
      "재무제표/산업/경쟁력을 분석하는 것은 '기본적 분석'이며, 가격/거래량 패턴을 보는 것이 '기술적 분석'입니다.",
    category: "시장/용어",
  },

  // --- 자산배분 ---
  {
    id: "q_asset_1",
    question:
      "코스톨라니의 모형에 따르면 금리가 정점일 때는 채권을 매도하고 부동산을 매수하는 것이 유리하다. (O/X)",
    answer: "X",
    explanation:
      "코스톨라니 달걀은 금리와 자산 선호의 순환을 설명합니다. 단편화된 문장만으로는 일반화가 어렵습니다.",
    category: "자산배분",
  },

  // --- 브랜드/뱅키스 ---
  {
    id: "q_brand_1",
    question: "뱅키스는 영업점 방문 없이도 계좌개설이 가능하다. (O/X)",
    answer: "O",
    explanation: "비대면 계좌 개설 프로세스를 통해 모바일로 개설할 수 있습니다.",
    category: "브랜드/뱅키스",
  },
  {
    id: "q_brand_2",
    question:
      "한국투자증권 계좌가 있다면 뱅키스 대학생 모의투자대회에 참가할 수 있다. (O/X)",
    answer: "X",
    explanation: "대회 규정에 따라 계좌 유형/자격 요건이 별도로 정해질 수 있습니다.",
    category: "브랜드/뱅키스",
  },
  {
    id: "q_brand_3",
    question:
      "지금(8/1~9/30) 뱅키스 ISA 일임형을 가입하면, 다양한 혜택과 상품을 받을 수 있다. (O/X)",
    answer: "X",
    explanation:
      "특정 기간/프로모션 문구로 보이며, 현재 시점에서는 유효 여부를 별도 확인해야 합니다.",
    category: "브랜드/뱅키스",
  },
  {
    id: "q_brand_4",
    question:
      "뱅키스 대학생 모의투자 대회는 개인 리그/팀 리그로 구성되어 있고, 중복 참여가 가능하다. (O/X)",
    answer: "O",
    explanation:
      "행사 규정상 복수 리그 참여가 허용되는 경우가 있었음을 반영한 문항입니다. 상세 요강은 해당연도 공지를 따릅니다.",
    category: "브랜드/뱅키스",
  },
  {
    id: "q_brand_5",
    question:
      "한국투자증권은 올해 처음으로 자기자본 10조를 돌파하였다. (O/X)",
    answer: "O",
    explanation:
      "브랜드·IR 관련 진술로 보이며, 시점별로 사실 여부가 달라질 수 있습니다.",
    category: "브랜드/뱅키스",
  },
  {
    id: "q_brand_6",
    question:
      "뱅키스 서비스의 핵심 차별점은 비대면 편의성, 수수료 할인, 다양한 이벤트 지원에 있다. (O/X)",
    answer: "O",
    explanation:
      "모바일 중심의 비대면 투자 경험과 각종 우대정책을 강조하는 포지셔닝입니다.",
    category: "브랜드/뱅키스",
  },
  {
    id: "q_brand_7",
    question:
      "뱅키스 서포터즈는 SNS 콘텐츠 제작, 캠퍼스 마케팅 기획 등 다양한 활동을 수행한다. (O/X)",
    answer: "O",
    explanation: "대학생 마케팅/홍보 중심의 운영 취지를 반영한 문항입니다.",
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

/* ===================== MAIN ===================== */
export default function QuizBook() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [openIds, setOpenIds] = useState(new Set());
  const [bookmarks, setBookmarks] = useState(new Set());
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [fireKey, setFireKey] = useState(0);
  const [igAnimating, setIgAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  const searchRef = useRef(null);

  /* -------- mount animation -------- */
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  /* -------- persist to localStorage -------- */
  // load
  useEffect(() => {
    try {
      const b = JSON.parse(localStorage.getItem("quiz_bookmarks") || "[]");
      const o = JSON.parse(localStorage.getItem("quiz_openIds") || "[]");
      if (Array.isArray(b)) setBookmarks(new Set(b));
      if (Array.isArray(o)) setOpenIds(new Set(o));
    } catch (_) {}
  }, []);
  // save
  useEffect(() => {
    localStorage.setItem("quiz_bookmarks", JSON.stringify([...bookmarks]));
  }, [bookmarks]);
  useEffect(() => {
    localStorage.setItem("quiz_openIds", JSON.stringify([...openIds]));
  }, [openIds]);

  /* -------- filtering -------- */
  const filtered = useMemo(() => {
    const base = SAMPLE_QUIZZES.filter((q) => {
      const qtext = [q.question, q.answer, q.explanation].join(" ").toLowerCase();
      const matchQuery = !query || qtext.includes(query.toLowerCase());
      const matchCat = category === "전체" || q.category === category;
      return matchQuery && matchCat;
    });
    return showOnlyBookmarks ? base.filter((q) => bookmarks.has(q.id)) : base;
  }, [query, category, showOnlyBookmarks, bookmarks]);

  /* -------- actions -------- */
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
      const was = next.has(id);
      was ? next.delete(id) : next.add(id);
      const size = next.size;
      if ((!was && size === 1) || size === 3 || size === 5 || size % 10 === 0) {
        setFireKey((k) => k + 1);
      }
      return next;
    });
  };

  const handleInstagramClick = () => {
    setFireKey((k) => k + 1);
    setIgAnimating(true);
    setTimeout(() => {
      window.open(INSTAGRAM_URL, "_blank", "noopener,noreferrer");
      setTimeout(() => setIgAnimating(false), 420);
    }, 600);
  };

  /* -------- keyboard shortcuts -------- */
  useEffect(() => {
    const onKey = (e) => {
      // Cmd/Ctrl + K => search focus
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      // Arrow left/right => category move
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
        const idx = categories.indexOf(category);
        const next =
          e.key === "ArrowLeft"
            ? Math.max(0, idx - 1)
            : Math.min(categories.length - 1, idx + 1);
        setCategory(categories[next]);
      }
      // Enter => open first card
      if (e.key === "Enter" && filtered[0]) {
        toggleOpen(filtered[0].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [category, filtered]);

  /* -------- progress stats -------- */
  const openedCount = [...openIds].filter((id) => SAMPLE_QUIZZES.find((q) => q.id === id)).length;
  const total = SAMPLE_QUIZZES.length;
  const progress = Math.round((openedCount / total) * 100) || 0;
  const favRate = Math.round((bookmarks.size / total) * 100) || 0;

  return (
    <div className="relative max-w-3xl mx-auto p-5 pb-36">
      {/* global keyframes */}
      <style>{`
        @keyframes pop { 0%{transform:scale(.92);opacity:0} 60%{transform:scale(1.02);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes wiggle {0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}50%{transform:rotate(6deg)}75%{transform:rotate(-4deg)}}
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      {/* Confetti canvas */}
      <Confetti fireKey={fireKey} />

      {/* Instagram overlay */}
      {igAnimating && (
        <div className="fixed inset-0 z-50 grid place-items-center pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-pink-400/30 blur-2xl animate-pulse" />
            <div
              className="relative flex items-center gap-3 rounded-2xl border border-pink-200 bg-white/90 backdrop-blur px-5 py-3 shadow-2xl"
              style={{ animation: "pop 0.6s ease-out" }}
            >
              <Instagram
                className="w-6 h-6 text-pink-600"
                style={{ animation: "wiggle 0.6s ease-in-out" }}
              />
              <span className="text-pink-700 font-semibold">
                Instagram으로 이동합니다…
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating emojis */}
      <div className="pointer-events-none absolute -top-2 right-3 z-10 opacity-30 select-none">
        <div className="animate-bounce">📈</div>
      </div>
      <div className="pointer-events-none absolute top-10 -left-1 z-10 opacity-30 select-none">
        <div className="animate-bounce [animation-delay:400ms]">🎉</div>
      </div>

      {/* HERO */}
      <div
        className={`transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="relative overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-5 shadow-sm">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-700 bg-indigo-100/70 border border-indigo-200 rounded-full px-3 py-1 backdrop-blur">
            CAMPUS ATTACK · with {CAMPUS_NAME}
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 leading-snug">
            {CAMPUS_NAME}와 함께하는{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
              캠퍼스 어택 금융 퀴즈북
            </span>
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            퀴즈로 가볍게 투자 감각 업! 카테고리·검색·즐겨찾기로 학습 흐름을 쾌적하게.
          </p>

          {/* stats + actions */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              <Stat label="총 문제" value={`${total}문항`} />
              <Stat label="열람" value={`${openedCount}문항`} />
              <Stat label="즐겨찾기" value={`${bookmarks.size}개`} accent />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowOnlyBookmarks((v) => !v)}
                className={`group inline-flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm transition active:scale-[0.98] ${
                  showOnlyBookmarks
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow"
                }`}
                aria-pressed={showOnlyBookmarks}
              >
                {showOnlyBookmarks ? (
                  <>
                    <Bookmark className="w-4 h-4" /> 즐겨찾기만
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" /> 전체 보기
                  </>
                )}
              </button>

              <button
                onClick={() => setFireKey((k) => k + 1)}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 shadow-sm transition active:scale-[0.98]"
                title="축포!"
              >
                <PartyPopper className="w-4 h-4" />
                축하 빵!
              </button>
            </div>
          </div>

          {/* progress */}
          <div className="mt-4 space-y-2">
            <Progress label="학습 진행" value={progress} />
            <Progress label="즐겨찾기 비율" value={favRate} tone="amber" />
          </div>

          {/* glossy lights */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-indigo-200/60" />
          <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-200/40 to-emerald-200/40 blur-3xl" />
        </div>
      </div>

      {/* 검색 */}
      <div className="relative mt-5 mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="질문/정답/해설을 검색하세요 (⌘/Ctrl + K)"
          className="w-full pl-11 pr-3 py-3 rounded-2xl border border-gray-200 bg-white text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="퀴즈 검색"
        />
      </div>

      {/* 카테고리 탭 */}
      <CategoryTabs
        categories={categories}
        active={category}
        onChange={setCategory}
        countsMap={SAMPLE_QUIZZES.reduce(
          (acc, q) => ((acc[q.category] = (acc[q.category] || 0) + 1), acc),
          { 전체: SAMPLE_QUIZZES.length }
        )}
      />

      {/* 카드 리스트 */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((q, idx) => {
          const opened = openIds.has(q.id);
          const bookmarked = bookmarks.has(q.id);
          return (
            <article
              key={q.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
            >
              {/* header */}
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400">
                        #{String(idx + 1).padStart(2, "0")}
                      </span>
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
                      className={`p-2 rounded-xl border transition active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        bookmarked
                          ? "bg-yellow-50 border-yellow-200 text-yellow-600"
                          : "bg-white border-gray-200 text-gray-400 hover:text-gray-600"
                      }`}
                      aria-pressed={bookmarked}
                      aria-label={bookmarked ? "즐겨찾기 해제" : "즐겨찾기"}
                      title={bookmarked ? "즐겨찾기 해제" : "즐겨찾기"}
                    >
                      {bookmarked ? (
                        <Bookmark className="w-5 h-5" />
                      ) : (
                        <BookmarkPlus className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => toggleOpen(q.id)}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      aria-expanded={opened}
                      aria-label={opened ? "해설 접기" : "해설 보기"}
                      title={opened ? "해설 접기" : "해설 보기"}
                    >
                      {opened ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* collapsible */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  opened ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                      <div className="text-green-700 font-medium">정답</div>
                      <div className="text-green-800 mt-0.5 leading-relaxed">
                        {q.answer}
                      </div>
                    </div>

                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <div className="text-gray-800 font-medium">해설</div>
                      <p className="text-gray-700 mt-1 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* empty */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm mb-2">
            CAMPUS ATTACK
          </div>
          <p className="text-gray-600">조건에 맞는 문제가 없습니다. 검색어나 주제를 바꿔보세요!</p>
        </div>
      )}

      {/* ===== Instagram BIG CTA (고정/대형) ===== */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={handleInstagramClick}
          className="relative group inline-flex items-center gap-3 px-6 sm:px-8 py-4 sm:py-5
                     rounded-2xl sm:rounded-3xl border border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50
                     text-pink-700 shadow-[0_8px_30px_rgba(244,114,182,0.25)]
                     hover:shadow-[0_10px_40px_rgba(244,114,182,0.35)]
                     active:scale-[0.98] transition-all"
          aria-label="인스타그램 바로가기"
        >
          {/* glossy sweep */}
          <span className="pointer-events-none absolute -left-10 top-0 h-full w-10 bg-white/40 blur-md transform -skew-x-12 group-hover:translate-x-[260%] transition-transform duration-1000" />
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border border-pink-200">
            <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
            {/* sparkle */}
            <Sparkles className="w-4 h-4 text-pink-500 absolute -top-1 -right-1" />
          </div>
          <div className="text-left">
            <div className="text-sm sm:text-base font-bold leading-tight">뱅키스 인스타그램</div>
            <div className="text-xs sm:text-sm text-pink-600/80">이벤트·소식 먼저 보기!</div>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ===================== UI helpers ===================== */
function Stat({ label, value, accent = false }) {
  return (
    <div className="px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className={`text-base font-semibold ${accent ? "text-amber-700" : "text-gray-900"}`}>
        {value}
      </div>
    </div>
  );
}

function Progress({ label, value, tone = "emerald" }) {
  const tones = {
    emerald: { bg: "bg-emerald-100", bar: "bg-emerald-500" },
    amber: { bg: "bg-amber-100", bar: "bg-amber-500" },
  }[tone];
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-semibold text-gray-800">{value}%</span>
      </div>
      <div className={`h-2.5 rounded-full ${tones.bg}`}>
        <div
          className={`h-2.5 rounded-full ${tones.bar} transition-[width] duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function CategoryTabs({ categories, active, onChange, countsMap = {} }) {
  const wrapRef = React.useRef(null);
  const barRef = React.useRef(null);
  const btnRefs = React.useRef({});

  const updateBar = useCallback(() => {
    const wrap = wrapRef.current;
    const bar = barRef.current;
    const el = btnRefs.current[active];
    if (!wrap || !bar || !el) return;
    const wrapRect = wrap.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const left = rect.left - wrapRect.left + wrap.scrollLeft + 12;
    bar.style.transform = `translateX(${left}px)`;
    bar.style.width = `${rect.width - 24}px`;
  }, [active]);

  const scrollToActive = useCallback(() => {
    const el = btnRefs.current[active];
    const wrap = wrapRef.current;
    if (!el || !wrap) return;
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  useEffect(() => {
    updateBar();
    scrollToActive();
    const onResize = () => updateBar();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateBar, scrollToActive]);

  const onKeyDown = (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const idx = categories.indexOf(active);
    const next = e.key === "ArrowLeft" ? Math.max(0, idx - 1) : Math.min(categories.length - 1, idx + 1);
    onChange(categories[next]);
  };

  return (
    <div className="relative mb-5">
      {/* 좌/우 페이드 */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-gray-50 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-gray-50 to-transparent z-10" />

      <div
        ref={wrapRef}
        className="relative overflow-x-auto no-scrollbar px-2"
        role="tablist"
        aria-label="카테고리 선택"
        onKeyDown={onKeyDown}
      >
        {/* 하단 라인 */}
        <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-200" />

        {/* 인디케이터 바 */}
        <div
          ref={barRef}
          className="absolute bottom-0 h-[3px] rounded-full bg-emerald-600 transition-transform duration-300"
          style={{ width: 0, transform: "translateX(0px)" }}
          aria-hidden
        />

        <div className="flex gap-2 py-2">
          {categories.map((c) => {
            const selected = c === active;
            return (
              <button
                key={c}
                ref={(el) => (btnRefs.current[c] = el)}
                role="tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => onChange(c)}
                className={[
                  "whitespace-nowrap rounded-xl border px-3.5 py-2 text-sm transition",
                  "hover:shadow-sm active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500",
                  selected
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300",
                ].join(" ")}
              >
                <span className="align-middle inline-flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 opacity-60" />
                  {c}
                </span>
                {typeof countsMap[c] !== "undefined" && (
                  <span
                    className={[
                      "ml-2 inline-flex items-center justify-center rounded-full text-[11px] leading-none px-1.5 py-0.5",
                      selected ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600",
                    ].join(" ")}
                    aria-hidden
                  >
                    {countsMap[c]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
