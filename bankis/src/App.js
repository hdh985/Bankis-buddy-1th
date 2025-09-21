// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import './App.css';
import useGaPageview from './hooks/useGaPageview';

function GaTracker() {
  useGaPageview();
  return null; // 훅만 실행하고 아무 것도 렌더하지 않음
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <GaTracker />        {/* ✅ 라우터 안쪽에 훅 마운트 */}
        <div className="App">
          <MainLayout />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
