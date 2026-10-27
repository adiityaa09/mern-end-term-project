const Application = require('../models/Application');
const stateMachineService = require('./stateMachine.service');
const ApiError = require('../utils/ApiError');
const { STAGES } = require('../constants/stages');

class ApplicationService {
  /**
   * List applications for the authenticated user with search, filter, and sort
   */
  async getApplications(userId, { stage, search, source, sort = '-updatedAt' }) {
    const filter = { userId };

    if (stage) {
      filter.stage = stage;
    }

    if (source) {
      filter.applicationSource = source;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ company: searchRegex }, { role: searchRegex }, { notes: searchRegex }];
    }

    return Application.find(filter)
      .populate('resumeId', 'label fileUrl fileName isDefault')
      .sort(sort)
      .lean();
  }

  /**
   * Create a new job/internship application
   */
  async createApplication(userId, data) {
    const { company, role, stage = STAGES.WISHLIST } = data;

    // Defensive check: prevent duplicate application for the same role and company
    const existing = await Application.findOne({
      userId,
      company: { $regex: new RegExp(`^${company.trim()}$`, 'i') },
      role: { $regex: new RegExp(`^${role.trim()}$`, 'i') }
    });

    if (existing) {
      throw ApiError.conflict(
        `You already have an application recorded for "${role}" at "${company}".`
      );
    }

    const application = new Application({
      ...data,
      userId,
      stage,
      statusHistory: [
        {
          fromStage: null,
          toStage: stage,
          changedAt: new Date(),
          note: 'Application entry created'
        }
      ],
      lastStageChangeAt: new Date()
    });

    await application.save();
    return application.populate('resumeId', 'label fileUrl fileName isDefault');
  }

  /**
   * Get single application details with history timeline
   */
  async getApplicationById(userId, applicationId) {
    const application = await Application.findOne({
      _id: applicationId,
      userId
    }).populate('resumeId', 'label fileUrl fileName isDefault');

    if (!application) {
      throw ApiError.notFound('Application not found or you do not have permission to view it.');
    }

    return application;
  }

  /**
   * Update application general metadata (excluding stage)
   */
  async updateApplication(userId, applicationId, updateData) {
    // If company or role is being updated, verify uniqueness
    if (updateData.company || updateData.role) {
      const current = await this.getApplicationById(userId, applicationId);
      const targetCompany = updateData.company || current.company;
      const targetRole = updateData.role || current.role;

      const duplicate = await Application.findOne({
        _id: { $ne: applicationId },
        userId,
        company: { $regex: new RegExp(`^${targetCompany.trim()}$`, 'i') },
        role: { $regex: new RegExp(`^${targetRole.trim()}$`, 'i') }
      });

      if (duplicate) {
        throw ApiError.conflict(
          `Another application already exists for "${targetRole}" at "${targetCompany}".`
        );
      }
    }

    // Exclude stage manipulation from general patch route
    delete updateData.stage;
    delete updateData.statusHistory;
    delete updateData.userId;

    const application = await Application.findOneAndUpdate(
      { _id: applicationId, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('resumeId', 'label fileUrl fileName isDefault');

    if (!application) {
      throw ApiError.notFound('Application not found.');
    }

    return application;
  }

  /**
   * Execute valid stage transition through the finite state machine
   */
  async transitionStage(userId, applicationId, targetStage, note = '') {
    const application = await Application.findOne({ _id: applicationId, userId });
    if (!application) {
      throw ApiError.notFound('Application not found.');
    }

    // Enforce business rules via state machine service
    stateMachineService.validateTransition(application.stage, targetStage);

    const fromStage = application.stage;

    // Record timeline entry
    application.statusHistory.push({
      fromStage,
      toStage: targetStage,
      changedAt: new Date(),
      note: note || `Stage updated from ${fromStage} to ${targetStage}`
    });

    application.stage = targetStage;
    application.lastStageChangeAt = new Date();

    await application.save();
    return application.populate('resumeId', 'label fileUrl fileName isDefault');
  }

  /**
   * Delete an application
   */
  async deleteApplication(userId, applicationId) {
    const application = await Application.findOneAndDelete({
      _id: applicationId,
      userId
    });

    if (!application) {
      throw ApiError.notFound('Application not found.');
    }

    // Optional: cascade clean up reminders if reminder collection exists
    try {
      const Reminder = require('../models/Reminder');
      await Reminder.deleteMany({ applicationId });
    } catch (err) {
      // Model might not be loaded yet in early phases
    }

    return { id: applicationId, message: 'Application deleted successfully' };
  }
}

module.exports = new ApplicationService();
