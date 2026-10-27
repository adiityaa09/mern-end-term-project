const express = require('express');
const applicationController = require('../controllers/application.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createApplicationSchema,
  updateApplicationSchema,
  transitionStageSchema
} = require('../validators/application.validator');

const router = express.Router();

// All application routes are strictly authenticated
router.use(authenticate);

/**
 * @route   GET /api/v1/applications
 * @desc    Get user applications with filters (stage, source, search)
 * @access  Private
 */
router.get('/', applicationController.getApplications);

/**
 * @route   POST /api/v1/applications
 * @desc    Create a new application
 * @access  Private
 */
router.post(
  '/',
  validate(createApplicationSchema),
  applicationController.createApplication
);

/**
 * @route   GET /api/v1/applications/:id
 * @desc    Get application by ID with status timeline
 * @access  Private
 */
router.get('/:id', applicationController.getApplicationById);

/**
 * @route   PATCH /api/v1/applications/:id
 * @desc    Update application metadata
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateApplicationSchema),
  applicationController.updateApplication
);

/**
 * @route   PATCH /api/v1/applications/:id/stage
 * @desc    Transition application stage via finite state machine
 * @access  Private
 */
router.patch(
  '/:id/stage',
  validate(transitionStageSchema),
  applicationController.transitionStage
);

/**
 * @route   DELETE /api/v1/applications/:id
 * @desc    Delete application
 * @access  Private
 */
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
