/**
 * Form validation utilities
 */

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^01[3-9]\d{8}$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf']
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email) return { valid: false, error: 'Email is required' };
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
};

/**
 * Validate Bangladesh phone number
 */
export const validatePhone = (phone) => {
  if (!phone) return { valid: false, error: 'Phone number is required' };
  if (!VALIDATION_RULES.PHONE_REGEX.test(phone)) {
    return { valid: false, error: 'Phone number must be 11 digits and start with 01 (e.g., 01712345678)' };
  }
  return { valid: true };
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
    return { valid: false, error: `Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters` };
  }
  return { valid: true };
};

/**
 * Validate file upload
 */
export const validateFile = (file) => {
  if (!file) return { valid: false, error: 'File is required' };
  
  if (!VALIDATION_RULES.ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, and PDF files are allowed' };
  }
  
  if (file.size > VALIDATION_RULES.MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }
  
  return { valid: true };
};

/**
 * Validate prescription form data
 */
export const validatePrescriptionForm = (formData) => {
  const errors = {};

  if (!formData.patientName?.trim()) {
    errors.patientName = 'Patient name is required';
  }

  if (!formData.patientAge || formData.patientAge < 0 || formData.patientAge > 150) {
    errors.patientAge = 'Valid age is required';
  }

  const phoneValidation = validatePhone(formData.patientPhone);
  if (!phoneValidation.valid) {
    errors.patientPhone = phoneValidation.error;
  }

  if (!formData.patientAddress?.trim()) {
    errors.patientAddress = 'Address is required';
  }

  if (!formData.doctorName?.trim()) {
    errors.doctorName = 'Doctor name is required';
  }

  if (!formData.prescriptionDate) {
    errors.prescriptionDate = 'Prescription date is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateFile,
  validatePrescriptionForm,
  VALIDATION_RULES
};
