const Joi = require("joi");
const {
  QUIZ_FORMATS,
  DIFFICULTY_LEVELS,
  EDUCATION_LEVELS,
  EXAM_TYPES,
  STATUSES,
} = require("../../constants");

// =============== CREATE QUIZ SCHEMA ===============
const createQuizSchema = Joi.object({
  title: Joi.string().required().trim().max(200).messages({
    "any.required": "Le titre est requis",
    "string.max": "Le titre ne peut pas dépasser 200 caractères",
  }),

  description: Joi.string().trim().max(500).optional().messages({
    "string.max": "La description ne peut pas dépasser 500 caractères",
  }),

  format: Joi.string()
    .valid(...QUIZ_FORMATS)
    .optional()
    .default("practice")
    .messages({
      "any.only": "Format de quiz invalide",
  }),

  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "L'ID de la matière est requis",
      "string.pattern.base": "ID de matière invalide",
    }),

  topicIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional()
    .messages({
      "string.pattern.base": "ID de sujet invalide",
    }),

  questionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required()
    .messages({
      "any.required": "Au moins une question est requise",
      "array.min": "Au moins une question est requise",
      "string.pattern.base": "ID de question invalide",
    }),

  timeLimit: Joi.number().min(5).max(180).required().messages({
    "any.required": "La limite de temps est requise",
    "number.min": "Minimum 5 minutes",
    "number.max": "Maximum 3 heures",
    }),

  totalQuestions: Joi.number().min(1).max(50).required().messages({
    "any.required": "Le nombre de questions est requis",
    "number.min": "Minimum 1 question",
    "number.max": "Maximum 50 questions",
  }),

  passingScore: Joi.number().min(0).max(100).optional().default(60).messages({
    "number.min": "Score minimum invalide",
    "number.max": "Score maximum invalide",
  }),

  maxAttempts: Joi.number().min(1).max(10).optional().default(3).messages({
    "number.min": "Minimum 1 tentative",
    "number.max": "Maximum 10 tentatives",
  }),

  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS, "mixed")
    .optional()
    .default("mixed")
    .messages({
      "any.only": "Niveau de difficulté invalide",
    }),

  educationLevel: Joi.string()
    .valid(...EDUCATION_LEVELS)
    .required()
    .messages({
      "any.required": "Le niveau d'éducation est requis",
      "any.only": "Niveau d'éducation invalide",
  }),

  examType: Joi.string()
    .valid(...EXAM_TYPES)
    .optional()
    .messages({
      "any.only": "Type d'examen invalide",
    }),

  isPremium: Joi.boolean().optional().default(false),
  isActive: Joi.boolean().optional().default(true),
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