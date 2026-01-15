import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiBase';

const API_URL = getApiBaseUrl();

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (orderData) => {
      const rawToken = localStorage.getItem('auth_token');
      const token = typeof rawToken === 'string' ? rawToken.trim() : '';

      // Prevent sending "Bearer null" / "Bearer undefined" which triggers confusing 403s.
      if (!token || token === 'null' || token === 'undefined') {
        const authError = new Error('Please sign in to place your order');
        authError.code = 'AUTH_REQUIRED';
        throw authError;
      }

      const response = await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Order created successfully!');
      return data;
    },
    onError: (error) => {
      const apiError = error?.response?.data?.error || error?.response?.data?.message;
      toast.error(apiError || error?.message || 'Failed to create order');
    },
  });
};

export default function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
