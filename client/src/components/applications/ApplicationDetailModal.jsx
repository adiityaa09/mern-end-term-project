import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  Edit2,
  Trash2,
  ArrowRight,
  History
} from 'lucide-react';
import { STAGE_META, VALID_TRANSITIONS } from '../../utils/constants';

const ApplicationDetailModal = ({
  isOpen,
  onClose,
  application,
  onEdit,
  onDelete,
  onStageTransition
}) => {
  const [transitionNote, setTransitionNote] = useState('');
  const [selectedTargetStage, setSelectedTargetStage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!application) return null;

  const currentStage = application.stage;
  const meta = STAGE_META[currentStage] || STAGE_META['Wishlist'];
  const allowedNextStages = VALID_TRANSITIONS[currentStage] || [];

  const handleStageChange = async (targetStage) => {
    setIsTransitioning(true);
    try {
      await onStageTransition(application._id, targetStage, transitionNote);
      setTransitionNote('');
      setSelectedTargetStage('');
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Details"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">{application.company}</h2>
              {application.jobUrl && (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                  title="Open Job Posting"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-sm font-medium text-slate-600 mt-0.5">{application.role}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={`${meta.badgeClass} font-semibold px-3 py-1 text-xs`}>
              <span className={`w-2 h-2 rounded-full ${meta.dotClass} mr-1.5`} />
              {currentStage}
            </Badge>

            <button
              onClick={() => onEdit(application)}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert */}
        {showDeleteConfirm && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <h4 className="text-sm font-semibold text-rose-800">
              Are you sure you want to delete this application?
            </h4>
            <p className="text-xs text-rose-600 mt-1">
              This will remove all associated status history and scheduled reminders. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onDelete(application._id);
                  onClose();
                }}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stage Machine Transitions */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center">
            <ArrowRight className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Advance Stage (Finite State Machine)
          </h4>

          {allowedNextStages.length === 0 ? (
            <p className="text-xs text-slate-500">
              This application has reached a terminal state ({currentStage}).
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {allowedNextStages.map((nextStage) => (
                  <button
                    key={nextStage}
                    disabled={isTransitioning}
                    onClick={() => handleStageChange(nextStage)}
                    className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-700 shadow-2xs transition-all disabled:opacity-50"
                  >
                    Move to {nextStage}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Optional transition note (e.g. 'Passed technical round with flying colors')"
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Application Key Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-2xs text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Location</span>
            <span className="font-semibold text-slate-800 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {application.location || 'Remote'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Source</span>
            <span className="font-semibold text-slate-800">
              {application.applicationSource || 'Direct'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Salary / Stipend</span>
            <span className="font-semibold text-slate-800 flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
              {application.salaryOrStipend || 'Unspecified'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Deadline</span>
            <span className="font-semibold text-slate-800 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {application.deadline
                ? new Date(application.deadline).toLocaleDateString()
                : 'None'}
            </span>
          </div>
        </div>

        {/* Attached Resume */}
        {application.resumeId && (
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  {application.resumeId.label || application.resumeId.fileName}
                </span>
                <span className="text-[11px] text-slate-500">
                  {application.resumeId.fileName}
                </span>
              </div>
            </div>
            <a
              href={application.resumeId.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center hover:underline"
            >
              View PDF <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        )}

        {/* Notes */}
        {application.notes && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Notes
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap">
              {application.notes}
            </div>
          </div>
        )}

        {/* Status History Timeline */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center">
            <History className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Status History Timeline
          </h4>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {application.statusHistory && application.statusHistory.length > 0 ? (
              application.statusHistory.map((entry, idx) => (
                <div key={idx} className="relative text-xs">
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800">
                      {entry.fromStage ? `${entry.fromStage} → ` : 'Created as '}
                      {entry.toStage}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(entry.changedAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-slate-600 text-[11px] mt-0.5 italic">
                      "{entry.note}"
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No history entries logged.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ApplicationDetailModal;
