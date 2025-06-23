const Joi = require("joi");

// Common validation patterns
const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const difficultyLevels = ["beginner", "intermediate", "advanced"];

// Module schema
const moduleSchema = Joi.object({
  id: Joi.string().optional(),
  title: Joi.string().required().min(1).max(200).messages({
    "string.empty": "Le titre du module est requis",
    "string.min": "Le titre du module doit contenir au moins 1 caractère",
    "string.max": "Le titre du module ne peut pas dépasser 200 caractères",
  }),
  description: Joi.string().optional().max(1000).messages({
    "string.max":
      "La description du module ne peut pas dépasser 1000 caractères",
  }),
  order: Joi.number().integer().min(1).optional().messages({
    "number.base": "L'ordre doit être un nombre",
    "number.integer": "L'ordre doit être un nombre entier",
    "number.min": "L'ordre doit être supérieur à 0",
  }),
  series: Joi.string().optional().max(50).messages({
    "string.max": "La série ne peut pas dépasser 50 caractères",
  }),
  lessons: Joi.array()
    .items(
      Joi.string().pattern(objectIdPattern).messages({
        "string.pattern.base": "ID de leçon invalide",
      })
    )
    .optional(),
  exerciseIds: Joi.array()
    .items(
      Joi.string().pattern(objectIdPattern).messages({
        "string.pattern.base": "ID d'exercice invalide",
      })
    )
    .optional(),
  assessment: Joi.string()
    .pattern(objectIdPattern)
    .allow(null)
    .optional()
    .messages({
      "string.pattern.base": "ID d'évaluation invalide",
    }),
  progressTracking: Joi.object({
    completedLessons: Joi.number().integer().min(0).optional(),
    totalLessons: Joi.number().integer().min(0).optional(),
  }).optional(),
});

// Progress tracking schema
const progressTrackingSchema = Joi.object({
  completedLessons: Joi.number().integer().min(0).optional().messages({
    "number.base": "Le nombre de leçons complétées doit être un nombre",
    "number.integer":
      "Le nombre de leçons complétées doit être un nombre entier",
    "number.min": "Le nombre de leçons complétées ne peut pas être négatif",
  }),
  totalLessons: Joi.number().integer().min(0).optional().messages({
    "number.base": "Le nombre total de leçons doit être un nombre",
    "number.integer": "Le nombre total de leçons doit être un nombre entier",
    "number.min": "Le nombre total de leçons ne peut pas être négatif",
  }),
});

// Accessibility options schema
const accessibilityOptionsSchema = Joi.object({
  languages: Joi.array().items(Joi.string().max(10)).optional().messages({
    "string.max": "Le code de langue ne peut pas dépasser 10 caractères",
  }),
  formats: Joi.array().items(Joi.string().max(50)).optional().messages({
    "string.max": "Le format ne peut pas dépasser 50 caractères",
  }),
  accommodations: Joi.array().items(Joi.string().max(100)).optional().messages({
    "string.max": "L'accommodation ne peut pas dépasser 100 caractères",
  }),
});

// Metadata schema
const metadataSchema = Joi.object({
  createdBy: Joi.string().pattern(objectIdPattern).optional().messages({
    "string.pattern.base": "ID de créateur invalide",
  }),
  createdAt: Joi.date().optional(),
  updatedBy: Joi.string().pattern(objectIdPattern).optional().messages({
    "string.pattern.base": "ID de modificateur invalide",
  }),
  tags: Joi.array()
    .items(
      Joi.string().max(50).messages({
        "string.max": "Un tag ne peut pas dépasser 50 caractères",
      })
    )
    .optional(),
});

