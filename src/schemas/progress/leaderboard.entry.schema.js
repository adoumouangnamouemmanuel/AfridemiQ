const Joi = require("joi");

const updateRankSchema = Joi.object({
  nationalRank: Joi.number().min(1).optional(),
  regionalRank: Joi.number().min(1).optional(),
  globalRank: Joi.number().min(1).optional(),
  badgeCount: Joi.number().min(0).optional(),
  streak: Joi.number().min(0).optional(),
  totalPoints: Joi.number().min(0).optional(),
})
  .min(1)
  .messages({
    "object.min": "Au moins un champ doit être fourni pour la mise à jour",
    "number.base": "La valeur doit être un nombre",
    "number.min": "La valeur doit être positive",
  });

module.exports = {
  updateRankSchema,
};