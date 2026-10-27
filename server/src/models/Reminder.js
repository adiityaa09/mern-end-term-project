const mongoose = require('mongoose');
const { REMINDER_TYPES } = require('../constants/reminderTypes');

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true
    },
    reminderType: {
      type: String,
      enum: Object.values(REMINDER_TYPES),
      required: true
    },
    targetDate: {
      type: String,
      required: true,
      comment: 'Normalized date string YYYY-MM-DD for idempotency partition'
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      comment: 'Guarantees that a reminder is never created or dispatched more than once'
    },
    status: {
      type: String,
      enum: ['SENT', 'FAILED', 'SKIPPED'],
      default: 'SENT'
    },
    channel: {
      type: String,
      enum: ['ALL', 'IN_APP_ONLY', 'EMAIL_ONLY'],
      default: 'ALL'
    },
    errorDetails: {
      type: String,
      default: null
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
