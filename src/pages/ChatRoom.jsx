import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { selectCurrentUser } from '../store/authSlice';
import { fetchMyRequests, fetchChatHistory } from '../services/ownerChatService';
import { Send, ChevronLeft, Loader2, User, Check, CheckCheck } from 'lucide-react';

const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Number(payload.user_id ?? payload.id ?? payload.sub);
  } catch (err) {
    return null;
  }
};

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const { data: requests } = useQuery({
    queryKey: ['chat-requests'],
    queryFn: fetchMyRequests,
  });

  const { 
    data: historyPages, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading: historyLoading,
    isSuccess: isHistoryLoaded
  } = useInfiniteQuery({
    queryKey: ['chat-history', roomId],
    queryFn: ({ pageParam = null }) => fetchChatHistory(roomId, pageParam),
    getNextPageParam: (lastPage) => lastPage.next || undefined,
    enabled: !!roomId,
  });

  const chatRequests = Array.isArray(requests) ? requests : (requests?.results ?? []);
  const currentRequest = chatRequests.find(r => String(r.room) === String(roomId));

  const queryClient = useQueryClient();

  const [liveMessages, setLiveMessages] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('connecting');
  
  const ws = useRef(null);
  const scrollRef = useRef(null);
  const topSentinelRef = useRef(null);
  const observerRef = useRef(null);
  const isFirstLoad = useRef(true);
  const prevScrollHeight = useRef(0);

  // Clear live messages when changing rooms so they don't bleed over
  // Also explicitly invalidate the old room's cache so it fetches fresh data next time you open it
  useEffect(() => {
    setLiveMessages([]);
    isFirstLoad.current = true;
    prevScrollHeight.current = 0;

    return () => {
      if (roomId) {
        queryClient.invalidateQueries({ queryKey: ['chat-history', roomId] });
      }
    };
  }, [roomId, queryClient]);

  const currentUserId = 
    (currentUser?.id != null ? Number(currentUser.id) : null) ??
    (currentUser?.pk != null ? Number(currentUser.pk) : null) ??
    getUserIdFromToken();

  const isMeReceiver = currentRequest && Number(currentRequest.receiver) === currentUserId;
  const otherPersonName = currentRequest 
    ? (isMeReceiver
        ? (currentRequest?.sender_details?.username || `User #${currentRequest?.sender}`)
        : (currentRequest?.receiver_details?.username || `User #${currentRequest?.receiver}`))
    : 'Chat Room';

  const myUsername = useMemo(() => currentUser?.username, [currentUser]);
  const emailPrefix = useMemo(() => currentUser?.email?.split('@')[0], [currentUser]);

  const getInitialTickStatus = (isDelivered, isRead) => {
    if (isRead) return 'seen';
    if (isDelivered) return 'delivered';
    return 'sent';
  };

  const allMessages = useMemo(() => {
    const historical = historyPages?.pages.flatMap(page => page.results || []) || [];
    
    const formattedHistorical = historical.map(msg => ({
      id: msg.id,
      content: msg.content || msg.message,
      sender: msg.sender_id || msg.sender,
      timestamp: msg.timestamp || msg.created_at,
      tickStatus: getInitialTickStatus(msg.is_delivered, msg.is_read || msg.is_seen)
    }));

    const sortedHistorical = formattedHistorical.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    return [...sortedHistorical, ...liveMessages];
  }, [historyPages, liveMessages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          if (scrollRef.current) prevScrollHeight.current = scrollRef.current.scrollHeight;
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
    if (topSentinelRef.current) observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (isFirstLoad.current && allMessages.length > 0) {
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 50);
      isFirstLoad.current = false;
    } else if (isFetchingNextPage) {
      // Do nothing
    } else if (prevScrollHeight.current > 0) {
      const heightDifference = scrollRef.current.scrollHeight - prevScrollHeight.current;
      scrollRef.current.scrollTop += heightDifference;
      prevScrollHeight.current = 0;
    } else if (liveMessages.length > 0) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [allMessages, isFetchingNextPage, liveMessages]);

  const connectWebSocket = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (ws.current) {
      ws.current.close(1000);
    }

    setStatus('connecting');
    const socketUrl = `ws://localhost:8000/ws/chat/${roomId}/?token=${token}`;
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => setStatus('open');

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        // If the backend includes room_id, ensure it matches the current room
        if (data.room_id && String(data.room_id) !== String(roomId)) {
          return; // Ignore messages from other rooms
        }

        if (data.type === 'message') {
          setLiveMessages(prev => {
            const exists = prev.find(m => m.id === data.msg_id);
            if (exists) {
              return prev.map(m => m.id === data.msg_id ? { ...m, tickStatus: getInitialTickStatus(data.is_delivered, data.is_read) } : m);
            }
            return [...prev, {
              id: data.msg_id,
              content: data.message,
              sender: data.sender,
              timestamp: data.timestamp,
              tickStatus: getInitialTickStatus(data.is_delivered, data.is_read)
            }];
          });
        } else if (data.type === 'seen') {
          setLiveMessages(prev => prev.map(msg => 
            msg.id === data.message_id ? { ...msg, tickStatus: 'seen' } : msg
          ));
        }
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    ws.current.onclose = () => setStatus('closed');
  }, [roomId]);

  useEffect(() => {
    if (isHistoryLoaded) {
      connectWebSocket();
    }
    return () => {
      if (ws.current) ws.current.close(1000);
    };
  }, [roomId, isHistoryLoaded, connectWebSocket]);

  const sendSeenEvent = useCallback((messageId) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'seen', message_id: messageId, room_id: roomId }));
    }
  }, [roomId]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = parseInt(entry.target.getAttribute('data-id'));
          const sender = entry.target.getAttribute('data-sender');
          const tickStatus = entry.target.getAttribute('data-status');
          
          const isMe = 
            (sender != null && String(sender) === String(currentUserId)) ||
            (sender && myUsername && String(sender).toLowerCase() === myUsername.toLowerCase()) ||
            (sender && emailPrefix && String(sender).toLowerCase() === emailPrefix.toLowerCase());

          if (!isMe && tickStatus !== 'seen') {
            sendSeenEvent(messageId);
            setLiveMessages(prev => prev.map(msg => 
              msg.id === messageId ? { ...msg, tickStatus: 'seen' } : msg
            ));
          }
        }
      });
    }, { root: scrollRef.current, threshold: 0.5 });

    return () => observerRef.current?.disconnect();
  }, [currentUserId, myUsername, emailPrefix, sendSeenEvent]);

  const messageElementRef = useCallback((node) => {
    if (node && observerRef.current) observerRef.current.observe(node);
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || status !== 'open') return;
    
    // Reverted to match your original exact payload format to avoid any backend confusion
    ws.current.send(JSON.stringify({ type: 'message', message: input.trim() }));
    
    // Note: Removed the optimistic "fake" message insertion here. 
    // This prevents the bug where you see your own message twice (once fake, once from the server echo).
    
    setInput('');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 h-[calc(100vh-100px)] flex flex-col">
      <div className="bg-white rounded-t-3xl p-6 border-b border-slate-50 flex items-center justify-between shadow-sm">
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
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'open' ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {status === 'open' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white overflow-y-auto p-8 space-y-4 scrollbar-hide" ref={scrollRef} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
        
        <div ref={topSentinelRef} className="h-4 w-full flex items-center justify-center">
            {isFetchingNextPage && <Loader2 size={20} className="animate-spin text-slate-300" />}
        </div>

        {!isFetchingNextPage && hasNextPage && (
            <div className="text-center py-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Scroll up for more</span>
            </div>
        )}

        {historyLoading && !isFetchingNextPage && (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-200" size={32} /></div>
        )}

        {allMessages.map((msg, i) => {
          const isMe = 
            (msg.sender != null && String(msg.sender) === String(currentUserId)) ||
            (msg.sender && myUsername && String(msg.sender).toLowerCase() === myUsername.toLowerCase()) ||
            (msg.sender && emailPrefix && String(msg.sender).toLowerCase() === emailPrefix.toLowerCase());

          return (
            <div 
              key={msg.id || i} 
              ref={!isMe ? messageElementRef : null}
              data-id={msg.id}
              data-sender={msg.sender}
              data-status={msg.tickStatus}
              className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] p-4 rounded-2xl text-sm relative shadow-sm ${isMe
                  ? 'bg-[#635465] text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}>
                <p className="leading-relaxed">{msg.content}</p>
                
                <div className={`flex items-center gap-1.5 mt-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[9px] font-bold uppercase ${isMe ? 'opacity-70' : 'text-slate-400'}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                  
                  {isMe && (
                    <div className="flex">
                      {msg.tickStatus === 'seen' ? (
                        <CheckCheck size={14} className="text-blue-400" />
                      ) : msg.tickStatus === 'delivered' ? (
                        <CheckCheck size={14} className="opacity-50" />
                      ) : (
                        <Check size={14} className="opacity-50" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-b-3xl p-6 border-t border-slate-50 shadow-lg">
        <form onSubmit={handleSend} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== 'open'}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-[#635465]/20"
          />
          <button
            type="submit"
            disabled={!input.trim() || status !== 'open'}
            className="bg-[#635465] text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            Send <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
