import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Check, CheckCheck, Send, Loader2 } from 'lucide-react';

const WEBSOCKET_BASE_URL = 'ws://127.0.0.1:8000/ws/chat'; // Change to YOUR_IP
const API_BASE_URL = 'http://127.0.0.1:8000'; // Change to YOUR_IP

// The ChatScreen Component (React Web)
// This implements the requested specs using IntersectionObserver 
// to simulate React Native's onViewableItemsChanged.
const ChatScreen = ({ roomId, currentUser, token }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const observerRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Helper to determine initial tick status based on backend data
  const getInitialTickStatus = (isDelivered, isRead) => {
    if (isRead) return 'seen';
    if (isDelivered) return 'delivered';
    return 'sent';
  };

  // 1. Fetch Message History
  const fetchMessageHistory = async () => {
    try {
      setIsLoading(true);
      // Fetch initial history
      const response = await axios.get(`${API_BASE_URL}/chat/messages/${roomId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetchedMessages = response.data.results.map(msg => ({
        id: msg.id,
        message: msg.content,
        sender: msg.sender_id,
        timestamp: msg.timestamp,
        tickStatus: getInitialTickStatus(msg.is_delivered, msg.is_read)
      }));

      // Assuming backend returns newest first for pagination, we reverse to display
      setMessages(fetchedMessages.reverse());
      setNextPageUrl(response.data.next);

      // Now connect to WebSocket AFTER history is fetched
      connectWebSocket();
    } catch (error) {
      console.error('Failed to fetch message history', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Connect WebSocket
  const connectWebSocket = useCallback(() => {
    // DO NOT open a new WebSocket without closing the old one
    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsUrl = `${WEBSOCKET_BASE_URL}/${roomId}/?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        // Handle new message
        setMessages(prev => {
          // If we receive our own message back from the server, we might want to update its status or ID.
          // For simplicity, we just add the message if it's not already in the list.
          const exists = prev.find(m => m.id === data.msg_id);
          if (exists) {
            return prev.map(m => m.id === data.msg_id ? { ...m, tickStatus: getInitialTickStatus(data.is_delivered, data.is_read) } : m);
          }
          return [...prev, {
            id: data.msg_id,
            message: data.message,
            sender: data.sender,
            timestamp: data.timestamp,
            tickStatus: getInitialTickStatus(data.is_delivered, data.is_read)
          }];
        });
      } else if (data.type === 'seen') {
        // Handle seen event
        setMessages(prev => prev.map(msg => 
          msg.id === data.message_id 
            ? { ...msg, tickStatus: 'seen' } 
            : msg
        ));
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    socketRef.current = ws;
  }, [roomId, token]);

  // Initial Load and Unmount Cleanup
  useEffect(() => {
    fetchMessageHistory();

    return () => {
      // On unmount, close the socket
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Scroll to bottom when new messages arrive (if we're at the bottom)
  useEffect(() => {
    if (!isFetchingMore && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isFetchingMore]);

  // 3. Mark as Seen logic (Intersection Observer)
  const sendSeenEvent = useCallback((messageId) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'seen',
        message_id: messageId
      }));
    }
  }, []);

  // Setup observer for viewing items
  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const messageId = parseInt(entry.target.getAttribute('data-id'));
          const sender = entry.target.getAttribute('data-sender');
          const status = entry.target.getAttribute('data-status');

          // Send seen for it if sender !== currentUser and not already seen
          if (sender !== currentUser && status !== 'seen') {
            sendSeenEvent(messageId);
            
            // Optimistically update local state to avoid spamming the backend
            setMessages(prev => prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, tickStatus: 'seen' } 
                : msg
            ));
          }
        }
      });
    }, {
      root: chatContainerRef.current,
      threshold: 0.5 // trigger when 50% visible
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [currentUser, sendSeenEvent]);

  // Apply observer to new message elements
  const messageElementRef = useCallback((node) => {
    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);

  // 4. Load Older Messages (Pagination)
  const handleScroll = async (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && nextPageUrl && !isFetchingMore) {
      setIsFetchingMore(true);
      try {
        const response = await axios.get(nextPageUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const olderMessages = response.data.results.map(msg => ({
          id: msg.id,
          message: msg.content,
          sender: msg.sender_id,
          timestamp: msg.timestamp,
          tickStatus: getInitialTickStatus(msg.is_delivered, msg.is_read)
        }));

        setMessages(prev => [...olderMessages.reverse(), ...prev]);
        setNextPageUrl(response.data.next);
      } catch (error) {
        console.error('Failed to load older messages', error);
      } finally {
        setIsFetchingMore(false);
      }
    }
  };

  // 5. Sending a Message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    // Send via WebSocket
    socketRef.current.send(JSON.stringify({
      type: 'message',
      message: inputText.trim()
    }));

    // Optimistically add to local state
    // We use a temporary negative ID until the server confirms
    const tempId = -Date.now();
    const newMsg = {
      id: tempId,
      message: inputText.trim(),
      sender: currentUser,
      timestamp: new Date().toISOString(),
      tickStatus: 'sent' // Single grey tick = sent (message just added to local state)
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center shadow-sm z-10">
        <h2 className="text-xl font-semibold text-gray-800">Chat Room</h2>
      </div>

      {/* Messages List */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isFetchingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender === currentUser;

          return (
            <div
              key={msg.id}
              ref={!isOwn ? messageElementRef : null}
              data-id={msg.id}
              data-sender={msg.sender}
              data-status={msg.tickStatus}
              className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl relative shadow-sm ${
                  isOwn
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white border text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-[15px] leading-relaxed">{msg.message}</p>
                
                <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <span className={`text-[10px] font-medium ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {isOwn && (
                    <div className="flex">
                      {msg.tickStatus === 'seen' ? (
                        <CheckCheck size={14} className="text-blue-300" />
                      ) : msg.tickStatus === 'delivered' ? (
                        <CheckCheck size={14} className="text-white/60" />
                      ) : (
                        <Check size={14} className="text-white/60" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t">
        <form onSubmit={sendMessage} className="flex gap-2 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-3 rounded-full transition-colors flex items-center justify-center"
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatScreen;
