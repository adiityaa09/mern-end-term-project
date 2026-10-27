import React, { useState, useEffect } from 'react';
import { getResumes, setDefaultResume, deleteResume } from '../api/resumes.api';
import ResumeCard from '../components/resumes/ResumeCard';
import UploadResumeModal from '../components/resumes/UploadResumeModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { Plus, FileText, AlertCircle } from 'lucide-react';

const ResumesPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadResumes = async () => {
    try {
      setLoading(true);
      const res = await getResumes();
      setResumes(res.data || []);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleSetDefault = async (id) => {
    try {
      await setDefaultResume(id);
      setResumes((prev) =>
        prev.map((r) => ({
          ...r,
          isDefault: r._id === id
        }))
      );
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update default resume.');
    }
  };

  const handleDelete = async (resume) => {
    if ((resume.applicationCount || 0) > 0) {
      setErrorMessage(
        `Cannot delete "${resume.label}". It is attached to ${resume.applicationCount} active job application(s). Reassign or unlink those applications first.`
      );
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${resume.label}"?`)) {
      try {
        await deleteResume(resume._id);
        setResumes((prev) => prev.filter((r) => r._id !== resume._id));
      } catch (err) {
        setErrorMessage(err.message || 'Failed to delete resume.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Resume Version Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tailor and upload distinct resume PDF versions (e.g. SDE, Fullstack, AI) and track which ones generate interviews.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setUploadModalOpen(true)}
          className="shadow-md shadow-blue-500/20 shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Upload Resume PDF
        </Button>
      </div>

      {/* Error Alert */}
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

      {/* Resumes Grid */}
      {loading ? (
        <LoadingSpinner label="Loading resume versions..." />
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Resumes Uploaded Yet"
          description="Upload your customized resume PDFs to link them with specific applications and monitor recruiter response rates."
          actionLabel="Upload First Resume"
          onAction={() => setUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume._id}
              resume={resume}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadResumeModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => loadResumes()}
      />
    </div>
  );
};

export default ResumesPage;
