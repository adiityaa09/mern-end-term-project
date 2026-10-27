import React from 'react';

const LoadingSpinner = ({ label = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizeMap[size]} border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin`}
      />
      {label && <p className="mt-3 text-sm text-slate-500 font-medium">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
