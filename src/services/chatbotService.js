import api from './api';

export const sendMessage = async (message, session_key = null) => {
  const res = await api.post('/chatbot/chat/', {
    message,
    session_key
  });
  return res.data; // { session_key, answer, matched_products }
};

export const fetchChatHistory = async (session_key) => {
  const res = await api.get(`/chatbot/history/${session_key}/`);
  return res.data; // Array of { role, message, created_at }
};
