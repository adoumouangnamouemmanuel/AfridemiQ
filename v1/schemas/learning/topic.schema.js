const Joi = require("joi");
const {
  DIFFICULTY_LEVELS,
  LEARNING_OBJECTIVES,
  STATUSES,
  SERIES
} = require("../../constants");

// =============== CREATE TOPIC SCHEMA ===============
const createTopicSchema = Joi.object({
  name: {
    type: String,
    required: [true, "Le nom du sujet est requis"],
    trim: true,
    maxlength: [150, "Le nom ne peut pas dépasser 150 caractères"],
  },

  description: Joi.string()
    .required()
    .trim()
    .max(500)
    .messages({
      "any.required": "La description est requise",
      "string.max": "La description ne peut pas dépasser 500 caractères",
    }),

  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "L'ID de la matière est requis",
      "string.pattern.base": "Format d'ID de matière invalide",
    }),

  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .required()
    .messages({
      "any.required": "La difficulté est requise",
      "any.only": "La difficulté doit être : easy, medium ou hard",
    }),

  estimatedTimeHours: Joi.number()
    .min(0.5)
    .max(20)
    .optional()
    .default(2)
    .messages({
      "number.min": "Minimum 30 minutes",
      "number.max": "Maximum 20 heures",
    }),

  learningObjectives: Joi.array()
    .items(
      Joi.object({
        objective: Joi.string()
          .required()
          .trim()
          .max(200)
          .messages({
            "any.required": "L'objectif d'apprentissage est requis",
            "string.max": "L'objectif ne peut pas dépasser 200 caractères",
          }),
        level: Joi.string()
          .valid(...LEARNING_OBJECTIVES)
          .optional()
          .default("understand")
          .messages({
            "any.only": "Niveau d'objectif invalide",
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      "any.required": "Au moins un objectif d'apprentissage est requis",
      "array.min": "Au moins un objectif d'apprentissage est requis",
    }),

  prerequisites: Joi.array()
    .items(Joi.string().trim().max(100))
    .optional()
    .messages({
      "string.max": "Le prérequis ne peut pas dépasser 100 caractères",
    }),

  keywords: Joi.array()
    .items(Joi.string().trim().max(50))
    .optional()
    .messages({
      "string.max": "Le mot-clé ne peut pas dépasser 50 caractères",
    }),

  order: Joi.number()
    .min(0)
    .optional()
    .default(0)
    .messages({
      "number.min": "L'ordre ne peut pas être négatif",
    }),

  isPremium: Joi.boolean().optional().default(false),
  isPopular: Joi.boolean().optional().default(false),
});

// =============== UPDATE TOPIC SCHEMA ===============
const updateTopicSchema = Joi.object({
  name: Joi.string().trim().max(150).optional(),
  description: Joi.string().trim().max(500).optional(),
  subjectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  difficulty: Joi.string().valid(...DIFFICULTY_LEVELS).optional(),
  estimatedTimeHours: Joi.number().min(0.5).max(20).optional(),
  learningObjectives: Joi.array()
    .items(
      Joi.object({
        objective: Joi.string().required().trim().max(200),
        level: Joi.string().valid(...LEARNING_OBJECTIVES).optional().default("understand"),
      })
    )
    .min(1)
    .optional(),
  prerequisites: Joi.array().items(Joi.string().trim().max(100)).optional(),
  keywords: Joi.array().items(Joi.string().trim().max(50)).optional(),
  order: Joi.number().min(0).optional(),
  isPremium: Joi.boolean().optional(),
  isPopular: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

// =============== QUERY PARAMS SCHEMA ===============
const getTopicsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  subjectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  difficulty: Joi.string().valid(...DIFFICULTY_LEVELS).optional(),
  isActive: Joi.boolean().optional(),
  isPremium: Joi.boolean().optional(),
  isPopular: Joi.boolean().optional(),
  hasQuestions: Joi.boolean().optional(),
  hasResources: Joi.boolean().optional(),
  search: Joi.string().trim().max(100).optional(),
  sortBy: Joi.string().valid("name", "createdAt", "order", "difficulty", "stats.averageScore").optional().default("order"),
  sortOrder: Joi.string().valid("asc", "desc").optional().default("asc"),
});

module.exports = {
  createTopicSchema,
  updateTopicSchema,
  getTopicsQuerySchema,
};