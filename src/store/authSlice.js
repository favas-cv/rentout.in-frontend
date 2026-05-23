import { createSlice } from '@reduxjs/toolkit';

// Hydrate from localStorage on app start
const storedToken = localStorage.getItem('access_token') || null;
const storedUser = (() => {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
})();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,          // { id, username, email, ... }
    token: storedToken,        // JWT access token string
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,
  },
  reducers: {
    // Called after successful login — save token + user
    setCredentials: (state, action) => {
      const { user, access } = action.payload;
      const isLive = action.payload.is_live !== undefined ? action.payload.is_live : (user?.is_live !== undefined ? user.is_live : undefined);
      
      let updatedUser = user;
      if (user && isLive !== undefined) {
        updatedUser = { ...user, is_live: isLive };
      }
      
      state.user = updatedUser;
      state.token = access;
      state.isAuthenticated = true;
      state.error = null;
      // Persist to localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    },
    // Called on logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    },
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
    updateUser: (state, action) => {
      const isLive = action.payload.is_live !== undefined ? action.payload.is_live : action.payload.user?.is_live;
      const mergedPayload = isLive !== undefined ? { ...action.payload, is_live: isLive } : action.payload;
      state.user = { ...state.user, ...mergedPayload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
});

export const { setCredentials, logout, setAuthLoading, setAuthError, updateUser } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthToken = (state) => state.auth.token;

export const selectDisplayName = (state) => {
  const user = state.auth.user;
  if (!user) return 'User';
  return user.username || user.email?.split('@')[0] || 'User';
};

export default authSlice.reducer;
