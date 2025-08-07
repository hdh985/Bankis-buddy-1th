// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

const checkAuth = async () => {
  try {
    const token = localStorage.getItem('buddy_token');
    console.log('[DEBUG] token from localStorage in checkAuth:', token);
    if (token) {
      const userData = await authAPI.verifyToken(); // 헤더에 토큰 자동 포함됨
      setUser(userData);
      setIsAdmin(userData.is_admin);  // 실제 값에 따라 처리
    }
  } catch (error) {
    localStorage.removeItem('buddy_token');
  } finally {
    setIsLoading(false);
  }
};


const login = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);
    const { access_token, user_id } = response;

    localStorage.setItem('buddy_token', access_token);
    setUser({ id: user_id });  // ✅ 일단 기본 세팅
    setIsAdmin(false);
    console.log('[DEBUG] login() called with:', credentials);
    console.log('[DEBUG] login() response:', response);

    // ✅ 서버에서 최신 사용자 정보 다시 fetch
    await checkAuth();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('buddy_token');
      setUser(null);
      setIsAdmin(false);
    }
  };

  const value = {
    user,
    isAdmin,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};