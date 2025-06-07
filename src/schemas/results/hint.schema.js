const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const {
  DIFFICULTY_LEVELS,
} = require("../../models/learning/adaptive.learning.model");

const createHintUsageSchema = Joi.object({
  questionId: Joi.objectId().required(),
  userId: Joi.objectId().required(),
  quizId: Joi.objectId().optional(),
  series: Joi.array().items(Joi.string().trim().min(1)).optional(),
  sessionId: Joi.string()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .optional(),
  usedAt: Joi.date().default(Date.now),
  stepsViewed: Joi.array().items(Joi.number().min(0)).optional(),
  totalStepsAvailable: Joi.number().min(1).optional(),
  hintType: Joi.string()
    .valid("step", "explanation", "formula", "example")
    .default("step"),
  pointsDeducted: Joi.number().min(0).default(0),
  timeSpentOnHint: Joi.number().min(0).default(0),
  deviceInfo: Joi.object({
    platform: Joi.string().trim().optional(),
    browser: Joi.string().trim().optional(),
    screenSize: Joi.string().trim().optional(),
  }).optional(),
  context: Joi.object({
    attemptNumber: Joi.number().min(1).default(1),
    timeBeforeHint: Joi.number().min(0).optional(),
    previousAnswers: Joi.array().max(10).optional(),
    difficulty: Joi.string()
      .valid(...DIFFICULTY_LEVELS)
      .optional(),
  }).optional(),
});

const updateHintUsageSchema = createHintUsageSchema
  .fork(
    [
      "questionId",
      "userId",
      "quizId",
      "series",
      "sessionId",
      "usedAt",
      "stepsViewed",
      "totalStepsAvailable",
      "hintType",
      "pointsDeducted",
      "timeSpentOnHint",
      "deviceInfo",
      "context",
    ],
    (schema) => schema.optional()
  )
  .min(1);

const getHintUsageSchema = Joi.object({
  questionId: Joi.objectId().optional(),
  userId: Joi.objectId().optional(),
  quizId: Joi.objectId().optional(),
  sessionId: Joi.string().optional(),
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
  createHintUsageSchema,
  updateHintUsageSchema,
  getHintUsageSchema,
  bulkDeleteSchema,
};
