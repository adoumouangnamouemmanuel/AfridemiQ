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

  totalQuestions: Joi.number().min(1).max(50).optional().messages({
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

// =============== UPDATE QUIZ SCHEMA ===============
const updateQuizSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(500).optional(),
  format: Joi.string()
    .valid(...QUIZ_FORMATS)
    .optional(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  topicIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
  questionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .optional(),
  timeLimit: Joi.number().min(5).max(180).optional(),
  totalQuestions: Joi.number().min(1).max(50).optional(),
  passingScore: Joi.number().min(0).max(100).optional(),
  maxAttempts: Joi.number().min(1).max(10).optional(),
  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS, "mixed")
    .optional(),
  educationLevel: Joi.string()
    .valid(...EDUCATION_LEVELS)
    .optional(),
  examType: Joi.string()
    .valid(...EXAM_TYPES)
    .optional(),
  isPremium: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
});

// =============== QUERY PARAMS SCHEMA ===============
const getQuizzesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  topicId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  format: Joi.string()
    .valid(...QUIZ_FORMATS)
    .optional(),
  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS, "mixed")
    .optional(),
  educationLevel: Joi.string()
    .valid(...EDUCATION_LEVELS)
    .optional(),
  examType: Joi.string()
    .valid(...EXAM_TYPES)
    .optional(),
  isActive: Joi.boolean().optional(),
  isPremium: Joi.boolean().optional(),
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
  search: Joi.string().trim().max(100).optional(),
  sortBy: Joi.string()
    .valid(
      "title",
      "createdAt",
      "difficulty",
      "stats.totalAttempts",
      "stats.averageScore"
    )
    .optional()
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").optional().default("desc"),
});

module.exports = {
  createQuizSchema,
  updateQuizSchema,
  getQuizzesQuerySchema,
};
