const Joi = require("joi");
const {
  QUIZ_FORMATS,
  DIFFICULTY_LEVELS,
  EDUCATION_LEVELS,
  EXAM_TYPES,
  STATUSES,
} = require("../../constants");

// Create quiz schema
const createQuizSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.empty": "Quiz title is required",
    "string.min": "Quiz title must be at least 3 characters long",
    "string.max": "Quiz title cannot exceed 200 characters",
  }),

  description: Joi.string().trim().max(1000).optional().messages({
    "string.max": "Description cannot exceed 1000 characters",
  }),

  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid subject ID format",
      "any.required": "Subject ID is required",
    }),

  series: Joi.array().optional(),

  topicIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .optional()
    .messages({
      "array.min": "At least one topic is required",
      "string.pattern.base": "Invalid topic ID format",
    }),

  questionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required()
    .messages({
      "array.min": "At least one question is required",
      "string.pattern.base": "Invalid question ID format",
      "any.required": "Question IDs are required",
    }),

  totalQuestions: Joi.number().integer().min(1).max(100).optional(),

  totalPoints: Joi.number().integer().min(1).required().messages({
    "number.min": "Total points must be at least 1",
    "any.required": "Total points is required",
  }),

  level: Joi.string()
    .valid("Beginner", "Intermediate", "Advanced")
    .required()
    .messages({
      "any.only": "Level must be one of: Beginner, Intermediate, Advanced",
      "any.required": "Level is required",
    }),

  timeLimit: Joi.number().integer().min(60).max(10800).required().messages({
    "number.min": "Time limit must be at least 60 seconds (1 minute)",
    "number.max": "Time limit cannot exceed 10800 seconds (3 hours)",
    "any.required": "Time limit is required",
  }),

  retakePolicy: Joi.object({
    maxAttempts: Joi.number().integer().min(1).max(10).default(3),
    cooldownMinutes: Joi.number().integer().min(0).max(1440).default(0),
  }).optional(),

  settings: Joi.object({
    shuffleQuestions: Joi.boolean().default(false),
    shuffleOptions: Joi.boolean().default(false),
    showCorrectAnswers: Joi.boolean().default(true),
    allowReview: Joi.boolean().default(true),
  }).optional(),

  difficulty: Joi.string().valid("Easy", "Medium", "Hard").default("Medium"),

  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),

  offlineAvailable: Joi.boolean().default(false),
  premiumOnly: Joi.boolean().default(false),
});

// Update quiz schema
const updateQuizSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),

  description: Joi.string().trim().max(1000).optional(),

  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),

  series: Joi.string().trim().optional(),

  topicIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .optional(),

  questionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .optional(),

  totalQuestions: Joi.number().integer().min(1).max(100).optional(),

  totalPoints: Joi.number().integer().min(1).optional(),

  level: Joi.string().valid("Beginner", "Intermediate", "Advanced").optional(),

  timeLimit: Joi.number().integer().min(60).max(10800).optional(),

  retakePolicy: Joi.object({
    maxAttempts: Joi.number().integer().min(1).max(10),
    cooldownMinutes: Joi.number().integer().min(0).max(1440),
  }).optional(),

  settings: Joi.object({
    shuffleQuestions: Joi.boolean(),
    shuffleOptions: Joi.boolean(),
    showCorrectAnswers: Joi.boolean(),
    allowReview: Joi.boolean(),
  }).optional(),

  difficulty: Joi.string().valid("Easy", "Medium", "Hard").optional(),

  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),

  isActive: Joi.boolean().optional(),
  offlineAvailable: Joi.boolean().optional(),
  premiumOnly: Joi.boolean().optional(),
});

// Get quizzes query schema
const getQuizzesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("createdAt", "title", "level", "difficulty", "totalAttempts")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  search: Joi.string().trim().optional(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  level: Joi.string().valid("Beginner", "Intermediate", "Advanced").optional(),
  difficulty: Joi.string().valid("Easy", "Medium", "Hard").optional(),
  premiumOnly: Joi.boolean().optional(),
  isActive: Joi.boolean().default(true),
});

// Bulk update schema
const bulkUpdateQuizzesSchema = Joi.object({
  quizIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required()
    .messages({
      "array.min": "At least one quiz ID is required",
      "string.pattern.base": "Invalid quiz ID format",
    }),

  updateData: Joi.object({
    isActive: Joi.boolean(),
    premiumOnly: Joi.boolean(),
    difficulty: Joi.string().valid("Easy", "Medium", "Hard"),
    tags: Joi.array().items(Joi.string().trim().lowercase()),
  })
    .min(1)
    .required(),
});

module.exports = {
  createQuizSchema,
  updateQuizSchema,
  getQuizzesSchema,
  bulkUpdateQuizzesSchema,
};