const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const unreadOnly = req.query.unreadOnly === 'true';
  const data = await notificationService.getNotifications(req.user._id, unreadOnly);
  return res
    .status(200)
    .json(new ApiResponse(200, data, 'Notifications fetched successfully'));
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.user._id,
    req.params.id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, notification, 'Notification marked as read'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'All notifications marked as read'));
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
