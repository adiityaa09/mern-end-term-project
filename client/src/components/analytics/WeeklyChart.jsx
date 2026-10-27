import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
        <p className="font-semibold">{label}</p>
        <p className="text-emerald-400 mt-0.5">{payload[0].value} applications submitted</p>
      </div>
    );
  }
  return null;
};

const WeeklyChart = ({ data }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Application Velocity</h3>
        <p className="text-xs text-slate-400">Weekly application submission volume over time</p>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No historical weekly data recorded yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="weekLabel" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#velocityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default WeeklyChart;
