/* global global */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, uploadFile, authApi, productApi } from '../../utils/apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch.mockClear();
  });

  describe('apiRequest', () => {
    it('should make successful GET request', async () => {
      const mockData = { success: true, data: [] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const result = await apiRequest('/api/products');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should include auth token in headers', async () => {
      localStorage.setItem('auth_token', 'test-token');
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await apiRequest('/api/orders');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should throw error on failed request', async () => {
      const originalError = console.error;
      console.error = vi.fn(); // Suppress error log
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' })
      });

      await expect(apiRequest('/api/products/999')).rejects.toThrow('Not found');
      console.error = originalError;
    });
  });

  describe('uploadFile', () => {
    it('should upload file with FormData', async () => {
      localStorage.setItem('auth_token', 'test-token');
      const mockResponse = { success: true, url: '/uploads/file.jpg' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.jpg');

      const result = await uploadFile('/api/upload', formData);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/upload',
        expect.objectContaining({
          method: 'POST',
          body: formData
        })
      );
    });
  });

  describe('authApi', () => {
    it('should login with credentials', async () => {
      const mockResponse = { token: 'jwt-token', user: { id: 1 } };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authApi.login('test@example.com', 'password');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'password' })
        })
      );
    });

    it('should signup new user', async () => {
      const userData = { email: 'new@example.com', password: 'password123' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await authApi.signup(userData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/signup',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData)
        })
      );
    });
  });

  describe('productApi', () => {
    it('should get all products', async () => {
      const mockProducts = { products: [], total: 0 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      });

      const result = await productApi.getAll();

      expect(result).toEqual(mockProducts);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products',
        expect.any(Object)
      );
    });

    it('should get product by id', async () => {
      const mockProduct = { id: 1, name: 'Test Product' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct
      });

      const result = await productApi.getById(1);

      expect(result).toEqual(mockProduct);
    });

    it('should search products', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      await productApi.search('paracetamol');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/products/search?q=paracetamol',
        expect.any(Object)
      );
    });
  });
});

