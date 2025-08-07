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

const MainLayout = () => {
  const [currentView, setCurrentView] = useState('home');
  const [showLogin, setShowLogin] = useState(false);

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
      default:
        return <HomeView onNavigate={setCurrentView} />;
    }
  };

  return (
    <>
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
      <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto">
        <Header onShowLogin={() => setShowLogin(true)} />
        {renderView()}
        <BottomNavigation currentView={currentView} onNavigate={setCurrentView} />
      </div>
    </>
  );
};

export default MainLayout;