import React from 'react';

/**
 * Reusable Form Input component aligned with Blibli BLUE Design System
 */
export const Input = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon: Icon,
  error,
  helperText,
  className = '',
  disabled = false,
  required = false,
  autoFocus = false,
  ...props
}) => {
  return (
    <div className={`blue-input-group ${className}`}>
      {label && (
        <label className="blue-label">
          {label}
          {required && <span style={{ color: 'var(--red-500)', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <div className="blue-input-wrapper">
        {Icon && (
          <div className="blue-input-icon">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`blue-input ${Icon ? 'with-icon' : ''} ${error ? 'has-error' : ''}`}
          {...props}
        />
      </div>
      {helperText && !error && (
        <span className="text-xs text-secondary">{helperText}</span>
      )}
      {error && (
        <span className="text-xs text-danger font-medium" style={{ marginTop: '2px' }}>{error}</span>
      )}
    </div>
  );
};
