// src/components/Views/ActivityView.js
import React, { useState, useEffect } from 'react';
import {
  BookOpen, MessageCircle, Clock, ChevronRight, Plus, Trash2, Edit,
} from 'lucide-react';
import { activityAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ActivityView = () => {
  const { isAdmin } = useAuth();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ contentViews: 0, chatMessages: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: '', description: '', date: '', image: null });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await activityAPI.getActivities();
      setActivities(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newActivity.title);
      formData.append('description', newActivity.description);
      formData.append('date', newActivity.date);
      if (newActivity.image) formData.append('image', newActivity.image);

      await activityAPI.createActivity(formData);
      fetchActivities();
      setShowModal(false);
      setNewActivity({ title: '', description: '', date: '', image: null });
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await activityAPI.deleteActivity(id);
      fetchActivities();
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">이벤트</h1>
            {isAdmin && (
              <button onClick={() => setShowModal(true)} className="flex items-center space-x-1 text-blue-600 text-sm">
                <Plus className="w-4 h-4" />
                <span>New 이벤트</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">최근 이벤트</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-20"></div>
              ))}
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={activity.image_url} alt="img" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{activity.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.date}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex flex-col items-end gap-1">
                      <button className="p-1 hover:bg-gray-100 rounded-full">
                        <Edit className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 rounded-full"
                        onClick={() => handleDelete(activity.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">이벤트 등록</h2>
            <input
              type="text"
              placeholder="제목"
              value={newActivity.title}
              onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            />
            <textarea
              placeholder="설명"
              value={newActivity.description}
              onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            />
            <input
              type="date"
              value={newActivity.date}
              onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            />
            <input
              type="file"
              onChange={(e) => setNewActivity({ ...newActivity, image: e.target.files[0] })}
              className="w-full p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">취소</button>
              <button onClick={handleAddActivity} className="px-4 py-2 bg-blue-600 text-white rounded">등록</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityView;
