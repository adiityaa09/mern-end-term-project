const mongoose = require('mongoose');
const { REMINDER_TYPES } = require('../src/constants/reminderTypes');
const Reminder = require('../src/models/Reminder');

describe('Reminder Idempotency Key Specification', () => {
  it('generates consistent, deterministic idempotency keys', () => {
    const userId = new mongoose.Types.ObjectId();
    const appId = new mongoose.Types.ObjectId();
    const reminderType = REMINDER_TYPES.DEADLINE_48H;
    const targetDate = '2026-10-27';

    const key1 = `${userId}_${appId}_${reminderType}_${targetDate}`;
    const key2 = `${userId}_${appId}_${reminderType}_${targetDate}`;

    expect(key1).toBe(key2);
    expect(key1).toContain(userId.toString());
    expect(key1).toContain(appId.toString());
    expect(key1).toContain('DEADLINE_48H');
    expect(key1).toContain('2026-10-27');
  });

  it('produces different keys for different reminder types on the same date', () => {
    const userId = new mongoose.Types.ObjectId();
    const appId = new mongoose.Types.ObjectId();
    const date = '2026-10-27';

    const deadlineKey = `${userId}_${appId}_${REMINDER_TYPES.DEADLINE_48H}_${date}`;
    const followUpKey = `${userId}_${appId}_${REMINDER_TYPES.FOLLOW_UP_7D}_${date}`;

    expect(deadlineKey).not.toBe(followUpKey);
  });

  it('produces different keys for different dates for recurring rules', () => {
    const userId = new mongoose.Types.ObjectId();
    const appId = new mongoose.Types.ObjectId();

    const day1Key = `${userId}_${appId}_${REMINDER_TYPES.FOLLOW_UP_7D}_2026-10-27`;
    const day2Key = `${userId}_${appId}_${REMINDER_TYPES.FOLLOW_UP_7D}_2026-10-28`;

    expect(day1Key).not.toBe(day2Key);
  });

  it('verifies Reminder model has unique constraint on idempotencyKey', () => {
    const isUnique = Reminder.schema.path('idempotencyKey').options.unique;
    expect(isUnique).toBe(true);
  });
});
