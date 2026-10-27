import React, { useState, useEffect, useCallback } from 'react';
import {
  getApplications,
  createApplication,
  updateApplication,
  transitionStage,
  deleteApplication
} from '../api/applications.api';
import KanbanBoard from '../components/kanban/KanbanBoard';
import ApplicationModal from '../components/applications/ApplicationModal';
import ApplicationDetailModal from '../components/applications/ApplicationDetailModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { Plus, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { APPLICATION_SOURCES } from '../utils/constants';

const DashboardPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDefaultStage, setCreateModalDefaultStage] = useState('Wishlist');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchApps = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedSource) params.source = selectedSource;

      const res = await getApplications(params);
      setApplications(res.data || []);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedSource]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApps();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchApps]);

  // Optimistic Kanban Drag & Drop with Automatic Server Rollback
  const handleStageChange = async (applicationId, targetStage, previousStage) => {
    // 1. Optimistic Update (Instant 60fps UI move)
    setApplications((prev) =>
      prev.map((app) => (app._id === applicationId ? { ...app, stage: targetStage } : app))
    );

    try {
      // 2. Dispatch to backend state machine
      const res = await transitionStage(applicationId, targetStage);
      // Sync with server state (including updated statusHistory)
      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? res.data : app))
      );
      if (selectedApp && selectedApp._id === applicationId) {
        setSelectedApp(res.data);
      }
    } catch (err) {
      // 3. Rollback on failure!
      setApplications((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, stage: previousStage } : app))
      );
      setErrorMessage(
        err.message || `Failed to transition stage from ${previousStage} to ${targetStage}.`
      );
    }
  };

  const handleCreateSubmit = async (formData) => {
    const res = await createApplication(formData);
    setApplications((prev) => [res.data, ...prev]);
  };

  const handleEditSubmit = async (formData) => {
    const res = await updateApplication(selectedApp._id, formData);
    setApplications((prev) =>
      prev.map((app) => (app._id === selectedApp._id ? res.data : app))
    );
    setSelectedApp(res.data);
  };

  const handleDeleteApp = async (id) => {
    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((app) => app._id !== id));
      setDetailModalOpen(false);
      setSelectedApp(null);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete application.');
    }
  };

  const handleCardClick = (app) => {
    setSelectedApp(app);
    setDetailModalOpen(true);
  };

  const handleOpenAddCard = (stage = 'Wishlist') => {
    setCreateModalDefaultStage(stage);
    setCreateModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Left: Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search companies, roles, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-xs py-1.5 pl-3 pr-7 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 font-medium"
            >
              <option value="">All Sources</option>
              {APPLICATION_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          {(search || selectedSource) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedSource('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline px-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right: Add Application Button */}
        <div className="flex items-center space-x-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenAddCard('Wishlist')}
            className="shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Application
          </Button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-500 hover:text-rose-700 font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Kanban Board Container */}
      {loading && applications.length === 0 ? (
        <LoadingSpinner label="Loading application pipeline..." />
      ) : (
        <KanbanBoard
          applications={applications}
          onStageChange={handleStageChange}
          onCardClick={handleCardClick}
          onAddCard={handleOpenAddCard}
          onError={(msg) => setErrorMessage(msg)}
        />
      )}

      {/* Modals */}
      <ApplicationModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        defaultStage={createModalDefaultStage}
      />

      <ApplicationModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={selectedApp}
      />

      <ApplicationDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        application={selectedApp}
        onEdit={(app) => {
          setDetailModalOpen(false);
          setEditModalOpen(true);
        }}
        onDelete={handleDeleteApp}
        onStageTransition={async (id, targetStage, note) => {
          await handleStageChange(id, targetStage, selectedApp.stage);
        }}
      />
    </div>
  );
};

export default DashboardPage;
