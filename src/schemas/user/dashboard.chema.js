const Joi = require("joi");

const updateUpcomingExamsSchema = Joi.object({
  exams: Joi.array()
    .items(
      Joi.object({
        examId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            "string.pattern.base": "ID d'examen invalide",
            "any.required": "L'ID de l'examen est requis",
          }),
        series: Joi.array().items(Joi.string()).messages({
          "array.base": "Les séries doivent être un tableau",
        }),
        date: Joi.date().required().messages({
          "date.base": "Date invalide",
          "any.required": "La date est requise",
        }),
      })
    )
    .required()
    .messages({
      "array.base": "Les examens doivent être un tableau",
      "any.required": "Les examens sont requis",
    }),
});

const addRecentQuizSchema = Joi.object({
  quizId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "ID de quiz invalide",
      "any.required": "L'ID du quiz est requis",
    }),
  score: Joi.number().min(0).max(100).required().messages({
    "number.min": "Le score ne peut pas être négatif",
    "number.max": "Le score ne peut pas dépasser 100",
    "any.required": "Le score est requis",
  }),
  completedAt: Joi.date().default(Date.now).messages({
    "date.base": "Date de completion invalide",
  }),
});

const updateRecommendedTopicsSchema = Joi.object({
  topicIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.pattern.base": "ID de sujet invalide",
        })
    )
    .required()
    .messages({
      "array.base": "Les sujets recommandés doivent être un tableau",
      "any.required": "Les sujets recommandés sont requis",
    }),
});

const updateStreakSchema = Joi.object({
  streak: Joi.number().min(0).required().messages({
    "number.min": "La série ne peut pas être négative",
    "any.required": "La série est requise",
  }),
});

const addNotificationSchema = Joi.object({
  notificationId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "ID de notification invalide",
      "any.required": "L'ID de la notification est requis",
    }),
});

module.exports = {
  updateUpcomingExamsSchema,
  addRecentQuizSchema,
  updateRecommendedTopicsSchema,
  updateStreakSchema,
  addNotificationSchema,
};