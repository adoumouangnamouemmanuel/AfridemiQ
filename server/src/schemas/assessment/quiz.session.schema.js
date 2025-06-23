const Joi = require("joi");

// Create session schema
const createSessionSchema = Joi.object({
  quizId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid quiz ID format",
      "any.required": "Quiz ID is required",
    }),

  platform: Joi.string().optional(),
  screenResolution: Joi.string().optional(),
  isOnline: Joi.boolean().default(true),
});

// Submit answer schema
const submitAnswerSchema = Joi.object({
  questionId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid question ID format",
      "any.required": "Question ID is required",
    }),

  selectedAnswer: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.number(),
      Joi.array().items(Joi.string()),
      Joi.boolean()
    )
    .required()
    .messages({
      "any.required": "Selected answer is required",
    }),
});

// Navigate schema
const navigateSchema = Joi.object({
  questionIndex: Joi.number().integer().min(0).required().messages({
    "number.min": "Question index must be 0 or greater",
    "any.required": "Question index is required",
  }),
});

// Sync session schema
const syncSessionSchema = Joi.object({
  deviceInfo: Joi.object({
    platform: Joi.string().optional(),
    browser: Joi.string().optional(),
    version: Joi.string().optional(),
    userAgent: Joi.string().optional(),
    screenResolution: Joi.string().optional(),
    isOnline: Joi.boolean().optional(),
  }).optional(),

  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
        selectedAnswer: Joi.alternatives().try(
          Joi.string(),
          Joi.number(),
          Joi.array().items(Joi.string()),
          Joi.boolean()
        ),
        timeSpent: Joi.number().min(0),
        flagged: Joi.boolean(),
        skipped: Joi.boolean(),
        answeredAt: Joi.date(),
      })
    )
    .optional(),

  currentQuestionIndex: Joi.number().integer().min(0).optional(),
});

module.exports = {
  createSessionSchema,
  submitAnswerSchema,
  navigateSchema,
  syncSessionSchema,
};