import React from 'react';
import { FileText, Star, Trash2, ExternalLink, Briefcase } from 'lucide-react';
import Button from '../common/Button';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const ResumeCard = ({ resume, onSetDefault, onDelete }) => {
  const isLinked = (resume.applicationCount || 0) > 0;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-slate-900">{resume.label}</h3>
                {resume.isDefault && (
                  <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-1" /> Default
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[220px] mt-0.5">
                {resume.fileName} &bull; {formatFileSize(resume.fileSize)}
              </p>
            </div>
          </div>
        </div>

        {/* Linked Applications Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="flex items-center text-slate-600">
            <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Linked Applications
          </span>
          <span
            className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
              isLinked ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {resume.applicationCount || 0}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <a
          href={resume.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          View PDF <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </a>

        <div className="flex items-center space-x-1">
          {!resume.isDefault && (
            <button
              onClick={() => onSetDefault(resume._id)}
              className="text-xs font-medium text-slate-600 hover:text-blue-600 px-2.5 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              title="Set as default resume for new applications"
            >
              Make Default
            </button>
          )}

          <button
            onClick={() => onDelete(resume)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title={
              isLinked
                ? `Attached to ${resume.applicationCount} application(s). Reassign before deleting.`
                : 'Delete resume'
            }
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;
