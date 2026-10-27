import React from 'react';
import { FileText, Trophy, Target } from 'lucide-react';

const ResumeConversionTable = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Resume Version Performance</h3>
        <p className="text-xs text-slate-400">
          Conversion rate to Interview & Offer stages for each uploaded resume
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Resume Version</th>
              <th className="px-5 py-3">Applications</th>
              <th className="px-5 py-3">Interviews</th>
              <th className="px-5 py-3">Offers</th>
              <th className="px-5 py-3 text-right">Conversion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                  No applications attached to resumes yet. Upload resumes and attach them to applications to see performance metrics!
                </td>
              </tr>
            ) : (
              data.map((r) => (
                <tr key={r.resumeId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>{r.label || r.fileName}</span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-700">
                    {r.totalApplications}
                  </td>
                  <td className="px-5 py-3.5 text-purple-700 font-medium">
                    {r.interviews}
                  </td>
                  <td className="px-5 py-3.5 text-emerald-700 font-medium">
                    {r.offers}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-blue-600">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                      {r.conversionRatePercent}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResumeConversionTable;
