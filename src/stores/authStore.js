import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
          });

          const { user, accessToken } = response.data;
          
          set({
            user,
            token: accessToken,
            isAuthenticated: true
          });

          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          return { user, token: accessToken };
        } catch (error) {
          throw new Error(error.response?.data?.error || 'Login failed');
        }
      },

      register: async (userData) => {
        try {
          const response = await axios.post(`${API_URL}/auth/signup`, userData);
          const { user, accessToken } = response.data;
          set({
            user,
            token: accessToken,
            isAuthenticated: true
          });
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          return { user, token: accessToken };
        } catch (error) {
          throw new Error(error.response?.data?.error || 'Registration failed');
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });

        delete axios.defaults.headers.common['Authorization'];
      },

      initializeAuth: () => {
        const { token, user } = get();
        if (token && user) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ isAuthenticated: true });
        }
      }
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      }
    }
  )
);