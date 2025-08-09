// src/components/Views/ActivityView.js
import React, { useMemo, useState } from "react";
import {
  Clock,
  Sparkles,
  RotateCw,
  Copy,
  Share2,
  Palette,
  Hash,
  Tag,
} from "lucide-react";
import axios from "axios";

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

  const hintText = useMemo(
    () => modes.find((m) => m.key === mode)?.hint || "",
    [mode]
  );

  // 최초 자동 호출 제거 (FAB 또는 버튼을 눌러야만 호출)

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
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-120px] left-[-100px] h-[320px] w-[320px] rounded-full bg-gradient-to-br from-amber-300/40 to-orange-400/30 blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-120px] h-[300px] w-[300px] rounded-full bg-gradient-to-br from-blue-300/30 to-indigo-400/30 blur-3xl" />
      </div>

      {/* Header (glass) */}
      <div className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/55">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-yellow-400/30 blur-md" />
              <Sparkles className="relative z-10 h-5 w-5 text-yellow-600" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-800">
              행운 추첨
            </h1>
          </div>

          {/* Segmented control */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="relative inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
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
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-50",
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
                  ? "cursor-not-allowed border-gray-200 bg-white/60 text-gray-400"
                  : "border-gray-200 bg-white hover:bg-gray-50",
              ].join(" ")}
              title="다시 뽑기"
            >
              <RotateCw className="h-4 w-4" />
              다시 뽑기
            </button>
          </div>
        </div>
      </div>

      {/* Controls (mobile + filters) */}
      <div className="mx-auto w-full max-w-3xl px-4 pt-4">
        {/* Mobile segmented */}
        <div className="mb-3 sm:hidden">
          <div className="relative inline-flex w-full rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
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
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-50",
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
            <label className="mb-1 block text-xs text-gray-600">생년월일 (선택)</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-blue-200 transition focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600">별자리 (선택)</label>
            <select
              value={sign}
              onChange={(e) => setSign(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-blue-200 transition focus:ring-2"
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
            <div className="w-full rounded-xl border border-dashed border-gray-200 bg-white/70 px-3 py-2 text-xs text-gray-600">
              {hintText}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-3xl px-4 py-5">
        {/* Loading skeleton */}
        {loading && (
          <div className="relative overflow-hidden rounded-2xl border border-yellow-200/60 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-6 shadow-sm">
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
          <div className="relative overflow-hidden rounded-3xl border border-yellow-200/70 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-6 shadow-[0_6px_30px_rgba(251,191,36,0.25)]">
            {/* Accent ring */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/40" />
            {/* Top meta */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="mr-1 h-3 w-3" />
                {fortune.date}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white/80 px-2.5 py-1 text-xs text-gray-800 transition hover:bg-white"
                  title="복사"
                >
                  <Copy className="h-3 w-3" />
                  복사
                </button>
                <button
                  type="button"
                  onClick={shareSystem}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white/80 px-2.5 py-1 text-xs text-gray-800 transition hover:bg-white"
                  title="공유"
                >
                  <Share2 className="h-3 w-3" />
                  공유
                </button>
              </div>
            </div>

            {/* Message */}
            <div className="mb-5 text-balance text-lg leading-relaxed text-gray-900">
              {fortune.message}
            </div>

            {/* Chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {fortune.lucky_color && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-2.5 py-1 shadow-sm">
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
                <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/80 px-2.5 py-1 shadow-sm">
                  <Hash className="h-3 w-3" />
                  행운 숫자: <b className="ml-1">{fortune.lucky_number}</b>
                </span>
              )}

              {!!fortune.keywords?.length &&
                fortune.keywords.map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/80 px-2.5 py-1 shadow-sm"
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
            <h3 className="mb-2 text-sm font-semibold text-gray-700">최근 운세</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {history.slice(1).map((h, idx) => (
                <div
                  key={`${h.date}-${idx}`}
                  className="group rounded-2xl border border-gray-200/70 bg-white/80 p-3 shadow-sm transition hover:border-gray-300 hover:bg-white"
                >
                  <div className="mb-1 flex items-center text-[11px] text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    {h.date}
                  </div>
                  <div className="line-clamp-3 text-sm text-gray-800">
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
            "bg-gradient-to-br from-blue-600 to-indigo-600",
            loading ? "opacity-70" : "hover:from-blue-700 hover:to-indigo-700",
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
          "bg-gradient-to-br from-indigo-600 to-blue-600 text-white",
          "hover:from-indigo-500 hover:to-blue-500 active:scale-95",
          "focus:outline-none focus:ring-4 focus:ring-blue-300/40",
          "animate-float",
          loading ? "opacity-80 cursor-wait" : "cursor-pointer",
        ].join(" ")}
      >
        {/* glow ring */}
        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/20 blur-[1px]" />
        {/* pulsing aura */}
        <span className="pointer-events-none absolute -inset-3 rounded-3xl bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition" />
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

export default ActivityView;
