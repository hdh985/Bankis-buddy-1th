// src/components/Views/HomeView.js
import React, { useEffect, useState } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import hankuk from "../../assets/hankuk.png";        // ← 한국이(마스코트)
import hufsLogo from "../../assets/hufs.svg";
import hantu from "../../assets/hantu.svg";       // 한국외대 로고(투명)
import kisLogo from "../../assets/bankis.png";      // ← 한국투자증권 로고

const HomeView = ({ onNavigate }) => {
  const [mounted, setMounted] = useState(false);
  const goQuiz = () => onNavigate?.("quiz");

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-b from-white to-slate-50">
      <style>{`
        @keyframes pop    {0%{transform:scale(.96);opacity:0}60%{transform:scale(1.02);opacity:1}100%{transform:scale(1);opacity:1}}
        @keyframes floaty {0%{transform:translateY(0)}50%{transform:translateY(-10px)}100%{transform:translateY(0)}}
        @keyframes slowspin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
        .shimmer:before{
          content:""; position:absolute; inset:-20%; transform:skewX(-20deg);
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);
          animation:shine 1.2s ease-in-out infinite;
        }
        @keyframes shine{0%{transform:translateX(-120%) skewX(-20deg)}100%{transform:translateX(120%) skewX(-20deg)}}
        .btn-glow { box-shadow: 0 8px 24px rgba(16,185,129,.25), inset 0 0 0 1px rgba(16,185,129,.25); }
        .btn-glow:hover { box-shadow: 0 10px 30px rgba(16,185,129,.35), inset 0 0 0 1px rgba(16,185,129,.35); }
      `}</style>

      <div className={`w-full max-w-md px-6 py-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-sm">
          {/* ===== 상단 좌/우 플로팅: 좌측=한국이(hantu.svg), 우측=bankis.png ===== */}
          <img
            src={hantu}
            alt="한국이"
            className="pointer-events-auto absolute left-3 top-3 h-4 w-auto opacity-95 drop-shadow-sm transition-transform duration-300 hover:scale-[1.04]"
            draggable={false}

          />
          <img
            src={kisLogo}
            alt="한국투자증권 로고"
            className="pointer-events-auto absolute right-1 -top-3 h-20  w-auto opacity-90 drop-shadow-sm transition-transform duration-300 hover:scale-[1.04]"
            draggable={false}
          />

          {/* 상단 배지 */}
          <div className="mt-7 inline-flex items-center gap-2 rounded-full  border border-sky-200 bg-sky-100/70 px-3 py-1 text-[11px] font-medium text-sky-700 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            CAMPUS ATTACK · with 한국외국어대학교
          </div>

          {/* 타이틀 */}
          <h1 className="mt-3 text-center text-2xl sm:text-3xl font-extrabold leading-snug tracking-tight text-slate-900">
            <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              한국외대와 함께하는
            </span>
            <br />
            <span className="mt-1 inline-block">캠퍼스 어택</span>
          </h1>

          {/* 중앙 플로팅 HUFS 로고 */}
          <div className="relative mt-5 flex justify-center">
            <div aria-hidden className="absolute top-1/2 -translate-y-1/2">
              <div
                className="h-56 w-56 rounded-full blur-xl opacity-80"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(56,189,248,.35), rgba(99,102,241,.35), rgba(16,185,129,.35), rgba(56,189,248,.35))",
                  animation: "slowspin 12s linear infinite",
                }}
              />
            </div>
            <img
              src={hufsLogo}
              alt="한국외국어대학교 로고"
              className="relative z-10 h-40 w-40 object-contain drop-shadow-[0_6px_20px_rgba(2,6,23,0.10)]"
              draggable={false}
              style={{ animation: "floaty 5.2s ease-in-out infinite" }}
            />
            <div
              aria-hidden
              className="absolute -bottom-1 h-3 w-40 rounded-full bg-slate-900/10 blur-md"
              style={{ animation: "floaty 5.2s ease-in-out infinite" }}
            />
          </div>

          {/* 마스코트(중앙 하단, 기존 유지) */}
          <div className="mt-5 flex justify-center">
            <img
              src={hankuk}
              alt="BanK!S Buddy 한국이"
              className="h-56 w-56 object-contain drop-shadow-sm"
              draggable={false}
              style={{ animation: "floaty 6s ease-in-out infinite" }}
            />
          </div>

          {/* CTA 버튼 */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={goQuiz}
              className="relative group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-emerald-900 bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 border border-emerald-200 btn-glow transition hover:bg-emerald-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <span className="relative z-10 font-semibold tracking-tight">바로가기</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              <span className="pointer-events-none absolute inset-0 rounded-2xl shimmer opacity-0 group-hover:opacity-100" />
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/60" />
            </button>
          </div>

          {/* 글로시 라이트 */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-sky-200/60" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-sky-200/40 to-emerald-200/40 blur-3xl" />
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">

        <p>
          본 콘텐츠는 뱅키스 서포터즈 자체 콘텐츠이며, 어떠한 경제적 대가도 지급받지 않았습나다.
        </p>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
