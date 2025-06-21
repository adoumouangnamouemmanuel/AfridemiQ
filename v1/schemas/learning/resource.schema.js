const Joi = require("joi");
const {
  MEDIA_TYPES,
  DIFFICULTY_LEVELS,
  RESOURCE_CATEGORIES,
  EXAM_SESSIONS,
} = require("../../constants");

// =============== CREATE RESOURCE SCHEMA ===============
const createResourceSchema = Joi.object({
  title: Joi.string().required().trim().max(200).messages({
    "any.required": "Le titre est requis",
    "string.max": "Le titre ne peut pas dépasser 200 caractères",
  }),

  description: Joi.string().required().trim().max(500).messages({
    "any.required": "La description est requise",
    "string.max": "La description ne peut pas dépasser 500 caractères",
  }),

  type: Joi.string()
    .valid(...MEDIA_TYPES, "pdf", "link", "exercise")
    .required()
    .messages({
      "any.required": "Le type est requis",
      "any.only": "Type de ressource invalide",
  }),

  category: Joi.string()
    .valid(...RESOURCE_CATEGORIES)
    .required()
    .messages({
      "any.required": "La catégorie est requise",
      "any.only": "Catégorie de ressource invalide",
    }),

  url: Joi.string().uri().required().messages({
    "any.required": "L'URL est requise",
    "string.uri": "L'URL doit être valide",
  }),

  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "L'ID de la matière est requis",
      "string.pattern.base": "Format d'ID de matière invalide",
  }),

  topicId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
        .messages({
      "string.pattern.base": "Format d'ID de sujet invalide",
    }),

  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .optional()
    .default("medium")
    .messages({
      "any.only": "Niveau de difficulté invalide",
    }),

  targetLevel: Joi.string()
    .valid("junior_secondary", "senior_secondary", "both")
    .optional()
    .default("both")
    .messages({
      "any.only": "Niveau cible invalide",
  }),

  examYear: Joi.number()
    .min(2000)
    .max(2030)
    .when("category", {
      is: "past_papers",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "number.min": "Année minimum 2000",
      "number.max": "Année maximum 2030",
      "any.required": "L'année d'examen est requise pour les sujets d'examens",
  }),

  examSession: Joi.string()
    .valid(...EXAM_SESSIONS)
    .when("category", {
      is: "past_papers",
      then: Joi.required(),
      otherwise: Joi.optional(),
        })
    .messages({
      "any.only": "Session d'examen invalide",
      "any.required":
        "La session d'examen est requise pour les sujets d'examens",
    }),

  fileInfo: Joi.object({
    size: Joi.number().min(0).optional(),
    mimeType: Joi.string().trim().optional(),
    duration: Joi.number().min(0).optional(),
    pages: Joi.number().min(1).optional(),
  }).optional(),

  tags: Joi.array().items(Joi.string().trim().max(30)).optional().messages({
    "string.max": "Le tag ne peut pas dépasser 30 caractères",
  }),

  keywords: Joi.array().items(Joi.string().trim().max(50)).optional().messages({
    "string.max": "Le mot-clé ne peut pas dépasser 50 caractères",
  }),

  author: Joi.object({
    name: Joi.string().trim().max(100).optional(),
    institution: Joi.string().trim().max(150).optional(),
  }).optional(),

  source: Joi.string().trim().max(200).optional().messages({
    "string.max": "La source ne peut pas dépasser 200 caractères",
  }),

  isPublic: Joi.boolean().optional().default(true),
  isPremium: Joi.boolean().optional().default(false),
  requiresDownload: Joi.boolean().optional().default(false),
  isFeatured: Joi.boolean().optional().default(false),
  isVerified: Joi.boolean().optional().default(false),
});

// =============== UPDATE RESOURCE SCHEMA ===============
const updateResourceSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(500).optional(),
  type: Joi.string()
    .valid(...MEDIA_TYPES, "pdf", "link", "exercise")
    .optional(),
  category: Joi.string()
    .valid(...RESOURCE_CATEGORIES)
    .optional(),
  url: Joi.string().uri().optional(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  topicId: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .optional(),
  targetLevel: Joi.string()
    .valid("junior_secondary", "senior_secondary", "both")
    .optional(),
  examYear: Joi.number().min(2000).max(2030).optional(),
  examSession: Joi.string()
    .valid(...EXAM_SESSIONS)
    .optional(),
  fileInfo: Joi.object({
    size: Joi.number().min(0).optional(),
    mimeType: Joi.string().trim().optional(),
    duration: Joi.number().min(0).optional(),
    pages: Joi.number().min(1).optional(),
  }).optional(),
  tags: Joi.array().items(Joi.string().trim().max(30)).optional(),
  keywords: Joi.array().items(Joi.string().trim().max(50)).optional(),
  author: Joi.object({
    name: Joi.string().trim().max(100).optional(),
    institution: Joi.string().trim().max(150).optional(),
  }).optional(),
  source: Joi.string().trim().max(200).optional(),
  isPublic: Joi.boolean().optional(),
  isPremium: Joi.boolean().optional(),
  requiresDownload: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  isVerified: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

// =============== ADD FEEDBACK SCHEMA ===============
const addFeedbackSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    "any.required": "La note est requise",
    "number.min": "La note doit être entre 1 et 5",
    "number.max": "La note doit être entre 1 et 5",
  }),

  comments: Joi.string().max(500).optional().messages({
    "string.max": "Les commentaires ne peuvent pas dépasser 500 caractères",
  }),
});

// Bulk create resources schema
const bulkCreateResourcesSchema = Joi.object({
  resources: Joi.array()
    .items(createResourceSchema)
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.base": "Les ressources doivent être un tableau",
      "array.min": "Au moins une ressource est requise",
      "array.max": "Maximum 50 ressources peuvent être créées à la fois",
      "any.required": "Les ressources sont requises",
    }),
});

module.exports = {
  createResourceSchema,
  updateResourceSchema,
  addFeedbackSchema,
  bulkCreateResourcesSchema,
};
