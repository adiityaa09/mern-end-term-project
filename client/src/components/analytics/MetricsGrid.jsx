import React from 'react';
import { Send, CheckCircle2, Trophy, Clock, Activity } from 'lucide-react';

const MetricsGrid = ({ summary }) => {
  const cards = [
    {
      label: 'Total Applications',
      value: summary.totalApplications,
      icon: Send,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Active in Pipeline',
      value: summary.activeApplications,
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      label: 'Response Rate',
      value: `${summary.responseRatePercent}%`,
      icon: CheckCircle2,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      label: 'Offer Rate',
      value: `${summary.offerRatePercent}%`,
      icon: Trophy,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Avg Response Time',
      value: `${summary.avgDaysToFirstResponse} days`,
      icon: Clock,
      color: 'text-slate-600',
      bg: 'bg-slate-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 truncate">{card.label}</span>
              <div className={`p-1.5 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsGrid;
