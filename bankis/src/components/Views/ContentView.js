import React, { useState, useEffect } from 'react';
import {
  Filter,
  BookOpen,
  Heart,
  MessageSquare,
  Share2,
  Plus,
  X,
  Trash2,
  Edit
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { contentAPI } from '../../services/api';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

const ContentView = () => {
  const { isAdmin, currentUser } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState('한국투자증권');
  const [contents, setContents] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', content: '' });
  const [editId, setEditId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); 
  const teams = ['한국투자증권', '뱅키스', '금융', '진로', '버디'];
  const categories = ['한국투자증권', '뱅키스', '금융', '진로', '버디'];

  useEffect(() => {
    fetchContents();
  }, [selectedTeam]);

const fetchContents = async () => {
  setLoading(true);
  try {
    const rawList = await contentAPI.getContents(); // ← flat list
    const grouped = rawList.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    setContents(grouped);
  } catch (err) {
    console.error('콘텐츠 불러오기 실패:', err);
  } finally {
    setLoading(false);
  }
};


  const handleLike = async (contentId) => {
    try {
      await contentAPI.likeContent(contentId);
      fetchContents();
    } catch (err) {
      console.error('좋아요 실패:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await contentAPI.deleteContent(id);
        fetchContents();
      } catch (err) {
        console.error('삭제 실패:', err);
      }
    }
  };

  const handleEdit = (content) => {
    setEditId(content.id);
    setForm({
      title: content.title,
      category: content.category,
      content: content.content
    });
    setShowModal(true);
  };
 const handleSubmit = async () => {
  if (!form.title || !form.category || !form.content) {
    setErrorMessage('모든 필드를 입력해주세요.');
    return;
  }

  try {
    if (editId) {
      await contentAPI.updateContent(editId, { ...form });
    } else {
      await contentAPI.createContent({ ...form });
    }

    setShowModal(false);
    setForm({ title: '', category: '', content: '' });
    setEditId(null);
    setErrorMessage('');
    fetchContents();
  } catch (err) {
    console.error('등록/수정 실패:', err);
    setErrorMessage('서버 오류가 발생했습니다.');
  }
};

  
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">현직자 Q & A</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => { setEditId(null); setShowModal(true); }}>
              <Plus className="w-5 h-5 text-blue-600" />
            </button>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {teams.map((team) => (
              <button
                key={team}
                onClick={() => setSelectedTeam(team)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedTeam === team ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-32"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {contents[selectedTeam]?.length ? contents[selectedTeam].map(content => (
              <div key={content.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex space-x-3">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-10 h-10 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    
                    <h3 className="font-semibold text-gray-800 mb-2">{content.title}</h3>
                    {/* ✅ 본문 내용 추가 */}
                    <p className="text-gray-700 text-sm mb-3 whitespace-pre-line">
                      {content.content}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 space-x-2 mb-3">
                      <span>{content.author}</span><span>•</span><span>{content.company}</span><span>익명</span><span>{content.readTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button onClick={() => handleLike(content.id)} className="flex items-center hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4 mr-1" /> {content.likes}
                        </button>
                        <span className="flex items-center"><MessageSquare className="w-4 h-4 mr-1" /> {content.comments}</span>
                        <button className="flex items-center hover:text-gray-700"><Share2 className="w-4 h-4 mr-1" /> 공유</button>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">{content.category}</span>
                    </div>
                    {isAdmin && (
                      <div className="flex space-x-2 mt-2">
                        <button onClick={() => handleEdit(content)} className="text-sm text-blue-600 hover:underline"><Edit size={16} /> 수정</button>
                        <button onClick={() => handleDelete(content.id)} className="text-sm text-red-500 hover:underline"><Trash2 size={16} /> 삭제</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">콘텐츠가 없습니다.</div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-xl font-bold mb-4">{editId ? 'Q&A 수정' : 'Q&A 등록'}</h2>
        <input
          type="text"
          placeholder="제목"
          className="w-full mb-3 p-2 border rounded"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <select
          className="w-full mb-3 p-2 border rounded bg-white"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <textarea
          placeholder="내용을 입력하세요"
          className="w-full mb-3 p-2 border rounded h-32 resize-none"
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={handleSubmit}
        >
          {editId ? '수정하기' : '등록하기'}
        </button>
      </Modal>
    </div>
  );
};

export default ContentView;
