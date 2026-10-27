const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const env = require('./config/env');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');
const healthRoutes = require('./routes/health.route');
const authRoutes = require('./routes/auth.route');
const applicationRoutes = require('./routes/application.route');
const resumeRoutes = require('./routes/resume.route');
const notificationRoutes = require('./routes/notification.route');

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing (CORS) with cookie credential support
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        env.clientUrl,
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173'
      ];

      if (allowedOrigins.indexOf(origin) !== -1 || env.nodeEnv === 'development') {
        callback(null, true);
      } else {
        callback(new ApiError(403, `CORS blocked request from origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Request body parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Cookie parser for JWT in httpOnly cookies
app.use(cookieParser());

// HTTP request logging
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static asset serving for local resume uploads
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Base API Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Catch-all 404 handler for undefined API routes
app.use((req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized Error-Handling Middleware (must be registered last)
app.use(errorHandler);

module.exports = app;
