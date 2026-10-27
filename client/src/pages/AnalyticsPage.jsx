import React, { useState, useEffect } from 'react';
import { getOverviewAnalytics } from '../api/analytics.api';
import MetricsGrid from '../components/analytics/MetricsGrid';
import FunnelChart from '../components/analytics/FunnelChart';
import WeeklyChart from '../components/analytics/WeeklyChart';
import ResumeConversionTable from '../components/analytics/ResumeConversionTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { BarChart3, AlertCircle } from 'lucide-react';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await getOverviewAnalytics();
        setAnalytics(res.data);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Crunching application analytics & aggregation metrics..." />;
  }

  if (errorMessage) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-rose-600" />
        <span>{errorMessage}</span>
      </div>
    );
  }

  if (!analytics || !analytics.hasData) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Recruitment Funnel & Pipeline Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time MongoDB aggregation metrics tracking conversions, response times, and resume version ROI.
          </p>
        </div>

        <EmptyState
          icon={BarChart3}
          title="No Application Data Available Yet"
          description="Add job or internship applications to your Kanban board to start generating recruiter response metrics, conversion funnels, and resume comparison analytics."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Recruitment Funnel & Pipeline Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time metrics computed via MongoDB aggregation pipelines.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <MetricsGrid summary={analytics.summary} />

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelChart data={analytics.stageFunnel} />
        <WeeklyChart data={analytics.weeklyActivity} />
      </div>

      {/* Resume Version Conversion Table */}
      <ResumeConversionTable data={analytics.resumePerformance} />
    </div>
  );
};

export default AnalyticsPage;
