import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { APPLICATION_SOURCES, STAGE_LIST } from '../../utils/constants';
import { getResumes } from '../../api/resumes.api';

const ApplicationModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  defaultStage = 'Wishlist'
}) => {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    jobUrl: '',
    location: '',
    applicationSource: 'Career Portal',
    stage: defaultStage,
    deadline: '',
    interviewDate: '',
    salaryOrStipend: '',
    notes: '',
    resumeId: ''
  });

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          company: initialData.company || '',
          role: initialData.role || '',
          jobUrl: initialData.jobUrl || '',
          location: initialData.location || '',
          applicationSource: initialData.applicationSource || 'Career Portal',
          stage: initialData.stage || defaultStage,
          deadline: initialData.deadline ? initialData.deadline.substring(0, 10) : '',
          interviewDate: initialData.interviewDate ? initialData.interviewDate.substring(0, 10) : '',
          salaryOrStipend: initialData.salaryOrStipend || '',
          notes: initialData.notes || '',
          resumeId: initialData.resumeId?._id || initialData.resumeId || ''
        });
      } else {
        setFormData({
          company: '',
          role: '',
          jobUrl: '',
          location: '',
          applicationSource: 'Career Portal',
          stage: defaultStage,
          deadline: '',
          interviewDate: '',
          salaryOrStipend: '',
          notes: '',
          resumeId: ''
        });
      }
      setError('');

      // Fetch user resumes for attachment dropdown
      getResumes()
        .then((res) => {
          if (res?.data) {
            setResumes(res.data);
            // If new application and no resume selected, pick the default resume if available
            if (!initialData) {
              const defaultResume = res.data.find((r) => r.isDefault);
              if (defaultResume) {
                setFormData((prev) => ({ ...prev, resumeId: defaultResume._id }));
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, initialData, defaultStage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.company.trim() || !formData.role.trim()) {
      setError('Company name and job role are required.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        interviewDate: formData.interviewDate ? new Date(formData.interviewDate).toISOString() : null,
        resumeId: formData.resumeId ? formData.resumeId : null
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Application' : 'Track New Application'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="e.g. Google, Stripe"
            required
          />
          <Input
            label="Role / Title"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g. Frontend Engineer Intern"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Job Posting URL"
            name="jobUrl"
            type="url"
            value={formData.jobUrl}
            onChange={handleChange}
            placeholder="https://..."
          />
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Remote, San Francisco"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Source
            </label>
            <select
              name="applicationSource"
              value={formData.applicationSource}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {APPLICATION_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          {!initialData && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Stage
              </label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STAGE_LIST.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Resume Version
            </label>
            <select
              name="resumeId"
              value={formData.resumeId}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None attached</option>
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.label} {r.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
          />
          <Input
            label="Interview Date"
            name="interviewDate"
            type="date"
            value={formData.interviewDate}
            onChange={handleChange}
          />
          <Input
            label="Salary / Stipend"
            name="salaryOrStipend"
            value={formData.salaryOrStipend}
            onChange={handleChange}
            placeholder="e.g. $45/hr"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Notes & Highlights
          </label>
          <textarea
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Referral contacts, questions asked, interview tips..."
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" loading={loading}>
            {initialData ? 'Update Application' : 'Create Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplicationModal;
