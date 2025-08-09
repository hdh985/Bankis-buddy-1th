// src/components/Views/ChatView.js
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { chatAPI } from '../../services/api';
import buddyAvatar from '../../assets/buddy-avatar.png';

const ChatView = ({ botAvatarPath = buddyAvatar }) => {
  const { isAdmin } = useAuth();

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content:
        '안녕하세요! 👋 Buddy AI 한국이에요!\n\n제가 여러분의 뱅키스 금융 에이전트가 되어드릴게요! 🚀\n\n궁금한 걸 자유롭게 물어봐 주세요! 😊',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const listRef = useRef(null);
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  // 아바타 로드 실패 시 폴백
  const [avatarError, setAvatarError] = useState(false);
  // ✅ 아바타 경로가 바뀌면 에러 상태 리셋
  useEffect(() => {
    setAvatarError(false);
  }, [botAvatarPath]);

  const scrollToBottom = (smooth = true) => {
    endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const [showScrollFab, setShowScrollFab] = useState(false);
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setShowScrollFab(!nearBottom);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 입력창 자동 높이
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [inputMessage]);

  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text) return;

    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await chatAPI.sendMessage(text);
      const botMsg = {
        id: userMsg.id + 1,
        type: 'bot',
        content: res?.response ?? '답변이 도착했어요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Failed to send message:', err);
      const botMsg = {
        id: messages.length + 2,
        type: 'bot',
        content: '⚠️ 서버에서 응답을 받을 수 없습니다. 잠시 후 다시 시도해 주세요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isSameSenderAsPrev = (idx) =>
    idx > 0 && messages[idx].type === messages[idx - 1].type;

  return (
    // 🔵 배경 그라디언트/블롭 제거 → 깔끔한 흰 바탕
    <div className="relative flex h-full flex-col bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-sm" />
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
                {!avatarError ? (
                  <img
                    src={botAvatarPath}
                    alt="한국이"
                    className="h-full w-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <Bot className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">Buddy AI 한국이</h1>
              <p className="text-xs text-blue-600">한국투자증권 뱅키스 버디 에이전트</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-600">
                관리자
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              온라인
            </span>
          </div>
        </div>
      </div>

      {/* 메시지 리스트 */}
      <div
        ref={listRef}
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((m, idx) => {
          const mine = m.type === 'user';
          const grouped = isSameSenderAsPrev(idx);
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[78%] items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                {/* 아바타 */}
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                  {mine ? (
                    <User className="h-4 w-4 text-white" />
                  ) : !avatarError ? (
                    <img
                      src={botAvatarPath}
                      alt="한국이"
                      className="h-8 w-8 rounded-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* 말풍선 */}
                <div
                  className={[
                    'relative rounded-2xl px-4 py-3 text-sm shadow-sm ring-1',
                    mine
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-blue-600/30'
                      : 'bg-white text-gray-800 ring-gray-100',
                    grouped
                      ? mine
                        ? 'rounded-tr-md'
                        : 'rounded-tl-md'
                      : ''
                  ].join(' ')}
                >
                  {!grouped && (
                    <span
                      className={[
                        'absolute -bottom-1 h-3 w-3 rotate-45',
                        mine ? 'right-3 bg-indigo-600/90' : 'left-3 bg-white'
                      ].join(' ')}
                      aria-hidden
                    />
                  )}
                  <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                  <p className={`mt-1 text-[10px] ${mine ? 'text-blue-100' : 'text-gray-500'}`}>
                    {m.timestamp}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* 타이핑 표시 */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex max-w-[78%] items-end gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                {!avatarError ? (
                  <img
                    src={botAvatarPath}
                    alt="한국이"
                    className="h-8 w-8 rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="rounded-2xl rounded-tl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:240ms]" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="대화를 시작해보세요"
                rows={1}
                className="max-h-40 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none ring-blue-200 transition focus:bg-white focus:ring-2"
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className={[
                'rounded-full p-3 text-white shadow-lg transition-all',
                inputMessage.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300/40 animate-[pulse_2.4s_ease-in-out_infinite]'
                  : 'bg-blue-300 cursor-not-allowed opacity-70'
              ].join(' ')}
              title="전송"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 스크롤 하단 이동 FAB */}
      {showScrollFab && (
        <button
          onClick={() => scrollToBottom()}
          className="group fixed bottom-24 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-xl transition hover:from-indigo-500 hover:to-blue-500"
          title="아래로 이동"
          aria-label="아래로 이동"
        >
          <svg className="h-5 w-5 transition-transform group-hover:translate-y-0.5" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatView;
