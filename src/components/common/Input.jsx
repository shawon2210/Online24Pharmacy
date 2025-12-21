import { forwardRef } from 'react';

/**
 * Reusable Input component with label and error
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const inputClasses = `
    input-field
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
