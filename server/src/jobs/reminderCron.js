const cron = require('node-cron');
const reminderService = require('../services/reminder.service');
const logger = require('../utils/logger');
const env = require('../config/env');

let cronTask = null;

/**
 * Initialize daily scheduled background job for smart reminders
 */
const initReminderCron = () => {
  // In development, we can test on demand or schedule for 09:00 AM every day
  // Cron syntax: Second(optional) Minute Hour DayOfMonth Month DayOfWeek
  // '0 9 * * *' = Every day at 09:00 AM
  const scheduleExpression = '0 9 * * *';

  cronTask = cron.schedule(
    scheduleExpression,
    async () => {
      logger.info('⏰ Executing scheduled daily reminder cron task...');
      try {
        await reminderService.processAllReminders();
      } catch (err) {
        logger.error(`Cron job execution encountered an uncaught error: ${err.message}`);
      }
    },
    {
      scheduled: true,
      timezone: 'UTC'
    }
  );

  logger.success(`Smart Reminder cron worker scheduled [${scheduleExpression}]`);
};

/**
 * Manual trigger helper for testing and on-demand execution
 */
const triggerManualReminderRun = async () => {
  return reminderService.processAllReminders();
};

module.exports = {
  initReminderCron,
  triggerManualReminderRun
};
