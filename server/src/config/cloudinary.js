const cloudinary = require('cloudinary').v2;
const env = require('./env');
const logger = require('../utils/logger');

let isCloudinaryConfigured = false;

if (
  env.cloudinary.cloudName &&
  env.cloudinary.apiKey &&
  env.cloudinary.apiSecret
) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret
  });
  isCloudinaryConfigured = true;
  logger.info('Cloudinary SDK configured for remote PDF uploads.');
} else {
  logger.info('Cloudinary credentials omitted; defaulting to local disk uploads.');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured
};
