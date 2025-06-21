const Joi = require("joi");
const {
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  EDUCATION_LEVELS,
  EXAM_TYPES,
  STATUSES,
} = require("../../constants");

// =============== CREATE QUESTION SCHEMA ===============
const createQuestionSchema = Joi.object({
  question: Joi.string().required().trim().max(1000).messages({
    "any.required": "La question est requise",
    "string.max": "La question ne peut pas dépasser 1000 caractères",
  }),

  type: Joi.string()
    .valid(...QUESTION_TYPES)
    .required()
    .messages({
      "any.required": "Le type de question est requis",
      "any.only": "Type de question invalide",
    }),

  options: Joi.array()
    .items(Joi.string().trim().max(200))
    .when("type", {
      is: "multiple_choice",
      then: Joi.array().min(2).max(5).required().messages({
        "array.min": "Au moins 2 options sont requises",
        "array.max": "Maximum 5 options autorisées",
        "any.required": "Les options sont requises pour les choix multiples",
      }),
      otherwise: Joi.optional(),
    }),

  correctAnswer: Joi.alternatives()
    .try(Joi.string(), Joi.number(), Joi.boolean())
    .required()
    .messages({
      "any.required": "La réponse correcte est requise",
    }),

  explanation: Joi.string().trim().max(500).optional().messages({
    "string.max": "L'explication ne peut pas dépasser 500 caractères",
  }),

  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "L'ID de la matière est requis",
      "string.pattern.base": "ID de matière invalide",
    }),

  topicId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": "ID de sujet invalide",
    }),

  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .optional()
    .default("medium")
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

  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),

  isPremium: Joi.boolean().optional().default(false),
  isActive: Joi.boolean().optional().default(true),
            });

// =============== UPDATE QUESTION SCHEMA ===============
const updateQuestionSchema = Joi.object({
  question: Joi.string().trim().max(1000).optional(),
  type: Joi.string()
    .valid(...QUESTION_TYPES)
    .optional(),
  options: Joi.array().items(Joi.string().trim().max(200)).optional(),
  correctAnswer: Joi.alternatives()
    .try(Joi.string(), Joi.number(), Joi.boolean())
    .optional(),
  explanation: Joi.string().trim().max(500).optional(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  topicId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .optional(),
  educationLevel: Joi.string()
    .valid(...EDUCATION_LEVELS)
    .optional(),
  examType: Joi.string()
    .valid(...EXAM_TYPES)
      .optional(),
  tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
  isPremium: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  status: Joi.string()
    .valid(...STATUSES)
    .optional(),
});

// =============== QUERY PARAMS SCHEMA ===============
const getQuestionsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  topicId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  format: Joi.string()
    .valid(...QUESTION_TYPES)
    .optional(),
  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .optional(),
  status: Joi.string()
    .valid("draft", "review", "approved", "rejected", "archived")
    .optional(),
  premiumOnly: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  getQuestionSchema,
};
