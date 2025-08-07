// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <MainLayout />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;