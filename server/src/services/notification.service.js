const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

class NotificationService {
  /**
   * Fetch in-app notifications for authenticated user
   */
  async getNotifications(userId, unreadOnly = false) {
    const filter = { userId };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return {
      notifications,
      unreadCount
    };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      throw ApiError.notFound('Notification not found.');
    }

    return notification;
  }

  /**
   * Mark all unread notifications as read
   */
  async markAllAsRead(userId) {
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    return { success: true, message: 'All notifications marked as read' };
  }

  /**
   * Helper to create a notification
   */
  async createNotification({ userId, applicationId, title, message, type }) {
    return Notification.create({
      userId,
      applicationId: applicationId || null,
      title,
      message,
      type
    });
  }
}

module.exports = new NotificationService();
