import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Auto refresh if access token expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log the error details as requested
    console.log("Interceptor caught error:", {
      response: error.response,
      url: originalRequest?.url,
      headers: originalRequest?.headers,
      cookies: document.cookie,
    });

    // If no response, reject
    if (!error.response) {
      return Promise.reject(error);
    }

    // If logout request fails, don't try refresh
    if (originalRequest.url?.includes("logout")) {
      return Promise.reject(error);
    }

    // If 403, user is blocked — show toast and reject immediately
    if (error.response.status === 403) {
      toast.error('Your account is currently restricted.');
      return Promise.reject(error);
    }

    // Only try refresh if:
    // - status is 401
    // - request is not refresh endpoint itself
    if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("refresh")) {
      
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      console.log("Refreshing token...");

      return new Promise(function (resolve, reject) {
        axios
          .post(
            `${import.meta.env.VITE_API_URL}/auth/refresh/`,
            {},
            {
              withCredentials: true,
              headers: {
                Authorization: "", // IMPORTANT
              },
            }
          )
          .then(({ data }) => {
            console.log("Retrying original request...");
            console.log("New access:", data.access);
            const token = data.access;
            localStorage.setItem("access_token", token);
            
            // Update authorization header for future requests
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            originalRequest.headers.Authorization = `Bearer ${token}`;
            
            processQueue(null, token);
            resolve(api(originalRequest));
          })
          .catch((err) => {
            console.error("Refresh failed:", err);
            processQueue(err, null);
            
            // logout ONLY if refresh endpoint itself fails
            if (
              err.response &&
              err.response.status === 401
            ) {
              localStorage.removeItem("access_token");
              localStorage.removeItem("user");
              
              window.dispatchEvent(
                new CustomEvent('auth:logout')
              );
            }
            
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
