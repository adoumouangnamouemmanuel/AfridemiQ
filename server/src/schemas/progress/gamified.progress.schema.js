const Joi = require("joi");

const updateMilestoneSchema = Joi.object({
  currentValue: Joi.number().min(0).required().messages({
    "number.base": "La valeur actuelle doit être un nombre",
    "number.min": "La valeur actuelle doit être positive",
    "any.required": "La valeur actuelle est requise",
  }),
});

module.exports = {
  updateMilestoneSchema,
};