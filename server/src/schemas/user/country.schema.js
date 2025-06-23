const Joi = require("joi");

const createCountrySchema = Joi.object({
  name: Joi.string().required().trim().max(100).messages({
    "any.required": "Le nom du pays est requis",
    "string.max": "Le nom du pays ne peut pas dépasser 100 caractères",
  }),
  code: Joi.string().required().trim().min(2).max(3).uppercase().messages({
    "any.required": "Le code du pays est requis",
    "string.min": "Le code du pays doit avoir au moins 2 caractères",
    "string.max": "Le code du pays ne peut pas dépasser 3 caractères",
  }),
  flag: Joi.string().required().trim().messages({
    "any.required": "Le drapeau est requis",
  }),
  supportedExams: Joi.array().items(Joi.string()).default([]),
  languages: Joi.array().items(Joi.string().trim()).min(1).required().messages({
    "any.required": "Au moins une langue doit être spécifiée",
    "array.min": "Au moins une langue doit être spécifiée",
  }),
  currency: Joi.string().trim().max(10).optional(),
  timezone: Joi.string().trim().max(50).optional(),
  region: Joi.string()
    .valid(
      "North Africa",
      "West Africa",
      "East Africa",
      "Central Africa",
      "Southern Africa"
    )
    .required()
    .messages({
      "any.required": "La région est requise",
      "any.only": "Région invalide",
    }),
  capital: Joi.string().trim().max(100).optional(),
  population: Joi.number().integer().min(0).optional(),
  educationSystem: Joi.string()
    .valid("French", "British", "American", "Portuguese", "Arabic", "Mixed")
    .required()
    .messages({
      "any.required": "Le système éducatif est requis",
      "any.only": "Système éducatif invalide",
    }),
  examBoards: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required().trim().max(100).messages({
          "any.required": "Le nom du conseil d'examen est requis",
          "string.max": "Le nom ne peut pas dépasser 100 caractères",
        }),
        description: Joi.string().trim().max(500).optional(),
        website: Joi.string().trim().uri().optional(),
      })
    )
    .default([]),
});

const updateCountrySchema = Joi.object({
  name: Joi.string().trim().max(100),
  code: Joi.string().trim().min(2).max(3).uppercase(),
  flag: Joi.string().trim(),
  supportedExams: Joi.array().items(Joi.string()),
  languages: Joi.array().items(Joi.string().trim()).min(1),
  currency: Joi.string().trim().max(10),
  timezone: Joi.string().trim().max(50),
  region: Joi.string().valid(
    "North Africa",
    "West Africa",
    "East Africa",
    "Central Africa",
    "Southern Africa"
  ),
  capital: Joi.string().trim().max(100),
  population: Joi.number().integer().min(0),
  educationSystem: Joi.string().valid(
    "French",
    "British",
    "American",
    "Portuguese",
    "Arabic",
    "Mixed"
  ),
  examBoards: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim().max(100),
      description: Joi.string().trim().max(500),
      website: Joi.string().trim().uri(),
    })
  ),
  isActive: Joi.boolean(),
});

const getCountriesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  region: Joi.string()
    .valid(
      "North Africa",
      "West Africa",
      "East Africa",
      "Central Africa",
      "Southern Africa"
    )
    .optional(),
  educationSystem: Joi.string()
    .valid("French", "British", "American", "Portuguese", "Arabic", "Mixed")
    .optional(),
  language: Joi.string().trim().optional(),
  isActive: Joi.boolean().default(true),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string()
    .valid("name", "code", "region", "educationSystem", "createdAt")
    .default("name"),
  sortOrder: Joi.string().valid("asc", "desc").default("asc"),
});

const addExamToCountrySchema = Joi.object({
  examId: Joi.string().required().messages({
    "any.required": "L'ID de l'examen est requis",
  }),
});

module.exports = {
  createCountrySchema,
  updateCountrySchema,
  getCountriesSchema,
  addExamToCountrySchema,
};