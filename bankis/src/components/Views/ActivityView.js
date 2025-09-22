// src/components/Views/ActivityView.js
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Clock,
  Sparkles,
  RotateCw,
  Copy,
  Share2,
  Palette,
  Hash,
  Tag,
  ChevronLeft,
} from "lucide-react";
import axios from "axios";

/* ---------------- THEME ---------------- */
const CAMPUS_NAME = "한국외대";

/* ---------------- Confetti (no deps) ---------------- */
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

    const colors = ["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];
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

/* ---------------- UI Config ---------------- */
const modes = [
  { key: "daily", label: "한 줄 운세", hint: "오늘 하루의 분위기와 주의할 점을 한 줄로 알려줘." },
  { key: "career", label: "하루 응원", hint: "오늘 하루도 열심히 살아갈 수 있게 응원해줘." },
];

const zodiac = [
  "양자리","황소자리","쌍둥이자리","게자리","사자자리","처녀자리",
  "천칭자리","전갈자리","사수자리","염소자리","물병자리","물고기자리",
];

/* ---------------- Helpers ---------------- */
function extractJsonFromText(text) {
  if (!text) return "{}";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end >= start) return text.slice(start, end + 1);
  return `{"message": ${JSON.stringify(text)}}`;
}

function colorSwatchStyle(color) {
  const safe = (color || "").toString().trim();
  const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(safe);
  const isCss = /^(rgb|hsl)a?\(.+\)$/.test(safe) || /^[a-z]+$/i.test(safe);
  const bg = isHex || isCss ? safe : "#222";
  return { background: bg };
}

