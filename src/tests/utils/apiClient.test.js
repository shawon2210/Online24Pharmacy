import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, uploadFile, authApi, productApi } from '../../utils/apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('apiRequest', () => {
    it('should make successful GET request', async () => {
      const mockData = { success: true, data: [] };
      global.fetch = vi.fn().mockResolvedValueOnce({
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
      const testToken = String('test-token').replace(/[^a-zA-Z0-9._-]/g, '');
      localStorage.setItem('auth_token', testToken);
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      await apiRequest('/api/orders');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${testToken}`
          })
        })
      );
    });

    it('should throw error on failed request', async () => {
      const originalError = console.error;
      console.error = vi.fn();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' })
      });

      await expect(apiRequest('/api/products/999')).rejects.toThrow('Not found');
      console.error = originalError;
    });
  });

  describe('uploadFile', () => {
    it('should upload file with FormData', async () => {
      const testToken = String('test-token').replace(/[^a-zA-Z0-9._-]/g, '');
      localStorage.setItem('auth_token', testToken);
      const mockResponse = { success: true, url: '/uploads/file.jpg' };
      global.fetch = vi.fn().mockResolvedValueOnce({
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
          body: formData,
          headers: expect.objectContaining({
            'Authorization': `Bearer ${testToken}`
          })
        })
      );
    });
  });

  describe('authApi', () => {
    it('should login with credentials', async () => {
      const mockResponse = { token: 'jwt-token', user: { id: 1 } };
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const testEmail = process.env.TEST_EMAIL || 'test@example.com';
      const testPassword = process.env.TEST_PASSWORD || 'test-password';
      const result = await authApi.login(testEmail, testPassword);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: testEmail, password: testPassword })
        })
      );
    });

    it('should signup new user', async () => {
      const testEmail = process.env.TEST_EMAIL || 'new@example.com';
      const testPassword = process.env.TEST_PASSWORD || 'test-password';
      const userData = { email: testEmail, password: testPassword };
      global.fetch = vi.fn().mockResolvedValueOnce({
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
      global.fetch = vi.fn().mockResolvedValueOnce({
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
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct
      });

      const result = await productApi.getById(1);

      expect(result).toEqual(mockProduct);
    });

    it('should search products', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      const searchQuery = 'paracetamol';
      await productApi.search(searchQuery);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/api/products/search?q=${encodeURIComponent(searchQuery)}`,
        expect.any(Object)
      );
    });
  });
});
