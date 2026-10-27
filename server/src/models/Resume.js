const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    label: {
      type: String,
      required: [true, 'Resume label is required (e.g. SDE v1, DevOps)'],
      trim: true,
      maxlength: [60, 'Label cannot exceed 60 characters']
    },
    fileUrl: {
      type: String,
      required: [true, 'Resume file URL is required']
    },
    publicId: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound indexes for user queries and default selection
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ userId: 1, isDefault: 1 });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
