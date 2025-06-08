const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const {
  DIFFICULTY_LEVELS,
} = require("../../constants/index");

const recordHintUsageSchema = Joi.object({
  userId: Joi.objectId().required(),
  questionId: Joi.objectId().required(),
  quizId: Joi.objectId().optional(),
  series: Joi.array().items(Joi.string().trim().min(1)).optional(),
  sessionId: Joi.string()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .optional(),
  stepNumber: Joi.number().integer().min(0).optional(),
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
    attemptNumber: Joi.number().integer().min(1).default(1),
    timeBeforeHint: Joi.number().min(0).optional(),
    previousAnswers: Joi.array().max(10).optional(),
    difficulty: Joi.string()
      .valid(...DIFFICULTY_LEVELS)
      .optional(),
  }).optional(),
});

const updateHintUsageSchema = Joi.object({
  stepsViewed: Joi.array().items(Joi.number().integer().min(0)).optional(),
  hintType: Joi.string()
    .valid("step", "explanation", "formula", "example")
    .optional(),
  pointsDeducted: Joi.number().min(0).optional(),
  timeSpentOnHint: Joi.number().min(0).optional(),
  series: Joi.array().items(Joi.string().trim().min(1)).optional(),
  context: Joi.object({
    attemptNumber: Joi.number().integer().min(1).optional(),
    timeBeforeHint: Joi.number().min(0).optional(),
    previousAnswers: Joi.array().max(10).optional(),
    difficulty: Joi.string()
      .valid(...DIFFICULTY_LEVELS)
      .optional(),
  }).optional(),
}).min(1);

const getHintUsageSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  questionId: Joi.objectId().optional(),
  userId: Joi.objectId().optional(),
  quizId: Joi.objectId().optional(),
  sessionId: Joi.string()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  hintType: Joi.string()
    .valid("step", "explanation", "formula", "example")
    .optional(),
});

const bulkDeleteSchema = Joi.object({
  hintUsageIds: Joi.array().items(Joi.objectId()).min(1).required(),
});

module.exports = {
  recordHintUsageSchema,
  updateHintUsageSchema,
  getHintUsageSchema,
  bulkDeleteSchema,
};