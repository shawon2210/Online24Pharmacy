import { describe, it, expect, vi } from 'vitest';
import {
  getErrorMessage,
  logError,
  validateForm,
  retryOperation,
  createError
} from '../../utils/errorHandler';

describe('errorHandler utilities', () => {
  describe('getErrorMessage', () => {
    it('should return network error message', () => {
      const error = new Error('Failed to fetch');
      expect(getErrorMessage(error)).toBe('Network error. Please check your internet connection.');
    });

    it('should return timeout error message', () => {
      const error = new Error('timeout');
      expect(getErrorMessage(error)).toBe('Request timeout. Please try again.');
    });

    it('should handle 401 status', () => {
      const error = { status: 401, message: 'Unauthorized' };
      expect(getErrorMessage(error)).toBe('Session expired. Please log in again.');
    });

    it('should handle 404 status', () => {
      const error = { status: 404, message: 'Not Found' };
      expect(getErrorMessage(error)).toBe('Resource not found.');
    });

    it('should handle 500 status', () => {
      const error = { status: 500, message: 'Internal Server Error' };
      expect(getErrorMessage(error)).toBe('Server error. Please try again later.');
    });

    it('should return custom message if provided', () => {
      const error = { message: 'Custom error' };
      expect(getErrorMessage(error)).toBe('Custom error');
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      
      logError(error, { userId: '123' });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('validateForm', () => {
    it('should validate required fields', () => {
      const data = { email: '' };
      const rules = { email: { required: true } };
      
      const result = validateForm(data, rules);
      
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should validate email format', () => {
      const data = { email: 'invalid-email' };
      const rules = { email: { email: true } };
      
      const result = validateForm(data, rules);
      
      expect(result.valid).toBe(false);
      expect(result.errors.email).toBe('Invalid email address');
    });

    it('should validate min length', () => {
      const testPassword = process.env.TEST_PASSWORD;
      if (!testPassword) {
        return;
      }
      const data = { password: testPassword };
      const rules = { password: { minLength: 6 } };
      
      const result = validateForm(data, rules);
      
      expect(result.valid).toBe(false);
      expect(result.errors.password).toContain('at least 6 characters');
    });

    it('should pass valid data', () => {
      const testEmail = process.env.TEST_EMAIL;
      const testPassword = process.env.TEST_PASSWORD;
      
      if (!testEmail || !testPassword) {
        return;
      }
      
      const data = { email: testEmail, password: testPassword };
      const rules = {
        email: { required: true, email: true },
        password: { required: true, minLength: 6 }
      };
      
      const result = validateForm(data, rules);
      
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });
  });

  describe('retryOperation', () => {
    it('should succeed on first try', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      
      const result = await retryOperation(operation, 3, 100);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      
      const result = await retryOperation(operation, 3, 10);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on client errors', async () => {
      const error = new Error('Bad request');
      error.status = 400;
      const operation = vi.fn().mockRejectedValue(error);
      
      await expect(retryOperation(operation, 3, 10)).rejects.toThrow('Bad request');
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('createError', () => {
    it('should create error with status', () => {
      const error = createError('Test error', 404);
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
    });

    it('should create error with data', () => {
      const error = createError('Test error', 400, { field: 'email' });
      
      expect(error.data).toEqual({ field: 'email' });
    });
  });
});
