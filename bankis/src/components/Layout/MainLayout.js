// src/components/Layout/MainLayout.js
import React, { useState } from 'react';
import BottomNavigation from './BottomNavigation';
import Header from './Header';
import LoginModal from '../Auth/LoginModal';
import HomeView from '../Views/HomeView';
import ContentView from '../Views/ContentView';
import ChatView from '../Views/ChatView';
import ActivityView from '../Views/ActivityView';
import SearchView from '../Views/SearchView';
import QuizBook from '../Views/QuizBook.js';

const MainLayout = () => {
  const [currentView, setCurrentView] = useState('home');
  const [showLogin, setShowLogin] = useState(false);

  // ✅ 홈/퀴즈/행운추첨에서는 공용 헤더와 하단 네비 모두 숨김
  const fullScreenViews = ['home', 'quiz', 'activity'];
  const hideHeader = fullScreenViews.includes(currentView);
  const hideBottomNav = fullScreenViews.includes(currentView);

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView onNavigate={setCurrentView} />;
      case 'content':
        return <ContentView />;
      case 'chat':
        return <ChatView />;
      case 'activity':
        return <ActivityView />;
      case 'search':
        return <SearchView onNavigate={setCurrentView} />;
      case 'quiz':
        // ✅ onNavigate를 넘겨야 퀴즈북에서 '행운 추첨' 버튼으로 Activity로 이동 가능
        return <QuizBook onNavigate={setCurrentView} />;
      default:
        return <HomeView onNavigate={setCurrentView} />;
    }
  };

  return (
    <>
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
      <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto">
        {/* ✅ 홈/퀴즈/행운추첨이 아닐 때만 헤더 */}
        {!hideHeader && <Header onShowLogin={() => setShowLogin(true)} />}

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>

        {/* ✅ 홈/퀴즈/행운추첨이 아닐 때만 하단 네비 */}
        {!hideBottomNav && (
          <BottomNavigation
            currentView={currentView}
            onNavigate={setCurrentView}
          />
        )}
      </div>
    </>
  );
};

export default MainLayout;
