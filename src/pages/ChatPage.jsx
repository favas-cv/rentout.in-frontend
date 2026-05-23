import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, Loader2, User } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import MessageBubble from '../components/chat/MessageBubble';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/authSlice';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMyRequests, fetchChatHistory } from '../services/ownerChatService';

const ChatPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { messages, setMessages, loadHistoricalMessages, sendMessage, setTyping, typingUsers, setActiveRoom } = useChat();
  const user = useSelector(selectCurrentUser);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  // Set active room for context and clear messages to prevent bleed-over
  useEffect(() => {
    setActiveRoom(roomId);
    return () => {
      setActiveRoom(null);
      setMessages([]); // Ensure messages don't leak into the next room
      if (roomId) queryClient.invalidateQueries({ queryKey: ['chat-history', roomId] });
    };
  }, [roomId, setActiveRoom, setMessages, queryClient]);

  // Fetch Chat Requests (for Header info)
  const { data: requests } = useQuery({
    queryKey: ['chat-requests'],
    queryFn: fetchMyRequests,
  });

  // Infinite Query for Chat History
  const { 
    data: historyPages, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading: historyLoading 
  } = useInfiniteQuery({
    queryKey: ['chat-history', roomId],
    queryFn: ({ pageParam = null }) => fetchChatHistory(roomId, pageParam),
    getNextPageParam: (lastPage) => lastPage.next || undefined,
    enabled: !!roomId,
  });

  const chatRequests = Array.isArray(requests) ? requests : (requests?.results ?? []);
  const currentRequest = chatRequests.find(r => String(r.room) === String(roomId));

  const otherPersonName = useMemo(() => {
    if (!currentRequest || !user) return 'Chat';
    const isMeReceiver = Number(currentRequest.receiver) === Number(user.id);
    return isMeReceiver
        ? (currentRequest?.sender_details?.username || `User #${currentRequest?.sender}`)
        : (currentRequest?.receiver_details?.username || `User #${currentRequest?.receiver}`);
  }, [currentRequest, user]);

  // Combine historical and realtime messages
  useEffect(() => {
    if (historyPages) {
        const historical = historyPages.pages.flatMap(page => page.results || []) || [];
        
        // Map historical to the format used in context
        const formattedHistorical = historical.map(m => {
            const senderName = m.sender_details?.username || m.sender;
            
            const checkIsOwn = (name, id) => {
                if (!user) return false;
                const nameStr = String(name || '').toLowerCase();
                const idStr = String(id || '');
                const myName = String(user.username || '').toLowerCase();
                const myId = String(user.id || user.pk || '');
                return nameStr === myName || idStr === myId;
            };

            return {
                id: m.id || m.msg_id,
                content: m.content || m.message,
                sender_name: senderName,
                is_own: checkIsOwn(senderName, m.sender),
                created_at: m.timestamp || m.created_at,
                is_seen: m.is_seen,
                is_delivered: true
            };
        });

        loadHistoricalMessages(formattedHistorical);
    }
  }, [historyPages, loadHistoricalMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
    setTyping(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white rounded-t-[2rem] p-6 border-b border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#635465]/10 rounded-xl flex items-center justify-center text-[#635465]">
              <User size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{otherPersonName}</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {Object.values(typingUsers).some(Boolean) ? 'Typing...' : 'Online'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-white overflow-y-auto p-6 space-y-4 custom-scrollbar"
      >
        {historyLoading && !isFetchingNextPage ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-200" size={32} /></div>
        ) : (
          <div className="flex flex-col">
            {hasNextPage && (
              <button 
                onClick={() => fetchNextPage()} 
                disabled={isFetchingNextPage}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest self-center mb-4 hover:text-slate-600"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load older messages'}
              </button>
            )}
            
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isOwn={msg.is_own} 
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-b-[2rem] p-6 border-t border-slate-100 shadow-md">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
                setInputText(e.target.value);
                setTyping(true);
            }}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-[#635465]/20 font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-[#635465] text-white p-4 rounded-2xl font-black shadow-lg shadow-[#635465]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
