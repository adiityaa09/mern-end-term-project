const express = require('express');
const mongoose = require('mongoose');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * @route   GET /api/v1/health
 * @desc    System health, memory, and database connectivity check
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const dbStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';

    const healthData = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        host: mongoose.connection.host || 'none',
        name: mongoose.connection.name || 'none'
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsageMB: {
          rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
          heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
          heapTotal: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)
        }
      }
    };

    const httpStatus = dbStatus === 'connected' ? 200 : 503;
    return res.status(httpStatus).json(new ApiResponse(httpStatus, healthData, 'System is healthy'));
  })
);

module.exports = router;
