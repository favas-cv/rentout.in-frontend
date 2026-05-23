import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on mount
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        setAccessToken(token);
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    loadUser();

    // Listen for global logout event from Axios interceptor
    const handleLogout = () => {
      console.log("Global logout triggered from interceptor");
      // Clear state without full page reload
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      toast.info("Session expired, please login again");
      navigate('/auth'); // Redirect to auth/login page
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [navigate]);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login/', credentials);
      const { access, user: userData } = res.data;
      
      const isLive = res.data.is_live !== undefined ? res.data.is_live : (userData?.is_live !== undefined ? userData.is_live : undefined);
      let updatedUser = userData;
      if (userData && isLive !== undefined) {
        updatedUser = { ...userData, is_live: isLive };
      }
      
      setAccessToken(access);
      setUser(updatedUser);
      localStorage.setItem('access_token', access);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success("Logged in successfully!");
      navigate('/');
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.detail || "Login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (newUserData) => {
    setUser((prev) => {
      const isLive = newUserData.is_live !== undefined ? newUserData.is_live : newUserData.user?.is_live;
      const mergedUser = isLive !== undefined ? { ...prev, ...newUserData, is_live: isLive } : { ...prev, ...newUserData };
      localStorage.setItem('user', JSON.stringify(mergedUser));
      return mergedUser;
    });
  };

  const setAuthData = (userData, token) => {
    const isLive = userData?.is_live !== undefined ? userData.is_live : undefined;
    let updatedUser = userData;
    if (userData && isLive !== undefined) {
      updatedUser = { ...userData, is_live: isLive };
    }
    setAccessToken(token);
    setUser(updatedUser);
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const logout = async (callBackend = true) => {
    setIsLoading(true);
    try {
      if (callBackend) {
        const res = await api.post('/auth/logout/');
        console.log("LOGOUT RESPONSE DATA (SUCCESS):", res.data);
      }
      
      // Only clear state and redirect if the API call succeeds (or callBackend is false)
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      toast.info("Logged out");
      navigate('/auth');
    } catch (error) {
      console.error("Logout API failed:", error);
      toast.error(error.response?.data?.error || "Logout failed! Staying logged in for debugging.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh/`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: "", // IMPORTANT
          },
        }
      );
      const { access } = res.data;
      setAccessToken(access);
      localStorage.setItem('access_token', access);
      return access;
    } catch (error) {
      console.error("Manual refresh failed:", error);
      logout(false);
      return null;
    }
  };

  const value = {
    user,
    accessToken,
    isLoading,
    login,
    logout,
    refreshToken,
    updateUser,
    setAuthData,
    isAuthenticated: !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
