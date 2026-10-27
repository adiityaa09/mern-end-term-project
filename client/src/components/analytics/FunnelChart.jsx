import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const STAGE_BAR_COLORS = {
  Wishlist: '#94a3b8',
  Applied: '#3b82f6',
  'Online Assessment': '#f59e0b',
  Interview: '#a855f7',
  Offer: '#10b981',
  Rejected: '#f43f5e',
  Withdrawn: '#64748b'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
        <p className="font-semibold">{label}</p>
        <p className="text-blue-300 mt-0.5">{payload[0].value} applications</p>
      </div>
    );
  }
  return null;
};

const FunnelChart = ({ data }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Application Funnel</h3>
        <p className="text-xs text-slate-400">Distribution across recruitment pipeline stages</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <XAxis
              dataKey="stage"
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STAGE_BAR_COLORS[entry.stage] || '#3b82f6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FunnelChart;
