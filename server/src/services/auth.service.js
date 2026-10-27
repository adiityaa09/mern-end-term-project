const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class AuthService {
  /**
   * Register a new user account
   */
  async register({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password
    });

    const token = user.generateAuthToken();

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        reminderSettings: user.reminderSettings,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Authenticate existing user with email and password
   */
  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Explicitly select password field since schema sets select: false
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const isMatch = await user.isPasswordMatch(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const token = user.generateAuthToken();

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        reminderSettings: user.reminderSettings,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Update notification and reminder preferences
   */
  async updateSettings(userId, reminderSettings) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    if (reminderSettings) {
      if (typeof reminderSettings.emailNotifications === 'boolean') {
        user.reminderSettings.emailNotifications = reminderSettings.emailNotifications;
      }
      if (typeof reminderSettings.inAppNotifications === 'boolean') {
        user.reminderSettings.inAppNotifications = reminderSettings.inAppNotifications;
      }
    }

    await user.save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      reminderSettings: user.reminderSettings,
      updatedAt: user.updatedAt
    };
  }
}

module.exports = new AuthService();
