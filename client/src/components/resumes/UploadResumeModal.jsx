import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { uploadResume } from '../../api/resumes.api';

const UploadResumeModal = ({ isOpen, onClose, onSuccess }) => {
  const [label, setLabel] = useState('');
  const [file, setFile] = useState(null);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file.');
        setFile(null);
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
      if (!label) {
        // Auto-suggest label from filename (e.g. "Aditya_Resume.pdf" -> "Aditya Resume")
        setLabel(selected.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file.');
      return;
    }
    if (!label.trim()) {
      setError('Please provide a label for this version.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('label', label.trim());
      formData.append('isDefault', isDefault);

      const res = await uploadResume(formData);
      if (onSuccess) onSuccess(res.data);
      onClose();
      setLabel('');
      setFile(null);
      setIsDefault(false);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Resume Version">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        {/* File Drop Area */}
        <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 text-center bg-slate-50/50 transition-colors">
          <input
            type="file"
            id="resume-file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="resume-file" className="cursor-pointer flex flex-col items-center">
            {file ? (
              <div className="flex flex-col items-center text-blue-600">
                <FileText className="w-10 h-10 mb-2" />
                <span className="text-xs font-semibold text-slate-800">{file.name}</span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB &bull; Ready to upload
                </span>
              </div>
            ) : (
              <>
                <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  Click to upload or drag & drop PDF
                </span>
                <span className="text-[11px] text-slate-400 mt-1">PDF up to 5MB</span>
              </>
            )}
          </label>
        </div>

        <Input
          label="Version Label"
          name="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. SDE v2, Frontend Specialized, Winter 2026"
          required
        />

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <label htmlFor="isDefault" className="text-xs font-medium text-slate-700 cursor-pointer">
            Set as default resume for future applications
          </label>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" loading={loading} disabled={!file}>
            Upload Resume
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadResumeModal;
