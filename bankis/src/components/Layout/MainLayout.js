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
import QuizBook from '../Views/QuizBook.js';   // ✅ QuizBook import

const MainLayout = () => {
  const [currentView, setCurrentView] = useState('home');
  const [showLogin, setShowLogin] = useState(false);

  // ✅ quiz 화면에서는 공용 헤더/하단 네비 모두 숨김
  const hideHeader = currentView === 'quiz';
  const hideBottomNav = currentView === 'quiz';

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
        return <QuizBook />; // ✅ 퀴즈는 단독 풀스크린 느낌
      default:
        return <HomeView onNavigate={setCurrentView} />;
    }
  };

  return (
    <>
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
      <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto">
        {/* ✅ 퀴즈가 아닐 때만 헤더 노출 */}
        {!hideHeader && <Header onShowLogin={() => setShowLogin(true)} />}

        {/* ✅ 스크롤 영역: 헤더/바 유무와 관계없이 자연스러운 스크롤 */}
        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>

        {/* ✅ 퀴즈가 아닐 때만 하단 네비 노출 */}
        {!hideBottomNav && (
          <BottomNavigation currentView={currentView} onNavigate={setCurrentView} />
        )}
      </div>
    </>
  );
};

export default MainLayout;
