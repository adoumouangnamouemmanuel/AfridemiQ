const Joi = require("joi");

const createMissionSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    "string.base": "Le titre doit être une chaîne de caractères",
    "string.min": "Le titre doit contenir au moins 3 caractères",
    "string.max": "Le titre ne peut pas dépasser 100 caractères",
    "any.required": "Le titre est requis",
  }),
  description: Joi.string().min(10).max(500).required().messages({
    "string.base": "La description doit être une chaîne de caractères",
    "string.min": "La description doit contenir au moins 10 caractères",
    "string.max": "La description ne peut pas dépasser 500 caractères",
    "any.required": "La description est requise",
  }),
  type: Joi.string()
    .valid("daily", "weekly", "monthly", "custom")
    .required()
    .messages({
      "any.only": "Le type doit être daily, weekly, monthly ou custom",
      "any.required": "Le type est requis",
    }),
  target: Joi.number().min(1).required().messages({
    "number.base": "L'objectif doit être un nombre",
    "number.min": "L'objectif doit être au moins 1",
    "any.required": "L'objectif est requis",
  }),
  reward: Joi.string().min(3).max(100).required().messages({
    "string.base": "La récompense doit être une chaîne de caractères",
    "string.min": "La récompense doit contenir au moins 3 caractères",
    "string.max": "La récompense ne peut pas dépasser 100 caractères",
    "any.required": "La récompense est requise",
  }),
  icon: Joi.string().required().messages({
    "string.base": "L'icône doit être une chaîne de caractères",
    "any.required": "L'icône est requise",
  }),
  expiresAt: Joi.date().greater("now").required().messages({
    "date.base": "La date d'expiration doit être une date valide",
    "date.greater": "La date d'expiration doit être dans le futur",
    "any.required": "La date d'expiration est requise",
  }),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": "L'ID du sujet doit être un ObjectId valide",
    }),
  series: Joi.string().optional(),
  difficulty: Joi.string().valid("easy", "medium", "hard").optional(),
  points: Joi.number().min(1).optional().messages({
    "number.base": "Les points doivent être un nombre",
    "number.min": "Les points doivent être au moins 1",
  }),
  category: Joi.string()
    .valid("study", "practice", "achievement", "social")
    .optional(),
});

const updateMissionSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).max(500).optional(),
  type: Joi.string().valid("daily", "weekly", "monthly", "custom").optional(),
  target: Joi.number().min(1).optional(),
  reward: Joi.string().min(3).max(100).optional(),
  icon: Joi.string().optional(),
  expiresAt: Joi.date().greater("now").optional(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  series: Joi.string().optional(),
  difficulty: Joi.string().valid("easy", "medium", "hard").optional(),
  points: Joi.number().min(1).optional(),
  category: Joi.string()
    .valid("study", "practice", "achievement", "social")
    .optional(),
  isActive: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    "object.min": "Au moins un champ doit être fourni pour la mise à jour",
  });

const updateProgressSchema = Joi.object({
  progress: Joi.number().min(0).required().messages({
    "number.base": "Le progrès doit être un nombre",
    "number.min": "Le progrès doit être positif",
    "any.required": "Le progrès est requis",
  }),
});

module.exports = {
  createMissionSchema,
  updateMissionSchema,
  updateProgressSchema,
};