const Joi = require("joi");

const createAchievementSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Le nom de l'achievement est requis",
    "any.required": "Le nom de l'achievement est requis",
  }),
  description: Joi.string().required().messages({
    "string.empty": "La description est requise",
    "any.required": "La description est requise",
  }),
  icon: Joi.string().required().messages({
    "string.empty": "L'icône est requise",
    "any.required": "L'icône est requise",
  }),
  color: Joi.string().required().messages({
    "string.empty": "La couleur est requise",
    "any.required": "La couleur est requise",
  }),
  target: Joi.number().positive().required().messages({
    "number.positive": "L'objectif doit être un nombre positif",
    "any.required": "L'objectif est requis",
  }),
  progress: Joi.number().min(0).default(0).messages({
    "number.min": "Le progrès ne peut pas être négatif",
  }),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      "string.pattern.base": "ID de matière invalide",
    }),
  series: Joi.string().allow("").messages({
    "string.base": "La série doit être une chaîne de caractères",
  }),
});

const updateProgressSchema = Joi.object({
  progress: Joi.number().min(0).required().messages({
    "number.min": "Le progrès ne peut pas être négatif",
    "any.required": "Le progrès est requis",
  }),
});

const updateAchievementSchema = Joi.object({
  name: Joi.string().messages({
    "string.empty": "Le nom ne peut pas être vide",
  }),
  description: Joi.string().messages({
    "string.empty": "La description ne peut pas être vide",
  }),
  icon: Joi.string().messages({
    "string.empty": "L'icône ne peut pas être vide",
  }),
  color: Joi.string().messages({
    "string.empty": "La couleur ne peut pas être vide",
  }),
  target: Joi.number().positive().messages({
    "number.positive": "L'objectif doit être un nombre positif",
  }),
  progress: Joi.number().min(0).messages({
    "number.min": "Le progrès ne peut pas être négatif",
  }),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      "string.pattern.base": "ID de matière invalide",
    }),
  series: Joi.string().allow("").messages({
    "string.base": "La série doit être une chaîne de caractères",
  }),
});

module.exports = {
  createAchievementSchema,
  updateProgressSchema,
  updateAchievementSchema,
};