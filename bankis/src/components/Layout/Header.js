// src/components/Layout/Header.js
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

const Header = ({ onShowLogin }) => {
  

  return (
    <div className="bg-blue-600 text-white p-6 rounded-b-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
           <div className="flex items-center space-x-2 mb-1">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12"
            />
            <h1 className="text-3xl font-bold">Buddy</h1>
          </div>
          <p className="text-blue-100 text-sm">한국투자증권 뱅키스 버디 1조 No.1</p>
        </div>
        <div className="flex items-center space-x-3">
          {isAdmin ? (
            <button 
              onClick={logout}
              className="px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors"
            >
              로그아웃
            </button>
          ) : (
            <button 
              onClick={onShowLogin}
              className="px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors"
            >
              로그인
            </button>
          )}
          <button className="p-2 bg-white/20 rounded-full">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/20 rounded-full relative">
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;