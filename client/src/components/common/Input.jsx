import React from 'react';

const Input = ({
  label,
  error,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  disabled = false,
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-300'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
