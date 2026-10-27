const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initTransporter();
  }

  initTransporter() {
    if (env.email.user && env.email.pass) {
      this.transporter = nodemailer.createTransport({
        service: env.email.service,
        auth: {
          user: env.email.user,
          pass: env.email.pass
        }
      });
      this.isConfigured = true;
      logger.info('Nodemailer SMTP transporter initialized.');
    } else {
      logger.info('SMTP credentials not configured; simulated email mode active.');
    }
  }

  /**
   * Generic send email method with error containment (never crashes calling process)
   */
  async sendMail({ to, subject, html, text }) {
    if (!this.isConfigured) {
      logger.info(`[SIMULATED EMAIL] To: ${to} | Subject: "${subject}"`);
      return { sent: true, simulated: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: env.email.from,
        to,
        subject,
        text,
        html
      });
      logger.info(`Email successfully sent to ${to}: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (err) {
      logger.error(`Failed to send email to ${to}: ${err.message}`);
      return { sent: false, error: err.message };
    }
  }

  /**
   * Generate branded HTML email template for application reminders
   */
  generateReminderTemplate({ userName, company, role, headline, message, actionUrl, ctaText }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background-color: #2563eb; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .content { padding: 32px 24px; }
          .badge { display: inline-block; background-color: #eff6ff; color: #1d4ed8; padding: 4px 10px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
          .details-card { background-color: #f1f5f9; border-radius: 6px; padding: 16px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-decoration: none; margin-top: 16px; }
          .footer { padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ApplyTrack Reminder</h1>
          </div>
          <div class="content">
            <span class="badge">${headline}</span>
            <p>Hi <strong>${userName}</strong>,</p>
            <p>${message}</p>
            <div class="details-card">
              <p style="margin: 0 0 6px 0;"><strong>Company:</strong> ${company}</p>
              <p style="margin: 0;"><strong>Role:</strong> ${role}</p>
            </div>
            <div style="text-align: center;">
              <a href="${actionUrl || env.clientUrl}" class="btn">${ctaText || 'View in ApplyTrack'}</a>
            </div>
          </div>
          <div class="footer">
            <p>You received this email because email reminders are enabled on your ApplyTrack account.</p>
            <p>ApplyTrack — Student Job & Internship Application Tracker</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
