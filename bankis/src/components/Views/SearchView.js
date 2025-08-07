// src/components/Views/SearchView.js
import React from 'react';
import { Search } from 'lucide-react';

const SearchView = ({ onNavigate }) => {
  return (
    <div className="flex-1 overflow-y-auto flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">검색 기능</h2>
        <p className="text-gray-600 mb-4">원하는 정보를 빠르게 찾아보세요!</p>
        <button 
          onClick={() => onNavigate('chat')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          AI 챗봇으로 질문하기
        </button>
      </div>
    </div>
  );
};

export default SearchView;