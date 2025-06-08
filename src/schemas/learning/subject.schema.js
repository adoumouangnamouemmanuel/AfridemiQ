const Joi = require("joi");

const createSubjectSchema = Joi.object({
  name: Joi.string().required().trim().max(100).messages({
    "any.required": "Le nom de la matière est requis",
    "string.max": "Le nom ne peut pas dépasser 100 caractères",
  }),
  icon: Joi.string().required().trim().messages({
    "any.required": "L'icône est requise",
  }),
  color: Joi.string()
    .required()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .messages({
      "any.required": "La couleur est requise",
      "string.pattern.base":
        "La couleur doit être un code hexadécimal valide (ex: #FF0000)",
    }),
  description: Joi.string().required().trim().max(500).messages({
    "any.required": "La description est requise",
    "string.max": "La description ne peut pas dépasser 500 caractères",
  }),
  longDescription: Joi.string().trim().max(2000).optional(),
  series: Joi.array().items(Joi.string().trim()).min(1).required().messages({
    "any.required": "Au moins une série doit être spécifiée",
    "array.min": "Au moins une série doit être spécifiée",
  }),
  category: Joi.string()
    .valid(
      "sciences",
      "litterature",
      "langues",
      "mathematiques",
      "sciences-sociales",
      "arts",
      "technologie"
    )
    .required()
    .messages({
      "any.required": "La catégorie est requise",
      "any.only": "Catégorie invalide",
    }),
  subcategory: Joi.string().trim().max(50).optional(),
  difficulty: Joi.string()
    .valid("facile", "moyen", "difficile")
    .default("moyen"),
  estimatedHours: Joi.number().integer().min(1).max(1000).optional(),
  tags: Joi.array().items(Joi.string().trim()).default([]),
  keywords: Joi.array().items(Joi.string().trim()).default([]),
});

const updateSubjectSchema = Joi.object({
  name: Joi.string().trim().max(100),
  icon: Joi.string().trim(),
  color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  description: Joi.string().trim().max(500),
  longDescription: Joi.string().trim().max(2000),
  series: Joi.array().items(Joi.string().trim()).min(1),
  category: Joi.string().valid(
    "sciences",
    "litterature",
    "langues",
    "mathematiques",
    "sciences-sociales",
    "arts",
    "technologie"
  ),
  subcategory: Joi.string().trim().max(50),
  difficulty: Joi.string().valid("facile", "moyen", "difficile"),
  estimatedHours: Joi.number().integer().min(1).max(1000),
  tags: Joi.array().items(Joi.string().trim()),
  keywords: Joi.array().items(Joi.string().trim()),
  isActive: Joi.boolean(),
});

const getSubjectsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  series: Joi.alternatives()
    .try(
      Joi.string().trim().min(1),
      Joi.array().items(Joi.string().trim().min(1))
    )
    .optional(),
  category: Joi.string()
    .valid(
      "sciences",
      "litterature",
      "langues",
      "mathematiques",
      "sciences-sociales",
      "arts",
      "technologie"
    )
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
