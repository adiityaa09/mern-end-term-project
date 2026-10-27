import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-slate-300 rounded-xl ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-800 mb-1">{title}</h4>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
