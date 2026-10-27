const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

class ResumeService {
  /**
   * Get all resumes for user with linked application counts
   */
  async getResumes(userId) {
    const resumes = await Resume.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();

    // Attach count of active applications using each resume
    const resumesWithCounts = await Promise.all(
      resumes.map(async (resume) => {
        const applicationCount = await Application.countDocuments({
          userId,
          resumeId: resume._id
        });
        return {
          ...resume,
          applicationCount
        };
      })
    );

    return resumesWithCounts;
  }

  /**
   * Upload resume to Cloudinary or local disk
   */
  async uploadResume(userId, file, { label, isDefault = false }) {
    if (!file) {
      throw ApiError.badRequest('Please upload a PDF file.');
    }

    const wantsDefault = isDefault === 'true' || isDefault === true;

    let fileUrl = '';
    let publicId = '';

    // If Cloudinary is configured, stream buffer to Cloudinary
    if (isCloudinaryConfigured && file.buffer) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: 'applytrack/resumes',
            public_id: `resume_${userId}_${Date.now()}`
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      fileUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else {
      // Local disk storage
      fileUrl = `/uploads/resumes/${file.filename}`;
      publicId = file.filename;
    }

    // If set as default, remove default flag from existing resumes
    if (wantsDefault) {
      await Resume.updateMany({ userId }, { $set: { isDefault: false } });
    } else {
      // If this is the user's first resume, make it default automatically
      const existingCount = await Resume.countDocuments({ userId });
      if (existingCount === 0) {
        // First resume defaults to true
        isDefault = true;
      }
    }

    const resume = await Resume.create({
      userId,
      label: label.trim(),
      fileUrl,
      publicId,
      fileName: file.originalname,
      fileSize: file.size,
      isDefault: wantsDefault || (await Resume.countDocuments({ userId })) === 1
    });

    return resume;
  }

  /**
   * Set designated resume as the default
   */
  async setDefaultResume(userId, resumeId) {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw ApiError.notFound('Resume not found.');
    }

    // Reset other resumes
    await Resume.updateMany({ userId }, { $set: { isDefault: false } });

    resume.isDefault = true;
    await resume.save();

    return resume;
  }

  /**
   * Delete resume, blocking if referenced by active applications
   */
  async deleteResume(userId, resumeId) {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw ApiError.notFound('Resume not found.');
    }

    // Check if any applications are referencing this resume
    const linkedApplicationsCount = await Application.countDocuments({
      userId,
      resumeId
    });

    if (linkedApplicationsCount > 0) {
      throw ApiError.conflict(
        `Cannot delete resume "${resume.label}". It is attached to ${linkedApplicationsCount} active job application(s). Please reassign or unlink those applications before deleting this resume.`
      );
    }

    // Delete remote Cloudinary file if applicable
    if (isCloudinaryConfigured && resume.publicId) {
      try {
        await cloudinary.uploader.destroy(resume.publicId, { resource_type: 'raw' });
      } catch (err) {
        // Non-blocking file deletion error logging
      }
    } else if (resume.publicId) {
      // Delete local disk file
      const localFilePath = path.resolve(__dirname, '../../uploads/resumes', resume.publicId);
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch (err) {
          // File might already be gone
        }
      }
    }

    await Resume.deleteOne({ _id: resumeId, userId });

    return { id: resumeId, message: `Resume "${resume.label}" deleted successfully` };
  }
}

module.exports = new ResumeService();
