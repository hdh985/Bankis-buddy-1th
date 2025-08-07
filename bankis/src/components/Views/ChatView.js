// src/components/Views/ChatView.js
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Mic, Paperclip, BookOpen, Award, MessageCircle, Search, Users, TrendingUp, Heart, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chatAPI } from '../../services/api';


const ChatView = () => {
  const { isAdmin } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '안녕하세요! 👋 Buddy AI 한국이에요!\n\n제가 여러분의 뱅키스 금융 에이전트가 되어드릴게요! 🚀\n\n**🎯 오늘은 어떤 도움이 필요하신가요?**\n• 뱅키스 이벤트\n• 한국투자증권\n• 버디 활동\n• 금융\n\n위 메뉴를 클릭하시거나 자유롭게 질문해주세요! 😊',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions] = useState([
    "프론트엔드 개발자가 되려면 어떤 스킬이 필요한가요?",
    "UX 디자이너 포트폴리오 만드는 법을 알려주세요",
    "마케팅 분야로 이직하고 싶은데 조언 부탁드려요",
    "개발자 면접에서 자주 나오는 질문들이 궁금해요"
  ]);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { icon: BookOpen, text: 'BanK!S', color: 'bg-blue-500' },
    { icon: Award, text: '한국투자증권', color: 'bg-indigo-500' },
    { icon: MessageCircle, text: '버디', color: 'bg-sky-500' },
    { icon: Search, text: '정보 검색하기', color: 'bg-purple-500' },

  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('콘텐츠') || lowerMessage.includes('추천')) {
      return '🎯 **맞춤형 콘텐츠 추천**\n\n현재 인기 있는 분야들이에요:\n• 프론트엔드: React 18, TypeScript\n• 백엔드: Node.js, AWS 클라우드\n• 디자인: Figma, UX 리서치\n• 데이터: Python, 머신러닝\n• 마케팅: 데이터 분석, SNS 전략\n\n어떤 분야가 궁금하신가요? 더 구체적으로 말씀해주시면 정확한 콘텐츠를 추천해드릴게요!';
    } else if (lowerMessage.includes('스킬') || lowerMessage.includes('평가') || lowerMessage.includes('실력')) {
      return '📊 **스킬 진단 및 평가**\n\n다음 분야의 자가진단을 도와드릴 수 있어요:\n\n🔧 **기술 스킬**\n• JavaScript/TypeScript 레벨 체크\n• React/Vue 숙련도 평가\n• Python/데이터 분석 능력\n• 디자인 툴 활용도\n\n💼 **소프트 스킬**\n• 커뮤니케이션 능력\n• 문제 해결 능력\n• 리더십 역량\n\n어떤 스킬을 평가받고 싶으신가요?';
    } else if (lowerMessage.includes('커리어') || lowerMessage.includes('진로') || lowerMessage.includes('상담')) {
      return '💼 **개인 맞춤 커리어 상담**\n\n상담을 위해 다음 정보를 알려주세요:\n\n1️⃣ **현재 상황**\n• 현재 직무/학과\n• 경력/학년\n• 관심 분야\n\n2️⃣ **목표**\n• 희망 직무\n• 목표 회사\n• 시간 계획\n\n3️⃣ **고민사항**\n• 구체적인 어려움\n• 필요한 도움\n\n이런 정보를 주시면 더 정확한 커리어 로드맵을 제시해드릴 수 있어요!';
    } else {
      return '👋 Buddy AI 한국이에요!\n\n안녕하세요! 저는 한국투자증권 뱅키스 버디 AI 에이전트예요.';
    }
  };

 const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;

  const newMessage = {
    id: messages.length + 1,
    type: 'user',
    content: inputMessage,
    timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  };

  setMessages(prev => [...prev, newMessage]);
  setInputMessage('');
  setIsTyping(true);

  try {
    const res = await chatAPI.sendMessage(inputMessage); // ✅ 실제 API 호출

    const botResponse = {
      id: messages.length + 2,
      type: 'bot',
      content: res.response, // ✅ 백엔드에서 받은 답변
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botResponse]);
  } catch (error) {
    console.error('Failed to send message:', error);

    const errorResponse = {
      id: messages.length + 2,
      type: 'bot',
      content: '⚠️ 서버에서 응답을 받을 수 없습니다. 잠시 후 다시 시도해 주세요.',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, errorResponse]);
  } finally {
    setIsTyping(false);
  }
};


  const handleQuickAction = (actionText) => {
    setInputMessage(actionText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Buddy AI 한국이</h1>
              <p className="text-sm text-blue-600">한국투자증권 뱅키스 버디 에이전트</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">온라인</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600 font-medium">💡 AI 어시스턴트 메뉴</p>
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">관리자</span>
            )}
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">온라인</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.text)}
              className="flex items-center space-x-2 p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
            >
              <div className={`w-7 h-7 ${action.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs text-gray-700 font-medium">{action.text}</span>
            </button>
          ))}
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-xs text-black-600 font-medium mb-1">유의사항</p>
          <p className="text-xs text-black-500">한국이는 투자의견을 절대로 주지 않아요! 또한 민감한 개인정보는 입력하지 말아주세요</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-blue-600'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md shadow-md border border-gray-100'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-md border border-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500 mb-2 space-x-2">
          <span className="flex items-center space-x-1">
            <span>💡</span>
            <span>예시:</span>
          </span>
          <button 
            onClick={() => setInputMessage("뱅키스에 대해 알려주세요!")}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            "뱅키스에 대해 알려주세요!"
          </button>
        </div>
        <div className="flex items-end space-x-2">
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="대화를 시작해보세요"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              rows={1}
            />
          </div>
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default ChatView;