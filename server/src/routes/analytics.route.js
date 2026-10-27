const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/v1/analytics/overview
 * @desc    Fetch aggregated funnel, conversion rates, and weekly stats
 * @access  Private
 */
router.get('/overview', analyticsController.getOverviewAnalytics);

module.exports = router;
