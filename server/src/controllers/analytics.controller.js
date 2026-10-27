const analyticsService = require('../services/analytics.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getOverviewAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getOverviewAnalytics(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, analytics, 'Analytics data calculated successfully'));
});

module.exports = {
  getOverviewAnalytics
};
