// src/components/Views/HomeView.js
import React, { useState, useEffect } from 'react';
import { BookOpen, MessageCircle, Award, Search, ChevronRight, Star, Heart, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { contentAPI, activityAPI } from '../../services/api';
import hankuk from '../../assets/hankuk.png';

const HomeView = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ contentViews: 47, aiResponses: 128, messages: 234 });
  const [popularContents, setPopularContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock data - 실제로는 API 호출
      const mockStats = { contentViews: 47, aiResponses: 128, messages: 234 };
      const mockContents = [
        {
          id: 1,
          title: 'React 18의 새로운 기능과 성능 최적화',
          category: '프론트엔드',
          author: '김개발',
          team: '1조',
          likes: 124,
          comments: 18,
          readTime: '8분',
          thumbnail: 'bg-blue-100'
        },
        {
          id: 2,
          title: 'UX/UI 디자인 시스템 구축하기',
          category: '디자인',
          author: '이디자인',
          team: '2조',
          likes: 156,
          comments: 34,
          readTime: '10분',
          thumbnail: 'bg-purple-100'
        }
      ];
      
      setStats(mockStats);
      setPopularContents(mockContents);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickMenus = [
    
    { icon: MessageCircle, label: 'AI 챗봇', action: () => onNavigate('chat') },
   
  ];

  return (
    <div className="flex-1 overflow-y-auto">
  {isAdmin ? (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 mx-6">
      <h2 className="text-lg font-bold mb-2 text-white">안녕하세요, {user?.name || '버디 활동 인원'}님! 👋</h2>
      <p className="text-blue-100 text-sm mb-3">관리자 권한으로 모든 기능을 이용할 수 있습니다</p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-xl font-bold text-white">{stats.contentViews}</div>
          <div className="text-xs text-blue-200">콘텐츠 관리</div>
        </div>
        <div>
          <div className="text-xl font-bold text-white">{stats.aiResponses}</div>
          <div className="text-xs text-blue-200">사용자 응답</div>
        </div>
        <div>
          <div className="text-xl font-bold text-white">{stats.messages}</div>
          <div className="text-xs text-blue-200">전체 메시지</div>
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-2xl p-4 mb-4 mx-6 shadow-md">
      <h2 className="text-lg font-bold mb-2 text-gray-800">익명 사용자님 환영합니다! 👋</h2>
      <p className="text-sm text-gray-600 mb-3">AI 어시스턴트와 함께하는 커리어 성장 여정</p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-xl font-bold text-gray-900">{stats.contentViews}</div>
          <div className="text-xs text-gray-500">누적 방문수</div>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900">{stats.aiResponses}</div>
          <div className="text-xs text-gray-500">AI 응답</div>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900">{stats.messages}</div>
          <div className="text-xs text-gray-500">질문 수</div>
        </div>
      </div>
    </div>
  )}
<div className="flex justify-center mt-4">
  <button
    onClick={quickMenus[0].action}
    className="bg-white rounded-2xl p-6 flex flex-col items-center space-y-3 hover:bg-gray-100 transition-colors shadow-md border border-gray-200 w-96"
  >
    {/* 캐릭터 이미지 삽입 */}
    <img
      src={hankuk}  // public/assets/ 경로에 이미지 파일 위치
      alt="AI 캐릭터"
      className="w-80 h-80 object-contain"
    />
    
    {/* 아이콘 + 라벨 */}
    <div className="flex items-center space-x-2">
      <MessageCircle className="w-5 h-5 text-black" />
      <span className="text-lg font-semibold text-black">한국이</span>
    </div>

    {/* 부가 설명 */}
    <p className="text-sm text-gray-500 text-center">
      한국투자증권 뱅키스 버디 AI 한국이
    </p>
  </button>
</div>



      <div className="p-4 mt-4">
        {isAdmin && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">버디 활동 인원 전용</span>
            </div>
            <p className="text-xs text-blue-500">이벤트 업로드, 사용자 관리, 통계 조회 등 관리 기능을 이용할 수 있습니다.</p>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">🔥 진행 중인 이벤트</h2>
          <button onClick={() => onNavigate('activity')} className="text-blue-600 text-sm flex items-center">
            전체보기 <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-20"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {popularContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ContentCard = ({ content }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
    <div className="flex space-x-3">
      <div className={`w-16 h-16 ${content.thumbnail || 'bg-blue-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <BookOpen className="w-8 h-8 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 mb-1">{content.title}</h3>
        <div className="flex items-center text-xs text-gray-500 space-x-2 mb-2">
          <span>{content.author}</span>
          <span>•</span>
          <span>{content.team}</span>
          <span>•</span>
          <span>{content.readTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span className="flex items-center">
              <Heart className="w-3 h-3 mr-1" />
              {content.likes}
            </span>
            <span className="flex items-center">
              <MessageSquare className="w-3 h-3 mr-1" />
              {content.comments}
            </span>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
            {content.category}
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default HomeView;