const Joi = require("joi");

const createNotificationSchema = Joi.object({
  userId: Joi.string().required().messages({
    "string.base": "L'ID utilisateur doit être une chaîne",
    "any.required": "L'ID utilisateur est requis",
  }),
  type: Joi.string()
    .valid("reminder", "achievement", "study_group", "system")
    .required()
    .messages({
      "any.only":
        "Le type doit être reminder, achievement, study_group ou system",
      "any.required": "Le type est requis",
    }),
  title: Joi.string().min(1).max(200).required().messages({
    "string.base": "Le titre doit être une chaîne",
    "string.min": "Le titre ne peut pas être vide",
    "string.max": "Le titre ne peut pas dépasser 200 caractères",
    "any.required": "Le titre est requis",
  }),
  message: Joi.string().min(1).max(1000).required().messages({
    "string.base": "Le message doit être une chaîne",
    "string.min": "Le message ne peut pas être vide",
    "string.max": "Le message ne peut pas dépasser 1000 caractères",
    "any.required": "Le message est requis",
  }),
  priority: Joi.string().valid("low", "medium", "high").optional().messages({
    "any.only": "La priorité doit être low, medium ou high",
  }),
  actionUrl: Joi.string().uri().optional().messages({
    "string.base": "L'URL d'action doit être une chaîne",
    "string.uri": "L'URL d'action doit être une URL valide",
  }),
  expiresAt: Joi.date().greater("now").optional().messages({
    "date.base": "La date d'expiration doit être une date",
    "date.greater": "La date d'expiration doit être dans le futur",
  }),
  metadata: Joi.object({
    relatedEntityId: Joi.string().optional(),
    relatedEntityType: Joi.string().optional(),
  }).optional(),
});

const sendBulkNotificationSchema = Joi.object({
  userIds: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.base": "Les IDs utilisateur doivent être un tableau",
    "array.min": "Au moins un ID utilisateur est requis",
    "string.base": "Chaque ID utilisateur doit être une chaîne",
    "any.required": "Les IDs utilisateur sont requis",
  }),
  type: Joi.string()
    .valid("reminder", "achievement", "study_group", "system")
    .required()
    .messages({
      "any.only":
        "Le type doit être reminder, achievement, study_group ou system",
      "any.required": "Le type est requis",
    }),
  title: Joi.string().min(1).max(200).required().messages({
    "string.base": "Le titre doit être une chaîne",
    "string.min": "Le titre ne peut pas être vide",
    "string.max": "Le titre ne peut pas dépasser 200 caractères",
    "any.required": "Le titre est requis",
  }),
  message: Joi.string().min(1).max(1000).required().messages({
    "string.base": "Le message doit être une chaîne",
    "string.min": "Le message ne peut pas être vide",
    "string.max": "Le message ne peut pas dépasser 1000 caractères",
    "any.required": "Le message est requis",
  }),
  priority: Joi.string().valid("low", "medium", "high").optional().messages({
    "any.only": "La priorité doit être low, medium ou high",
  }),
  actionUrl: Joi.string().uri().optional().messages({
    "string.base": "L'URL d'action doit être une chaîne",
    "string.uri": "L'URL d'action doit être une URL valide",
  }),
  expiresAt: Joi.date().greater("now").optional().messages({
    "date.base": "La date d'expiration doit être une date",
    "date.greater": "La date d'expiration doit être dans le futur",
  }),
  metadata: Joi.object({
    relatedEntityId: Joi.string().optional(),
    relatedEntityType: Joi.string().optional(),
  }).optional(),
});

module.exports = {
  createNotificationSchema,
  sendBulkNotificationSchema,
};