/* ---------------- Component ---------------- */
const ActivityView = () => {
  const [mode, setMode] = useState("daily");
  const [sign, setSign] = useState("");
  const [birthday, setBirthday] = useState("");
  const [fortune, setFortune] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [history, setHistory] = useState([]);
  const [pulls, setPulls] = useState(0);
  const [fireKey, setFireKey] = useState(0);

  const hintText = useMemo(
    () => modes.find((m) => m.key === mode)?.hint || "",
    [mode]
  );

  const fetchFortune = async () => {
    if (loading) return;
    setLoading(true);
    setErr("");
    try {
      const system = "You are a concise Korean fortune assistant.";
      const userPrompt = `
모드: ${mode}
생일: ${birthday || "미입력"}
별자리: ${sign || "미입력"}

다음 JSON 스키마로만 한국어로 짧고 친절하게 출력해:
{
  "message": "한 문단",
  "lucky_color": "색상명(옵션)",
  "lucky_number": 숫자(옵션),
  "keywords": ["키워드1","키워드2","키워드3"]
}
      `.trim();

      const base = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");
      const url = `${base}/chat/`;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);

      const res = await axios.post(
        url,
        { message: `${system}\n\n${userPrompt}` },
        { withCredentials: true, signal: controller.signal, timeout: 10000 }
      );
      clearTimeout(timer);

      const raw =
        res?.data?.response ||
        res?.data?.reply ||
        res?.data?.message ||
        res?.data?.text ||
        "";

      let payload;
      try {
        payload = JSON.parse(extractJsonFromText(raw));
      } catch {
        payload = { message: String(raw || "행운이 곧 찾아올 거예요!") };
      }

      const next = {
        date: new Date().toLocaleString(),
        message: payload?.message || "행운이 곧 찾아올 거예요!",
        lucky_color: payload?.lucky_color,
        lucky_number: payload?.lucky_number,
        keywords: Array.isArray(payload?.keywords)
          ? payload.keywords.slice(0, 3)
          : [],
      };
      setFortune(next);
      setHistory((prev) => [next, ...prev].slice(0, 3));
      setPulls((n) => n + 1);
      setFireKey((k) => k + 1); // 성공 시 컨페티
    } catch (e) {
      console.error(e);
      setErr("운세를 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!fortune?.message) return;
    const text = `[${mode === "daily" ? "오늘의 운세" : "하루 응원"}] ${fortune.message}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const shareSystem = async () => {
    if (!fortune?.message) return;
    const shareData = {
      title: "Buddy - 오늘의 운세",
      text: fortune.message,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await copyToClipboard();
    } catch {}
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="relative flex-1 overflow-y-auto">
      <Confetti fireKey={fireKey} />

      {/* Background decorations (캠퍼스 어택 톤) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-140px] left-[-120px] h-[340px] w-[340px] rounded-full bg-gradient-to-br from-sky-300/35 to-emerald-300/30 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-140px] h-[320px] w-[320px] rounded-full bg-gradient-to-br from-indigo-300/30 to-sky-300/25 blur-3xl" />
      </div>

      {/* Header (glass) */}
      <div className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/55">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium text-sky-700 bg-sky-100/70 border border-sky-200 rounded-full px-3 py-1 backdrop-blur">
              CAMPUS ATTACK · with {CAMPUS_NAME}
            </div>
          </div>

          {/* Segmented + Action */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="relative inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              {modes.map((m) => {
                const active = mode === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMode(m.key)}
                    disabled={loading}
                    className={[
                      "relative px-3 py-1.5 text-sm rounded-xl transition",
                      active
                        ? "bg-gradient-to-br from-sky-600 to-emerald-600 text-white shadow-md"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")}
                    title={m.label}
                  >
                    <span className="relative z-10">{m.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={fetchFortune}
              disabled={loading}
              className={[
                "inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-sm transition",
                loading
                  ? "cursor-not-allowed border-slate-200 bg-white/60 text-slate-400"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              ].join(" ")}
              title="다시 뽑기"
            >
              <RotateCw className="h-4 w-4" />
              다시 뽑기
            </button>
          </div>
        </div>
      </div>

      {/* HERO / Filters */}
      <div className="mx-auto w-full max-w-3xl px-4 pt-4">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5 shadow-sm mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-snug">
                {CAMPUS_NAME}와 함께하는{" "}
                <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                  행운 추첨
                </span>
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                버튼 한 번으로 오늘의 운세 또는 하루 응원을 받아보세요!
              </p>
            </div>

            {/* Desktop action duplicate for quick access */}
            <div className="hidden sm:block">
              <button
                type="button"
                onClick={fetchFortune}
                disabled={loading}
                className={[
                  "inline-flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm transition",
                  "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-[0.98]",
                  loading ? "opacity-70 cursor-wait" : "",
                ].join(" ")}
              >
                <Sparkles className="w-4 h-4" />
                바로 뽑기
              </button>
            </div>
          </div>

          {/* Mini stats */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stat label="총 뽑기 수" value={`${pulls}회`} accent />
            <Stat label="선택한 별자리" value={sign || "자동 선택"} />
            <Stat label="생년월일" value={birthday || "선택 안 함"} />
          </div>

          {/* glossy lights */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-sky-200/60" />
          <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-sky-200/40 to-emerald-200/40 blur-3xl" />
        </div>

        {/* Mobile segmented */}
        <div className="mb-3 sm:hidden">
          <div className="relative inline-flex w-full rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            {modes.map((m) => {
              const active = mode === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  disabled={loading}
                  className={[
                    "w-1/2 rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-gradient-to-br from-sky-600 to-emerald-600 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-slate-600">생년월일 (선택)</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">별자리 (선택)</label>
            <select
              value={sign}
              onChange={(e) => setSign(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-sky-200 transition focus:ring-2"
            >
              <option value="">자동 선택</option>
              {zodiac.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="w-full rounded-2xl border border-dashed border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-600">
              {hintText}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-3xl px-4 py-5">
        {/* Loading skeleton */}
        {loading && (
          <div className="relative overflow-hidden rounded-3xl border border-sky-200/60 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-sm">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <div className="mb-3 h-3 w-36 rounded bg-white/80" />
            <div className="mb-2 h-4 w-3/4 rounded bg-white/80" />
            <div className="mb-2 h-4 w-2/3 rounded bg-white/80" />
            <div className="h-4 w-1/2 rounded bg-white/80" />
          </div>
        )}

        {/* Error */}
        {!loading && err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="mb-2 font-semibold">앗, 오류가 났어요</div>
            <div className="text-sm">{err}</div>
            <div className="mt-3">
              <button
                type="button"
                onClick={fetchFortune}
                className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-50"
              >
                <RotateCw className="h-4 w-4" />
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* Fortune card */}
        {!loading && !err && fortune && (
          <div className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-[0_6px_30px_rgba(2,132,199,0.15)]">
            {/* Accent ring */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-sky-200/50" />
            {/* Top meta */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center text-xs text-slate-600">
                <Clock className="mr-1 h-3 w-3" />
                {fortune.date}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 px-2.5 py-1 text-xs text-slate-800 transition hover:bg-white"
                  title="복사"
                >
                  <Copy className="h-3 w-3" />
                  복사
                </button>
                <button
                  type="button"
                  onClick={shareSystem}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 px-2.5 py-1 text-xs text-slate-800 transition hover:bg-white"
                  title="공유"
                >
                  <Share2 className="h-3 w-3" />
                  공유
                </button>
              </div>
            </div>

            {/* Message */}
            <div className="mb-5 text-balance text-lg leading-relaxed text-slate-900">
              {fortune.message}
            </div>

            {/* Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {fortune.lucky_color && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 shadow-sm">
                  <span
                    className="h-3 w-3 rounded-full ring-1 ring-black/10"
                    style={colorSwatchStyle(fortune.lucky_color)}
                    aria-hidden
                  />
                  <span className="inline-flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    행운 컬러: <b className="ml-1">{fortune.lucky_color}</b>
                  </span>
                </span>
              )}

              {typeof fortune.lucky_number !== "undefined" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 shadow-sm">
                  <Hash className="h-3 w-3" />
                  행운 숫자: <b className="ml-1">{fortune.lucky_number}</b>
                </span>
              )}

              {!!fortune.keywords?.length &&
                fortune.keywords.map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 shadow-sm"
                  >
                    <Tag className="h-3 w-3" />
                    {k}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* History */}
        {!loading && !err && history.length > 1 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">최근 운세</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {history.slice(1).map((h, idx) => (
                <div
                  key={`${h.date}-${idx}`}
                  className="group rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-sm transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="mb-1 flex items-center text-[11px] text-slate-500">
                    <Clock className="mr-1 h-3 w-3" />
                    {h.date}
                  </div>
                  <div className="line-clamp-3 text-sm text-slate-800">
                    {h.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Primary action (mobile bottom) */}
      <div className="mt-6 sm:hidden px-4 pb-24">
        <button
          type="button"
          onClick={fetchFortune}
          disabled={loading}
          className={[
            "w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition",
            "bg-gradient-to-br from-sky-600 to-emerald-600",
            loading ? "opacity-70" : "hover:from-sky-700 hover:to-emerald-700",
          ].join(" ")}
        >
          <span className="inline-flex items-center gap-2">
            <RotateCw className="h-4 w-4" />
            다시 뽑기
          </span>
        </button>
      </div>

      {/* Floating Generate Button (FAB) */}
      <button
        type="button"
        onClick={fetchFortune}
        disabled={loading}
        aria-label="운세 생성"
        title="운세 생성"
        className={[
          "group fixed bottom-6 right-6 z-40 h-14 w-14 rounded-2xl shadow-xl transition",
          "bg-gradient-to-br from-indigo-600 to-sky-600 text-white",
          "hover:from-indigo-500 hover:to-sky-500 active:scale-95",
          "focus:outline-none focus:ring-4 focus:ring-sky-300/40",
          "animate-float",
          loading ? "opacity-80 cursor-wait" : "cursor-pointer",
        ].join(" ")}
      >
        {/* glow ring */}
        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/20 blur-[1px]" />
        {/* pulsing aura */}
        <span className="pointer-events-none absolute -inset-3 rounded-3xl bg-sky-500/20 blur-xl opacity-0 group-hover:opacity-100 transition" />
        <span className="flex h-full w-full items-center justify-center">
          <Sparkles className="h-6 w-6 animate-twinkle" />
        </span>
      </button>

      {/* Keyframes */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes twinkle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.9; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 2.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

/* ---------------- Reusable ---------------- */
function Stat({ label, value, accent = false }) {
  return (
    <div className="px-3 py-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className={`text-base font-semibold ${accent ? "text-emerald-700" : "text-slate-900"}`}>
        {value}
      </div>
    </div>
  );
}

export default ActivityView;
