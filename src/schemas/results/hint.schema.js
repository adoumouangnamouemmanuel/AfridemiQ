const Joi = require("joi");

// Record hint usage schema
const recordHintUsageSchema = Joi.object({
  questionId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid question ID format",
      "any.required": "Question ID is required",
    }),

  quizId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid quiz ID format",
    }),

  sessionId: Joi.string().optional(),

  stepNumber: Joi.number().integer().min(0).optional().messages({
    "number.min": "Step number must be non-negative",
  }),

  hintType: Joi.string()
    .valid("step", "explanation", "formula", "example")
    .default("step"),

  pointsDeducted: Joi.number().min(0).default(0).messages({
    "number.min": "Points deducted cannot be negative",
  }),

  timeSpentOnHint: Joi.number().min(0).default(0).messages({
    "number.min": "Time spent cannot be negative",
  }),

  platform: Joi.string().optional(),
  screenSize: Joi.string().optional(),

  context: Joi.object({
    attemptNumber: Joi.number().integer().min(1).default(1),
    timeBeforeHint: Joi.number().min(0).optional(),
    previousAnswers: Joi.array().items(Joi.any()).optional(),
  }).optional(),
});

// Update hint usage schema
const updateHintUsageSchema = Joi.object({
  stepsViewed: Joi.array().items(Joi.number().integer().min(0)).optional(),

  hintType: Joi.string()
    .valid("step", "explanation", "formula", "example")
    .optional(),

  pointsDeducted: Joi.number().min(0).optional(),

  timeSpentOnHint: Joi.number().min(0).optional(),

  context: Joi.object({
    attemptNumber: Joi.number().integer().min(1),
    timeBeforeHint: Joi.number().min(0),
    previousAnswers: Joi.array().items(Joi.any()),
  }).optional(),
});

// Get hint usage query schema
const getHintUsageSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  questionId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  quizId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  hintType: Joi.string()
    .valid("step", "explanation", "formula", "example")
    .optional(),
});

// Bulk delete schema
const bulkDeleteSchema = Joi.object({
  hintUsageIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required()
    .messages({
      "array.min": "At least one hint usage ID is required",
      "string.pattern.base": "Invalid hint usage ID format",
    }),
});

module.exports = {
  recordHintUsageSchema,
  updateHintUsageSchema,
  getHintUsageSchema,
  bulkDeleteSchema,
};