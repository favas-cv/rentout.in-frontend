import api from './api';

export const sendChatRequest = async (receiverId) => {
  const res = await api.post('/chat/send-request/', { 
    receiver: receiverId 
  });
  return res.data;
};

export const fetchMyRequests = async () => {
  const res = await api.get('/chat/my-requests/');
  return res.data;
};

export const updateChatRequest = async (requestId, status) => {
  const res = await api.post(`/chat/update-request/${requestId}/`, { status });
  return res.data;
};

// DO NOT DELETE THIS: Needed for ChatRoom history
export const fetchChatHistory = async (roomId, cursor = null) => {
  const url = cursor ? cursor : `/chat/my-history/${roomId}/`;
  const res = await api.get(url);
  return res.data;
};
// Fetch active conversations
export const fetchConversations = async () => {
  const res = await api.get('/chat/conversations/');
  return res.data;
};
