import { useState, useCallback } from 'react';

/**
 * Custom hook for form state management
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Submit handler
 * @param {Function} validate - Validation function
 * @returns {Object} Form state and handlers
 */
export default function useForm(initialValues, onSubmit, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (validate) {
      const validation = validate(values);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit(values);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors
  };
}
