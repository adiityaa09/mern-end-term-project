const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

/**
 * Configure standard secure cookie options for JWT transmission
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

/**
 * Helper to dispatch cookie and standardized response
 */
const sendAuthResponse = (res, statusCode, result, message) => {
  res.cookie('token', result.token, getCookieOptions());

  return res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      {
        user: result.user,
        token: result.token // Also provided in payload for non-browser HTTP clients
      },
      message
    )
  );
};

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendAuthResponse(res, 201, result, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendAuthResponse(res, 200, result, 'Login successful');
});

const logout = asyncHandler(async (req, res) => {
  // Clear httpOnly cookie with matching flags
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax'
  });

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, 'Current user profile retrieved'));
});

const updateSettings = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateSettings(req.user._id, req.body.reminderSettings);
  return res
    .status(200)
    .json(new ApiResponse(200, { user: updatedUser }, 'Settings updated successfully'));
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateSettings
};
