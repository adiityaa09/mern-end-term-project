const resumeService = require('../services/resume.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getResumes = asyncHandler(async (req, res) => {
  const resumes = await resumeService.getResumes(req.user._id);
  return res.status(200).json(new ApiResponse(200, resumes, 'Resumes fetched successfully'));
});

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload a PDF resume file.');
  }

  const label = req.body.label ? req.body.label.trim() : 'Resume Version';
  const isDefault = req.body.isDefault === 'true' || req.body.isDefault === true;

  const resume = await resumeService.uploadResume(req.user._id, req.file, {
    label,
    isDefault
  });

  return res.status(201).json(new ApiResponse(201, resume, 'Resume uploaded successfully'));
});

const setDefaultResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.setDefaultResume(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, resume, 'Default resume updated successfully'));
});

const deleteResume = asyncHandler(async (req, res) => {
  const result = await resumeService.deleteResume(req.user._id, req.params.id);
  return res.status(200).json(new ApiResponse(200, result, 'Resume deleted successfully'));
});

module.exports = {
  getResumes,
  uploadResume,
  setDefaultResume,
  deleteResume
};
