import api from './api';

export const loginUser = async (credentials) => {
  const res = await api.post('/auth/login/', credentials);
  return res.data; // { access, user }
};

export const registerUser = async (userData) => {
  const res = await api.post('/auth/register/', userData);
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post('/auth/logout/');
  return res.data;
};

export const fetchCurrentUser = async () => {
  const res = await api.get('/auth/me/');
  return res.data;
};

export const updateProfile = async (formData) => {
  const res = await api.patch('/auth/me/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// --- OTP & Password Reset ---

export const sendOTP = async (data) => {
  // data: { email, purpose }
  const res = await api.post('/auth/send-otp/', data);
  return res.data; // { msg, session_ref }
};

export const verifyOTP = async (data) => {
  // data: { session_ref, otp }
  const res = await api.post('/auth/verify-otp/', data);
  return res.data; // { msg, reset_token? }
};

export const resetPassword = async (data) => {
  // data: { reset_token, password1, password2 }
  const res = await api.post('/auth/password-reset/', data);
  return res.data;
};

// --- Google OAuth ---

export const googleLogin = async (data) => {
  // data: { access_token } or what the backend expects
  const res = await api.post('/auth/google/', data);
  return res.data;
};
