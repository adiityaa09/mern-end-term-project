const express = require('express');
const resumeController = require('../controllers/resume.controller');
const authenticate = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/v1/resumes
 * @desc    Get all user resumes with linked application counts
 * @access  Private
 */
router.get('/', resumeController.getResumes);

/**
 * @route   POST /api/v1/resumes
 * @desc    Upload a PDF resume with a version label
 * @access  Private
 */
router.post('/', upload.single('file'), resumeController.uploadResume);

/**
 * @route   PATCH /api/v1/resumes/:id/default
 * @desc    Designate a resume as default
 * @access  Private
 */
router.patch('/:id/default', resumeController.setDefaultResume);

/**
 * @route   DELETE /api/v1/resumes/:id
 * @desc    Delete resume (safely blocked if linked to active applications)
 * @access  Private
 */
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
