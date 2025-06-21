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

// Update resource schema
const updateResourceSchema = Joi.object({
  format: Joi.string()
    .valid(...RESOURCE_TYPES)
    .messages({
      "any.only": `Le format doit être l'une des valeurs suivantes: ${RESOURCE_TYPES.join(
        ", "
      )}`,
    }),
  title: Joi.string().min(3).max(200).messages({
    "string.min": "Le titre doit contenir au moins 3 caractères",
    "string.max": "Le titre ne peut pas dépasser 200 caractères",
  }),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "L'ID du sujet doit être un ObjectId valide",
    }),
  series: Joi.array().items(Joi.string().max(50)).messages({
    "array.base": "Les séries doivent être un tableau",
    "string.max": "Chaque série ne peut pas dépasser 50 caractères",
  }),
  topicIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.pattern.base":
            "Chaque ID de sujet doit être un ObjectId valide",
        })
    )
    .messages({
      "array.base": "Les IDs des sujets doivent être un tableau",
    }),
  url: Joi.string().uri().messages({
    "string.uri": "L'URL doit être une URL valide",
  }),
  description: Joi.string().min(10).max(1000).messages({
    "string.min": "La description doit contenir au moins 10 caractères",
    "string.max": "La description ne peut pas dépasser 1000 caractères",
  }),
  level: Joi.string(),
  examIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.pattern.base":
            "Chaque ID d'examen doit être un ObjectId valide",
        })
    )
    .messages({
      "array.base": "Les IDs des examens doivent être un tableau",
    }),
  thumbnail: Joi.string().uri().messages({
    "string.uri": "La miniature doit être une URL valide",
  }),
  offlineAvailable: Joi.boolean().messages({
    "boolean.base": "offlineAvailable doit être un booléen",
  }),
  premiumOnly: Joi.boolean().messages({
    "boolean.base": "premiumOnly doit être un booléen",
  }),
  metadata: metadataSchema,
  accessibility: accessibilitySchema,
});

// Add feedback schema
const addFeedbackSchema = Joi.object({
  rating: Joi.number().min(0).max(10).required().messages({
    "number.base": "La note doit être un nombre",
    "number.min": "La note doit être au moins 0",
    "number.max": "La note ne peut pas dépasser 10",
    "any.required": "La note est requise",
  }),
  comments: Joi.string().max(500).messages({
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
