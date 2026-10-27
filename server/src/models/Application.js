const mongoose = require('mongoose');
const { STAGES, APPLICATION_SOURCES } = require('../constants/stages');

const statusHistorySchema = new mongoose.Schema(
  {
    fromStage: {
      type: String,
      default: null
    },
    toStage: {
      type: String,
      required: true,
      enum: Object.values(STAGES)
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
      maxlength: [100, 'Role title cannot exceed 100 characters']
    },
    jobUrl: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote / Flexible'
    },
    applicationSource: {
      type: String,
      enum: APPLICATION_SOURCES,
      default: 'Career Portal'
    },
    stage: {
      type: String,
      enum: Object.values(STAGES),
      default: STAGES.WISHLIST,
      required: true
    },
    deadline: {
      type: Date,
      default: null
    },
    interviewDate: {
      type: Date,
      default: null
    },
    salaryOrStipend: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null
    },
    statusHistory: [statusHistorySchema],
    lastStageChangeAt: {
      type: Date,
      default: Date.now
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

// Compound unique index to prevent duplicate applications for the same role at the same company by the same user
applicationSchema.index(
  { userId: 1, company: 1, role: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 } // Case-insensitive unique check
  }
);

// Compound index to speed up Kanban column queries
applicationSchema.index({ userId: 1, stage: 1 });

// Indexes for scheduled reminder range queries
applicationSchema.index({ deadline: 1 });
applicationSchema.index({ interviewDate: 1 });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
