// src/components/Layout/BottomNavigation.js
import React from 'react';
import { 
  Home, 
  BookOpen, 
  MessageCircle, 
  Award, 
  School   // ✅ 퀴즈 아이콘
} from 'lucide-react';

const BottomNavigation = ({ currentView, onNavigate }) => {
  const navItems = [
    { icon: Home, label: '홈', view: 'home' },
    { icon: BookOpen, label: '현직자 Q&A', view: 'content' },
    { icon: MessageCircle, label: 'AI챗봇', view: 'chat' },
    { icon: Award, label: '오늘의 운세', view: 'activity' },
    { icon: School, label: '금융 퀴즈 해설집', view: 'quiz' } // ✅ 추가된 부분
  ];

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => onNavigate(item.view)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentView === item.view 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
