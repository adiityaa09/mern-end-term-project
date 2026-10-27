import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
        ApplyTrack &copy; {new Date().getFullYear()} &bull; Built with MERN, Tailwind CSS, @dnd-kit & Recharts
      </footer>
    </div>
  );
};

export default AppLayout;
