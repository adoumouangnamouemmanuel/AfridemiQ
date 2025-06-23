const Joi = require("joi");

const createFeedbackLoopSchema = Joi.object({
  type: Joi.string()
    .valid("question", "exercise", "lesson", "platform")
    .required()
    .messages({
      "any.only": "Le type doit être question, exercise, lesson ou platform",
      "any.required": "Le type est requis",
    }),
  rating: Joi.number().min(0).max(10).required().messages({
    "number.base": "La note doit être un nombre",
    "number.min": "La note doit être au moins 0",
    "number.max": "La note ne peut pas dépasser 10",
    "any.required": "La note est requise",
  }),
  comments: Joi.string().max(1000).optional().messages({
    "string.base": "Les commentaires doivent être une chaîne",
    "string.max": "Les commentaires ne peuvent pas dépasser 1000 caractères",
  }),
  attachments: Joi.array().items(Joi.string()).optional().messages({
    "array.base": "Les pièces jointes doivent être un tableau",
    "string.base": "Chaque pièce jointe doit être une chaîne",
  }),
});

const addFeedbackSchema = Joi.object({
  rating: Joi.number().min(0).max(10).required().messages({
    "number.base": "La note doit être un nombre",
    "number.min": "La note doit être au moins 0",
    "number.max": "La note ne peut pas dépasser 10",
    "any.required": "La note est requise",
  }),
  comments: Joi.string().max(1000).optional().messages({
    "string.base": "Les commentaires doivent être une chaîne",
    "string.max": "Les commentaires ne peuvent pas dépasser 1000 caractères",
  }),
});

const respondToFeedbackSchema = Joi.object({
  message: Joi.string().min(1).max(2000).required().messages({
    "string.base": "Le message doit être une chaîne",
    "string.min": "Le message ne peut pas être vide",
    "string.max": "Le message ne peut pas dépasser 2000 caractères",
    "any.required": "Le message est requis",
  }),
  status: Joi.string()
    .valid("pending", "reviewed", "resolved")
    .optional()
    .messages({
      "any.only": "Le statut doit être pending, reviewed ou resolved",
    }),
});

const updateFeedbackStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "reviewed", "resolved")
    .required()
    .messages({
      "any.only": "Le statut doit être pending, reviewed ou resolved",
      "any.required": "Le statut est requis",
    }),
});

module.exports = {
  createFeedbackLoopSchema,
  addFeedbackSchema,
  respondToFeedbackSchema,
  updateFeedbackStatusSchema,
};