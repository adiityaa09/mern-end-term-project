import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Layers,
  FileText,
  BarChart3,
  LogOut,
  User,
  Settings,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import Modal from '../common/Modal';

const Navbar = () => {
  const { user, logout, updateSettings } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(
    user?.reminderSettings?.emailNotifications ?? true
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSaveSettings = async () => {
    await updateSettings({ emailNotifications: emailNotifs });
    setSettingsOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Kanban Pipeline', icon: Layers },
    { to: '/resumes', label: 'Resumes', icon: FileText },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <NavLink to="/" className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg font-bold text-slate-900 tracking-tight">ApplyTrack</span>
                  <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    Pro
                  </span>
                </div>
              </NavLink>

              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center space-x-1">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Right side tools */}
            <div className="flex items-center space-x-3">
              <NotificationDropdown />

              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Reminder Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex items-center pl-3 border-l border-slate-200 space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-xs border border-slate-200">
                    {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                    {user?.name || 'User'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 py-1.5 bg-slate-50/50">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isActive ? 'bg-blue-100 text-blue-800' : 'text-slate-600'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </header>

      {/* Settings Modal */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Smart Reminder Settings"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Configure how ApplyTrack automatically alerts you for upcoming deadlines, interviews, and follow-ups.
          </p>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-sm font-medium text-slate-800 block">Email Reminders</span>
              <span className="text-xs text-slate-500">
                Receive transactional emails 48h before deadlines and for upcoming interviews.
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setSettingsOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;