// Create course content schema
const createCourseContentSchema = Joi.object({
  examId: Joi.array()
    .items(
      Joi.string().pattern(objectIdPattern).required().messages({
        "string.pattern.base": "ID d'examen invalide",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins un examen est requis",
      "any.required": "Les examens sont requis",
    }),
  subjectId: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "ID de matière invalide",
    "any.required": "La matière est requise",
  }),
  topicIds: Joi.array()
    .items(
      Joi.string().pattern(objectIdPattern).required().messages({
        "string.pattern.base": "ID de sujet invalide",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins un sujet est requis",
      "any.required": "Les sujets sont requis",
    }),
  series: Joi.string().max(50).optional().messages({
    "string.max": "La série ne peut pas dépasser 50 caractères",
  }),
  title: Joi.string().required().min(1).max(200).messages({
    "string.empty": "Le titre est requis",
    "string.min": "Le titre doit contenir au moins 1 caractère",
    "string.max": "Le titre ne peut pas dépasser 200 caractères",
    "any.required": "Le titre est requis",
  }),
  description: Joi.string().required().min(10).max(2000).messages({
    "string.empty": "La description est requise",
    "string.min": "La description doit contenir au moins 10 caractères",
    "string.max": "La description ne peut pas dépasser 2000 caractères",
    "any.required": "La description est requise",
  }),
  level: Joi.string()
    .valid(...difficultyLevels)
    .required()
    .messages({
      "any.only": "Le niveau doit être: beginner, intermediate, ou advanced",
      "any.required": "Le niveau de difficulté est requis",
    }),
  modules: Joi.array().items(moduleSchema).optional(),
  prerequisites: Joi.array()
    .items(
      Joi.string().max(100).messages({
        "string.max": "Un prérequis ne peut pas dépasser 100 caractères",
      })
    )
    .optional(),
  estimatedDuration: Joi.number().integer().min(1).optional().messages({
    "number.base": "La durée estimée doit être un nombre",
    "number.integer": "La durée estimée doit être un nombre entier",
    "number.min": "La durée estimée doit être supérieure à 0",
  }),
  progressTracking: progressTrackingSchema.optional(),
  accessibilityOptions: accessibilityOptionsSchema.optional(),
  premiumOnly: Joi.boolean().optional(),
  metadata: metadataSchema.optional(),
});

// Update course content schema
const updateCourseContentSchema = Joi.object({
  examId: Joi.array()
    .items(
      Joi.string().pattern(objectIdPattern).required().messages({
        "string.pattern.base": "ID d'examen invalide",
      })
    )
    .min(1)
    .optional()
    .messages({
      "array.min": "Au moins un examen est requis",
    }),
  subjectId: Joi.string().pattern(objectIdPattern).optional().messages({
    "string.pattern.base": "ID de matière invalide",
  }),
  topicId: Joi.array()
    .items(
      Joi.string().pattern(objectIdPattern).required().messages({
        "string.pattern.base": "ID de sujet invalide",
      })
    )
    .min(1)
    .optional()
    .messages({
      "array.min": "Au moins un sujet est requis",
    }),
  series: Joi.string().max(50).optional().messages({
    "string.max": "La série ne peut pas dépasser 50 caractères",
  }),
  title: Joi.string().min(1).max(200).optional().messages({
    "string.min": "Le titre doit contenir au moins 1 caractère",
    "string.max": "Le titre ne peut pas dépasser 200 caractères",
  }),
  description: Joi.string().min(10).max(2000).optional().messages({
    "string.min": "La description doit contenir au moins 10 caractères",
    "string.max": "La description ne peut pas dépasser 2000 caractères",
  }),
  level: Joi.string()
    .valid(...difficultyLevels)
    .optional()
    .messages({
      "any.only": "Le niveau doit être: beginner, intermediate, ou advanced",
    }),
  modules: Joi.array().items(moduleSchema).optional(),
  prerequisites: Joi.array()
    .items(
      Joi.string().max(100).messages({
        "string.max": "Un prérequis ne peut pas dépasser 100 caractères",
      })
    )
    .optional(),
  estimatedDuration: Joi.number().integer().min(1).optional().messages({
    "number.base": "La durée estimée doit être un nombre",
    "number.integer": "La durée estimée doit être un nombre entier",
    "number.min": "La durée estimée doit être supérieure à 0",
  }),
  progressTracking: progressTrackingSchema.optional(),
  accessibilityOptions: accessibilityOptionsSchema.optional(),
  premiumOnly: Joi.boolean().optional(),
  metadata: metadataSchema.optional(),
});

// Update progress tracking schema
const updateProgressTrackingSchema = Joi.object({
  completedLessons: Joi.number().integer().min(0).required().messages({
    "number.base": "Le nombre de leçons complétées doit être un nombre",
    "number.integer":
      "Le nombre de leçons complétées doit être un nombre entier",
    "number.min": "Le nombre de leçons complétées ne peut pas être négatif",
    "any.required": "Le nombre de leçons complétées est requis",
  }),
  totalLessons: Joi.number().integer().min(0).optional().messages({
    "number.base": "Le nombre total de leçons doit être un nombre",
    "number.integer": "Le nombre total de leçons doit être un nombre entier",
    "number.min": "Le nombre total de leçons ne peut pas être négatif",
  }),
});

// Bulk create course contents schema
const bulkCreateCourseContentsSchema = Joi.object({
  courseContents: Joi.array()
    .items(createCourseContentSchema)
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.min": "Au moins un contenu de cours est requis",
      "array.max": "Maximum 50 contenus de cours par lot",
      "any.required": "La liste des contenus de cours est requise",
    }),
});

module.exports = {
  createCourseContentSchema,
  updateCourseContentSchema,
  updateProgressTrackingSchema,
  bulkCreateCourseContentsSchema,
};