import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { selectCurrentUser, selectAuthToken } from '../store/authSlice';
import wsService from '../services/websocketService';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectAuthToken);
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  const handleNewMessage = useCallback((data) => {
    const isChatMessage = data.message && data.msg_id;
    const isSeenEvent = data.type === 'seen';

    if (isChatMessage) {
      const checkIsOwn = (sender) => {
        if (!user || !sender) return false;
        // Check if sender matches username (case-insensitive) or ID
        const senderStr = String(sender).toLowerCase();
        const myName = String(user.username || '').toLowerCase();
        const myEmail = String(user.email || '').toLowerCase();
        const myId = String(user.id || user.pk || '');
        
        return senderStr === myName || senderStr === myEmail || senderStr === myId;
      };

      const msgObj = {
        id: data.msg_id,
        content: data.message,
        sender_name: data.sender,
        is_own: checkIsOwn(data.sender),
        created_at: data.timestamp || new Date().toISOString(),
        is_seen: false,
        is_delivered: true
      };

      setMessages((prev) => {
        if (prev.find(m => m.id === msgObj.id)) return prev;
        return [...prev, msgObj];
      });
      
      // Show toast only if we are NOT in the active room and it's not our own message
      const isCurrentRoom = String(data.room_id || activeRoom) === String(activeRoom);
      
      if (data.sender !== user?.username && !isCurrentRoom) {
        // Refresh notifications instantly
        queryClient.invalidateQueries(['notifications']);

        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in fade-in slide-in-from-top-2' : 'animate-out fade-out slide-out-to-top-2'} max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex border border-slate-100 p-4`}>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                            {msgObj.sender_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900">{msgObj.sender_name}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{msgObj.content}</p>
                        </div>
                    </div>
                </div>
            </div>
        ), { duration: 4000 });
      }

      // Always send seen event if we ARE in the active room and it's not our message
      if (data.sender !== user?.username && isCurrentRoom) {
        wsService.send({ type: 'seen', message_id: msgObj.id });
      }
    } else if (isSeenEvent) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.message_id ? { ...msg, is_seen: true } : msg
        )
      );
    }
  }, [user?.username]);

  useEffect(() => {
    if (activeRoom && token) {
      wsService.connect(activeRoom, token);
      wsService.on('onMessage', handleNewMessage);
    }
    return () => wsService.disconnect();
  }, [activeRoom, token, handleNewMessage]);

  const sendMessage = (content) => {
    if (!activeRoom) return;
    // Don't append temp message to avoid duplicates, the backend echoes it back
    wsService.send({ message: content, type: 'chat_message' });
  };

  const setTyping = (isTyping) => {
    wsService.send({ type: 'typing', is_typing: isTyping });
  };

  const loadHistoricalMessages = useCallback((newMessages) => {
    setMessages((prev) => {
      const merged = [...prev];
      newMessages.forEach((msg) => {
        if (!merged.find((m) => m.id === msg.id)) {
          merged.push(msg);
        }
      });
      return merged.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        loadHistoricalMessages,
        activeRoom,
        setActiveRoom,
        sendMessage,
        setTyping,
        typingUsers,
        onlineUsers,
        unreadCounts,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
