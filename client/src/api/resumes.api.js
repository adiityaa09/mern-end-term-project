import api from './client';

export const getResumes = () => api.get('/resumes');

export const uploadResume = (formData) =>
  api.post('/resumes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

export const setDefaultResume = (id) => api.patch(`/resumes/${id}/default`);

export const deleteResume = (id) => api.delete(`/resumes/${id}`);
