// src/components/Views/ContentView.js
import React, { useState, useEffect } from 'react';
import { Filter, BookOpen, Heart, MessageSquare, Share2, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { contentAPI } from '../../services/api';

const ContentView = () => {
  const { isAdmin } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState('1조');
  const [contents, setContents] = useState({});
  const [loading, setLoading] = useState(true);

  const teams = ['한국투자증권', '뱅키스', '금융', '진로', '버디'];

  // Mock data
  const mockContents = {
    '1조': [
      {
        id: 1,
        title: 'React 18의 새로운 기능과 성능 최적화',
        category: '프론트엔드',
        author: '김개발',
        company: '1조',
        likes: 124,
        comments: 18,
        readTime: '8분',
        thumbnail: 'bg-blue-100'
      },
      {
        id: 2,
        title: 'TypeScript 실전 활용법과 베스트 프랙티스',
        category: '개발',
        author: '박타입',
        company: '1조',
        likes: 89,
        comments: 23,
        readTime: '12분',
        thumbnail: 'bg-indigo-100'
      }
    ],
    '2조': [
      {
        id: 3,
        title: 'UX/UI 디자인 시스템 구축하기',
        category: '디자인',
        author: '이디자인',
        company: '2조',
        likes: 156,
        comments: 34,
        readTime: '10분',
        thumbnail: 'bg-purple-100'
      },
      {
        id: 4,
        title: 'Figma 고급 기능으로 협업 효율성 높이기',
        category: '디자인',
        author: '최피그마',
        company: '2조',
        likes: 92,
        comments: 15,
        readTime: '7분',
        thumbnail: 'bg-pink-100'
      }
    ],
    '3조': [
      {
        id: 5,
        title: '데이터 기반 마케팅 전략 수립하기',
        category: '마케팅',
        author: '정마케팅',
        company: '3조',
        likes: 201,
        comments: 42,
        readTime: '15분',
        thumbnail: 'bg-green-100'
      }
    ],
    '4조': [
      {
        id: 6,
        title: '백엔드 아키텍처 설계와 최적화',
        category: '백엔드',
        author: '서서버',
        company: '4조',
        likes: 143,
        comments: 31,
        readTime: '18분',
        thumbnail: 'bg-orange-100'
      }
    ],
    '5조': [
      {
        id: 7,
        title: '프로덕트 매니저의 역할과 성공 전략',
        category: 'PM',
        author: '이매니저',
        company: '5조',
        likes: 234,
        comments: 56,
        readTime: '11분',
        thumbnail: 'bg-red-100'
      }
    ],
    '6조': [
      {
        id: 8,
        title: '데이터 사이언스와 머신러닝 입문',
        category: '데이터',
        author: '최데이터',
        company: '6조',
        likes: 298,
        comments: 67,
        readTime: '20분',
        thumbnail: 'bg-cyan-100'
      }
    ]
  };

  useEffect(() => {
    fetchContents();
  }, [selectedTeam]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      // 실제로는 contentAPI.getContents(selectedTeam) 호출
      setTimeout(() => {
        setContents(mockContents);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
      setLoading(false);
    }
  };

  const handleLike = async (contentId) => {
    try {
      await contentAPI.likeContent(contentId);
      fetchContents();
    } catch (error) {
      console.error('Failed to like content:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">현직자 Q & A</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {teams.map((team) => (
              <button
                key={team}
                onClick={() => setSelectedTeam(team)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedTeam === team
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {isAdmin && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">콘텐츠 관리</span>
              </div>
              <button className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors">
                새 콘텐츠 추가
              </button>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-32"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {contents[selectedTeam]?.map((content) => (
              <div key={content.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex space-x-3">
                  <div className={`w-20 h-20 ${content.thumbnail} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <BookOpen className="w-10 h-10 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 mb-2">{content.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-2 mb-3">
                      <span>{content.author}</span>
                      <span>•</span>
                      <span>{content.company}</span>
                      <span>•</span>
                      <span>{content.readTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button 
                          onClick={() => handleLike(content.id)}
                          className="flex items-center hover:text-red-500 transition-colors"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          {content.likes}
                        </button>
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {content.comments}
                        </span>
                        <button className="flex items-center hover:text-gray-700">
                          <Share2 className="w-4 h-4 mr-1" />
                          공유
                        </button>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                        {content.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8">
                <p className="text-gray-500">해당 조의 콘텐츠가 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentView;