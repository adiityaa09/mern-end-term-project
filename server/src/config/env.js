const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredVars = ['JWT_SECRET'];

// Defensive startup verification: warn or fail fast if critical configs are missing
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`[FATAL] Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/applytrack',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'ApplyTrack <no-reply@applytrack.com>'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxAuth: parseInt(process.env.RATE_LIMIT_MAX_AUTH || '20', 10)
  }
};
