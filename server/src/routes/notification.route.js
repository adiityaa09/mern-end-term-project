const express = require('express');
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

/**
 * @route   GET /api/v1/notifications
 * @desc    Fetch user in-app notifications
 * @access  Private
 */
router.get('/', notificationController.getNotifications);

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark individual notification as read
 * @access  Private
 */
router.patch('/:id/read', notificationController.markAsRead);

/**
 * @route   PATCH /api/v1/notifications/read-all
 * @desc    Mark all unread notifications as read
 * @access  Private
 */
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;
