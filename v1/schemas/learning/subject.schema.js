const Joi = require("joi");
const {
  SUBJECT_CATEGORIES,
  EXAM_TYPES,
  COUNTRIES,
  EDUCATION_LEVELS,
  SERIES,
  DIFFICULTY_LEVELS,
} = require("../../constants");

// =============== CREATE SUBJECT SCHEMA ===============
const createSubjectSchema = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    .max(100)
    .messages({
      "any.required": "Le nom de la matière est requis",
      "string.max": "Le nom ne peut pas dépasser 100 caractères",
    }),

  code: Joi.string()
    .required()
    .trim()
    .uppercase()
    .max(10)
    .pattern(/^[A-Z0-9]+$/)
    .messages({
      "any.required": "Le code de la matière est requis",
      "string.max": "Le code ne peut pas dépasser 10 caractères",
      "string.pattern.base":
        "Le code doit contenir uniquement des lettres majuscules et des chiffres",
    }),
  description: Joi.string()
    .required()
    .trim()
    .max(500)
    .messages({
      "any.required": "La description est requise",
      "string.max": "La description ne peut pas dépasser 500 caractères",
    }),

  category: Joi.string()
    .valid(...SUBJECT_CATEGORIES)
    .required()
    .messages({
      "any.required": "La catégorie est requise",
      "any.only": "Catégorie invalide",
    }),

  examTypes: Joi.array()
    .items(Joi.string().valid(...EXAM_TYPES))
    .min(1)
    .required()
    .messages({
      "any.required": "Au moins un type d'examen est requis",
      "array.min": "Au moins un type d'examen est requis",
    }),

  countries: Joi.array()
    .items(Joi.string().valid(...COUNTRIES))
    .min(1)
    .required()
    .messages({
      "any.required": "Au moins un pays est requis",
      "array.min": "Au moins un pays est requis",
    }),

  educationLevels: Joi.array()
    .items(Joi.string().valid(...EDUCATION_LEVELS))
    .min(1)
    .required()
    .messages({
      "any.required": "Au moins un niveau d'éducation est requis",
      "array.min": "Au moins un niveau d'éducation est requis",
    }),

  series: Joi.array()
    .items(Joi.string().valid(...SERIES))
    .optional(),

  icon: Joi.string().max(50).optional().default("📚"),

  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .optional()
    .default("#3B82F6")
    .messages({
      "string.pattern.base": "Couleur hex invalide",
    }),

  prerequisites: Joi.array().items(Joi.string().trim().max(100)).optional(),

  estimatedHours: Joi.number().min(1).max(500).optional().default(40).messages({
    "number.min": "Minimum 1 heure",
    "number.max": "Maximum 500 heures",
  }),

  isPremium: Joi.boolean().optional().default(false),
  isFeatured: Joi.boolean().optional().default(false),
});

// =============== UPDATE SUBJECT SCHEMA ===============
const updateSubjectSchema = Joi.object({
  name: Joi.string().trim().max(100).optional(),
  description: Joi.string().trim().max(500).optional(),
  category: Joi.string()
    .valid(...SUBJECT_CATEGORIES)
    .optional(),
  examTypes: Joi.array()
    .items(Joi.string().valid(...EXAM_TYPES))
    .min(1)
    .optional(),
  countries: Joi.array()
    .items(Joi.string().valid(...COUNTRIES))
    .min(1)
    .optional(),
  educationLevels: Joi.array()
    .items(Joi.string().valid(...EDUCATION_LEVELS))
    .min(1)
    .optional(),
  series: Joi.array()
    .items(Joi.string().valid("A", "C", "D", "ALL"))
    .optional(),
  icon: Joi.string().max(50).optional(),
  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .optional(),
  category: Joi.string()
    .valid(...SUBJECT_CATEGORIES)
    .optional(),
  examType: Joi.string()
    .valid(...EXAM_TYPES)
    .optional(),
  country: Joi.string()
    .valid(...COUNTRIES)
    .optional(),
  educationLevel: Joi.string()
    .valid(...EDUCATION_LEVELS)
    .optional(),
  difficulty: Joi.string().valid("facile", "moyen", "difficile").optional(),
  search: Joi.string().trim().optional(),
  isActive: Joi.boolean().default(true),
  sortBy: Joi.string()
    .valid(
      "name",
      "createdAt",
      "difficulty",
      "examCount",
      "popularity",
      "rating"
    )
    .default("name"),
  sortOrder: Joi.string().valid("asc", "desc").default("asc"),
});

const addExamToSubjectSchema = Joi.object({
  examId: Joi.string().required().messages({
    "any.required": "L'ID de l'examen est requis",
  }),
});

const rateSubjectSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    "any.required": "La note est requise",
    "number.min": "La note doit être au moins 1",
    "number.max": "La note ne peut pas dépasser 5",
  }),
});

const bulkCreateSchema = Joi.object({
  subjects: Joi.array().items(createSubjectSchema).min(1).required().messages({
    "any.required": "La liste des matières est requise",
    "array.min": "Au moins une matière doit être fournie",
  }),
});

const bulkUpdateSchema = Joi.object({
  updates: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        data: updateSubjectSchema.required(),
      })
    )
    .min(1)
    .required()
    .messages({
      "any.required": "La liste des mises à jour est requise",
      "array.min": "Au moins une mise à jour doit être fournie",
    }),
});

const bulkDeleteSchema = Joi.object({
  ids: Joi.array().items(Joi.string()).min(1).required().messages({
    "any.required": "La liste des IDs est requise",
    "array.min": "Au moins un ID doit être fourni",
  }),
});

const compareSubjectsSchema = Joi.object({
  ids: Joi.array().items(Joi.string()).min(2).required().messages({
    "any.required": "La liste des IDs est requise",
    "array.min": "Au moins 2 IDs doivent être fournis pour la comparaison",
  }),
});

module.exports = {
  createSubjectSchema,
  updateSubjectSchema,
  getSubjectsSchema,
  addExamToSubjectSchema,
  rateSubjectSchema,
  bulkCreateSchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
  compareSubjectsSchema,
};
