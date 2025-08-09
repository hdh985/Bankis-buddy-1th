// src/components/Layout/Header.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

const Header = ({ onShowLogin }) => {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="relative rounded-b-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
      {/* 장식(은은한 글로우) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <span className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        {/* 로고 + 타이틀 */}
        {/* 로고 + 타이틀 */}
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20">
            <img src={logo} alt="Buddy 로고" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
          </div>
          <div className="leading-tight">
            <h1 className="text-2xl font-extrabold tracking-tight">We are BanK!S Buddy!</h1>
            <p className="text-[13px] text-blue-100">한국투자증권 서포터즈 뱅키스 버디 1기 1조 No.1</p>
          </div>
        </div>



        {/* 우측 액션: 로그인/로그아웃만 */}
        <div className="flex items-center gap-3">
          {user?.name && (
            <span className="hidden items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs text-white/90 ring-1 ring-white/20 sm:inline-flex">
              <span className="truncate max-w-[140px]">{user.name}</span>
              {isAdmin && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                  관리자
                </span>
              )}
            </span>
          )}

          {isAdmin ? (
            <button
              onClick={logout}
              className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur transition hover:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white/30"
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={onShowLogin}
              className="rounded-full bg-white text-blue-700 px-3 py-1 text-xs font-semibold shadow-sm transition hover:shadow focus:outline-none focus:ring-4 focus:ring-white/40"
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
