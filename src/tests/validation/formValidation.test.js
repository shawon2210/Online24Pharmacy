import { describe, it, expect } from 'vitest';
import { validateForm } from '../../utils/errorHandler';

describe('Form Validation', () => {
  describe('Login Form', () => {
    const loginRules = {
      email: { required: true, email: true },
      password: { required: true, minLength: 6 }
    };

    it('should validate valid login data', () => {
      const data = {
        email: 'user@example.com',
        password: 'password123'
      };

      const result = validateForm(data, loginRules);

      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should reject empty email', () => {
      const data = {
        email: '',
        password: 'password123'
      };

      const result = validateForm(data, loginRules);

      expect(result.valid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should reject invalid email format', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123'
      };

      const result = validateForm(data, loginRules);

      expect(result.valid).toBe(false);
      expect(result.errors.email).toContain('Invalid email');
    });

    it('should reject short password', () => {
      const data = {
        email: 'user@example.com',
        password: '123'
      };

      const result = validateForm(data, loginRules);

      expect(result.valid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });
  });

  describe('Signup Form', () => {
    const signupRules = {
      email: { required: true, email: true },
      password: { required: true, minLength: 8 },
      firstName: { required: true, minLength: 2 },
      lastName: { required: true, minLength: 2 }
    };

    it('should validate complete signup data', () => {
      const data = {
        email: 'newuser@example.com',
        password: 'securepass123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const result = validateForm(data, signupRules);

      expect(result.valid).toBe(true);
    });

    it('should reject missing required fields', () => {
      const data = {
        email: 'user@example.com',
        password: 'password123'
      };

      const result = validateForm(data, signupRules);

      expect(result.valid).toBe(false);
      expect(result.errors.firstName).toBeDefined();
      expect(result.errors.lastName).toBeDefined();
    });
  });

  describe('Checkout Form', () => {
    const checkoutRules = {
      fullName: { required: true, minLength: 3 },
      phone: { 
        required: true,
        validator: (value) => /^01[3-9]\d{8}$/.test(value)
      },
      address: { required: true, minLength: 10 },
      city: { required: true }
    };

    it('should validate complete checkout data', () => {
      const data = {
        fullName: 'John Doe',
        phone: '01712345678',
        address: '123 Main Street, Dhaka',
        city: 'Dhaka'
      };

      const result = validateForm(data, checkoutRules);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid phone number', () => {
      const data = {
        fullName: 'John Doe',
        phone: '123456',
        address: '123 Main Street',
        city: 'Dhaka'
      };

      const result = validateForm(data, checkoutRules);

      expect(result.valid).toBe(false);
      expect(result.errors.phone).toBeDefined();
    });
  });
});
