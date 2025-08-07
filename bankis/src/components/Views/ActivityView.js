// src/components/Views/ActivityView.js
import React, { useState, useEffect } from 'react';
import { BookOpen, MessageCircle, Clock, ChevronRight, Plus } from 'lucide-react';
import { activityAPI } from '../../services/api';

const ActivityView = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ contentViews: 47, chatMessages: 128 });
  const [loading, setLoading] = useState(true)
  console.log("✅ ActivityView loaded");
  // Mock data
  const mockActivities = [
    {
      id: 1,
      title: 'React 18의 새로운 기능들',
      description: '콘텐츠를 조회했습니다',
      date: '2024-01-15',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'AI 챗봇과의 대화',
      description: '프론트엔드 개발 관련 질문',
      date: '2024-01-14',
      icon: MessageCircle,
      color: 'bg-indigo-500'
    },
    {
      id: 3,
      title: 'UX 디자인 트렌드',
      description: '콘텐츠를 조회했습니다',
      date: '2024-01-13',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      id: 4,
      title: '커리어 상담',
      description: 'AI와 진로 상담 진행',
      date: '2024-01-12',
      icon: MessageCircle,
      color: 'bg-sky-500'
    }
  ];

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      // 실제로는 activityAPI.getActivities() 호출
      setTimeout(() => {
        setActivities(mockActivities);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">이벤트</h1>
            <button className="flex items-center space-x-1 text-blue-600 text-sm">
              <Plus className="w-4 h-4" />
              <span>New 이벤트</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-500 text-white rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">진행 중인 이벤트</p>
                <p className="text-2xl font-bold">{stats.contentViews}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-blue-600 text-white rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">마감된 이벤트</p>
                <p className="text-2xl font-bold">{stats.chatMessages}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-200" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">최근 이벤트</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-20"></div>
              ))}
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <activity.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{activity.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.date}
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityView;