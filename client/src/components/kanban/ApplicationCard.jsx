import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  Building2,
  MapPin,
  Calendar,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const ApplicationCard = ({ application, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application._id,
    data: { application }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1
  };

  const isDeadlineSoon =
    application.deadline &&
    new Date(application.deadline) > new Date() &&
    new Date(application.deadline).getTime() - new Date().getTime() <= 48 * 60 * 60 * 1000;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(application)}
      className="group relative bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-grab active:cursor-grabbing mb-3 select-none"
    >
      {/* Top Header: Company & Source */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 truncate flex items-center">
            {application.company}
          </h4>
          <p className="text-xs font-medium text-slate-600 truncate mt-0.5">
            {application.role}
          </p>
        </div>
        {application.applicationSource && (
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/70 shrink-0">
            {application.applicationSource}
          </span>
        )}
      </div>

      {/* Meta tags: Location & Salary */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5 text-[11px] text-slate-500">
        {application.location && (
          <span className="flex items-center">
            <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
            <span className="truncate max-w-[120px]">{application.location}</span>
          </span>
        )}
        {application.salaryOrStipend && (
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
            {application.salaryOrStipend}
          </span>
        )}
      </div>

      {/* Footer Indicators: Deadlines, Interviews, Resumes */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
        <div className="flex items-center space-x-2 truncate">
          {/* Resume Version Pill */}
          {application.resumeId && (
            <span
              className="flex items-center text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-medium"
              title={`Attached Resume: ${application.resumeId.label || application.resumeId.fileName}`}
            >
              <FileText className="w-3 h-3 mr-1" />
              <span className="truncate max-w-[80px]">
                {application.resumeId.label || 'Resume'}
              </span>
            </span>
          )}

          {/* Deadline or Interview Indicator */}
          {application.deadline && (
            <span
              className={`flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded ${
                isDeadlineSoon
                  ? 'bg-rose-100 text-rose-700 animate-pulse font-semibold'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Clock className="w-3 h-3 mr-1" />
              {new Date(application.deadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}

          {application.interviewDate && (
            <span className="flex items-center text-[10px] font-medium bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(application.interviewDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          )}
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </div>
  );
};

export default ApplicationCard;
