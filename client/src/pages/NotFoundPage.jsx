import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Sparkles } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <p className="text-base font-semibold text-slate-700 mt-2">Page Not Found</p>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        The destination you are trying to visit does not exist or has moved.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
