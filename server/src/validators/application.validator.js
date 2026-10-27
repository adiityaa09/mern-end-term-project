const { z } = require('zod');
const { STAGES, APPLICATION_SOURCES } = require('../constants/stages');

const stageEnumValues = Object.values(STAGES);

const createApplicationSchema = z.object({
  company: z
    .string({ required_error: 'Company name is required' })
    .trim()
    .min(1, 'Company name cannot be empty')
    .max(100, 'Company name must be at most 100 characters'),
  role: z
    .string({ required_error: 'Job role is required' })
    .trim()
    .min(1, 'Role title cannot be empty')
    .max(100, 'Role title must be at most 100 characters'),
  jobUrl: z.string().trim().url('Must be a valid URL').or(z.literal('')).optional(),
  location: z.string().trim().max(100).optional(),
  applicationSource: z.enum(APPLICATION_SOURCES).optional(),
  stage: z.enum(stageEnumValues).optional(),
  deadline: z.string().datetime().nullable().optional(),
  interviewDate: z.string().datetime().nullable().optional(),
  salaryOrStipend: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(3000).optional(),
  resumeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Resume ID').nullable().optional()
});

const updateApplicationSchema = z.object({
  company: z.string().trim().min(1).max(100).optional(),
  role: z.string().trim().min(1).max(100).optional(),
  jobUrl: z.string().trim().url('Must be a valid URL').or(z.literal('')).optional(),
  location: z.string().trim().max(100).optional(),
  applicationSource: z.enum(APPLICATION_SOURCES).optional(),
  deadline: z.string().datetime().nullable().optional(),
  interviewDate: z.string().datetime().nullable().optional(),
  salaryOrStipend: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(3000).optional(),
  resumeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Resume ID').nullable().optional()
});

const transitionStageSchema = z.object({
  targetStage: z.enum(stageEnumValues, {
    required_error: 'Target stage is required'
  }),
  note: z.string().trim().max(500).optional()
});

module.exports = {
  createApplicationSchema,
  updateApplicationSchema,
  transitionStageSchema
};
