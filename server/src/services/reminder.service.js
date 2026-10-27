const Application = require('../models/Application');
const User = require('../models/User');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const emailService = require('./email.service');
const { REMINDER_TYPES, NOTIFICATION_TYPES } = require('../constants/reminderTypes');
const { STAGES } = require('../constants/stages');
const logger = require('../utils/logger');

class ReminderService {
  /**
   * Run all smart reminder checks idempotently
   */
  async processAllReminders() {
    logger.info('Starting scheduled smart reminder sweep...');

    const summary = {
      scanned: 0,
      dispatched: 0,
      skippedDuplicate: 0,
      failed: 0
    };

    try {
      await this.processDeadlineReminders(summary);
      await this.processInterviewReminders(summary);
      await this.processFollowUpReminders(summary);
    } catch (err) {
      logger.error(`Critical error during reminder sweep: ${err.message}`);
    }

    logger.success(
      `Reminder sweep completed: ${summary.dispatched} dispatched, ${summary.skippedDuplicate} skipped duplicates, ${summary.failed} errors.`
    );

    return summary;
  }

  /**
   * (a) Reminders for applications with deadlines within 48 hours
   */
  async processDeadlineReminders(summary) {
    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const apps = await Application.find({
      stage: { $in: [STAGES.WISHLIST, STAGES.APPLIED] },
      deadline: { $gte: now, $lte: in48Hours }
    }).populate('userId');

    for (const app of apps) {
      summary.scanned++;
      await this.dispatchReminder({
        app,
        reminderType: REMINDER_TYPES.DEADLINE_48H,
        notificationType: NOTIFICATION_TYPES.DEADLINE,
        title: `Deadline approaching for ${app.company}!`,
        message: `The application deadline for ${app.role} at ${app.company} is within 48 hours (${new Date(app.deadline).toLocaleDateString()}). Submit your materials soon!`,
        headline: '48h Deadline Alert',
        ctaText: 'View Application',
        summary
      });
    }
  }

  /**
   * (b) Reminders for interviews scheduled tomorrow / within 36 hours
   */
  async processInterviewReminders(summary) {
    const now = new Date();
    const in36Hours = new Date(now.getTime() + 36 * 60 * 60 * 1000);

    const apps = await Application.find({
      stage: STAGES.INTERVIEW,
      interviewDate: { $gte: now, $lte: in36Hours }
    }).populate('userId');

    for (const app of apps) {
      summary.scanned++;
      await this.dispatchReminder({
        app,
        reminderType: REMINDER_TYPES.INTERVIEW_TOMORROW,
        notificationType: NOTIFICATION_TYPES.INTERVIEW,
        title: `Upcoming interview with ${app.company}!`,
        message: `Your interview for ${app.role} at ${app.company} is scheduled for tomorrow. Review your notes and prepare your answers!`,
        headline: 'Interview Tomorrow',
        ctaText: 'Review Notes',
        summary
      });
    }
  }

  /**
   * (c) Follow-up reminders for applications sitting in 'Applied' with no update for 7+ days
   */
  async processFollowUpReminders(summary) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const apps = await Application.find({
      stage: { $in: [STAGES.APPLIED, STAGES.ONLINE_ASSESSMENT] },
      lastStageChangeAt: { $lte: sevenDaysAgo }
    }).populate('userId');

    for (const app of apps) {
      summary.scanned++;
      await this.dispatchReminder({
        app,
        reminderType: REMINDER_TYPES.FOLLOW_UP_7D,
        notificationType: NOTIFICATION_TYPES.FOLLOW_UP,
        title: `Time to follow up with ${app.company}`,
        message: `You applied for ${app.role} at ${app.company} over 7 days ago without an update. Consider sending a polite follow-up inquiry to the recruiter.`,
        headline: 'Follow-Up Recommendation',
        ctaText: 'Check Status',
        summary
      });
    }
  }

  /**
   * Core Idempotency Dispatch Engine:
   * Safely attempts to register the reminder idempotency key.
   * If a duplicate key code 11000 is encountered, it skips silently.
   */
  async dispatchReminder({
    app,
    reminderType,
    notificationType,
    title,
    message,
    headline,
    ctaText,
    summary
  }) {
    if (!app.userId) return;

    const user = app.userId;
    const targetDate = new Date().toISOString().split('T')[0]; // Normalized YYYY-MM-DD
    const idempotencyKey = `${user._id}_${app._id}_${reminderType}_${targetDate}`;

    let reminderRecord;

    try {
      // 1. ATOMIC IDEMPOTENCY CHECK & INSERT
      // If a reminder for this user + app + type + date already exists, MongoDB throws 11000 duplicate key
      reminderRecord = await Reminder.create({
        userId: user._id,
        applicationId: app._id,
        reminderType,
        targetDate,
        idempotencyKey,
        status: 'SENT'
      });
    } catch (err) {
      // MongoDB duplicate key error code is 11000
      if (err.code === 11000) {
        summary.skippedDuplicate++;
        return; // Idempotently ignore: already dispatched today!
      }
      logger.error(`Reminder insert error for ${idempotencyKey}: ${err.message}`);
      summary.failed++;
      return;
    }

    // 2. DISPATCH IN-APP NOTIFICATION
    try {
      if (user.reminderSettings?.inAppNotifications !== false) {
        await Notification.create({
          userId: user._id,
          applicationId: app._id,
          title,
          message,
          type: notificationType
        });
      }
    } catch (err) {
      logger.error(`Failed to create in-app notification: ${err.message}`);
    }

    // 3. DISPATCH TRANSACTIONAL EMAIL (if enabled)
    if (user.reminderSettings?.emailNotifications !== false && user.email) {
      try {
        const html = emailService.generateReminderTemplate({
          userName: user.name,
          company: app.company,
          role: app.role,
          headline,
          message,
          ctaText
        });

        await emailService.sendMail({
          to: user.email,
          subject: `[ApplyTrack] ${title}`,
          text: `${title}\n\n${message}\nCompany: ${app.company}\nRole: ${app.role}`,
          html
        });
      } catch (err) {
        logger.error(`Email delivery failure for ${user.email}: ${err.message}`);
        // Update reminder record to reflect partial failure without crashing
        await Reminder.updateOne(
          { _id: reminderRecord._id },
          { $set: { status: 'FAILED', errorDetails: err.message } }
        );
      }
    }

    summary.dispatched++;
  }
}

module.exports = new ReminderService();
