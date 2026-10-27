const applicationService = require('../services/application.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.getApplications(req.user._id, req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, applications, 'Applications fetched successfully'));
});

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await applicationService.getApplicationById(
    req.user._id,
    req.params.id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, application, 'Application details retrieved'));
});

const createApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.createApplication(
    req.user._id,
    req.body
  );
  return res
    .status(201)
    .json(new ApiResponse(201, application, 'Application created successfully'));
});

const updateApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplication(
    req.user._id,
    req.params.id,
    req.body
  );
  return res
    .status(200)
    .json(new ApiResponse(200, application, 'Application updated successfully'));
});

const transitionStage = asyncHandler(async (req, res) => {
  const { targetStage, note } = req.body;
  const application = await applicationService.transitionStage(
    req.user._id,
    req.params.id,
    targetStage,
    note
  );
  return res
    .status(200)
    .json(new ApiResponse(200, application, `Stage transitioned to ${targetStage}`));
});

const deleteApplication = asyncHandler(async (req, res) => {
  const result = await applicationService.deleteApplication(
    req.user._id,
    req.params.id
  );
  return res.status(200).json(new ApiResponse(200, result, 'Application deleted'));
});

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  transitionStage,
  deleteApplication
};
