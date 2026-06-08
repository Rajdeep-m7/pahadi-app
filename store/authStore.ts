import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { BASE_URL } from '@/constants/config';

interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  
  // Actions
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Helper to update axios headers globally
const updateAxiosHeader = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Set up interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await SecureStore.getItemAsync('userRefreshToken');
        if (!storedRefreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, 
          { refreshToken: storedRefreshToken },
          { headers: { 'x-client-type': 'mobile' } }
        );

        const { accessToken, refreshToken: newRefreshToken } = data.data;
        
        await useAuthStore.getState().setTokens(accessToken, newRefreshToken);
        
        processQueue(null, accessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync('userToken', accessToken);
    await SecureStore.setItemAsync('userRefreshToken', refreshToken);
    updateAxiosHeader(accessToken);
    set({ token: accessToken, refreshToken, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const refreshToken = await SecureStore.getItemAsync('userRefreshToken');
      if (token && refreshToken) {
        updateAxiosHeader(token);
        set({ token, refreshToken, isAuthenticated: true });
        await get().refreshProfile();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      set({ isInitialized: true });
    }
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('userRefreshToken');
      if (refreshToken) {
        // Silently attempt to revoke on backend
        axios.post(`${BASE_URL}/auth/logout`, { refreshToken }, { headers: { 'x-client-type': 'mobile' } }).catch(() => {});
      }
    } catch (e) {}

    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userRefreshToken');
    updateAxiosHeader(null);
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },

  refreshProfile: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const { data } = await axios.get(`${BASE_URL}/users/me`);
      if (data && data.data) {
        set({ user: data.data, isAuthenticated: true });
      }
    } catch (error: any) {
      // Interceptor will handle 401s
      console.error('Profile fetch failed:', error.message);
    }
  },
}));
