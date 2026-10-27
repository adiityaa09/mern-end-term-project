import React from 'react';

const Badge = ({ children, className = '', variant = 'slate', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
