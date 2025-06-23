const Joi = require("joi");

// Add daily stats schema
const addDailyStatsSchema = Joi.object({
  studyTime: Joi.number().min(0).max(1440).required().messages({
    "number.base": "Le temps d'étude doit être un nombre",
    "number.min": "Le temps d'étude ne peut pas être négatif",
    "number.max":
      "Le temps d'étude ne peut pas dépasser 24 heures (1440 minutes)",
    "any.required": "Le temps d'étude est requis",
  }),
  questionsAnswered: Joi.number().integer().min(0).required().messages({
    "number.base": "Le nombre de questions répondues doit être un nombre",
    "number.integer": "Le nombre de questions répondues doit être un entier",
    "number.min": "Le nombre de questions répondues ne peut pas être négatif",
    "any.required": "Le nombre de questions répondues est requis",
  }),
  correctAnswers: Joi.number().integer().min(0).required().messages({
    "number.base": "Le nombre de bonnes réponses doit être un nombre",
    "number.integer": "Le nombre de bonnes réponses doit être un entier",
    "number.min": "Le nombre de bonnes réponses ne peut pas être négatif",
    "any.required": "Le nombre de bonnes réponses est requis",
  }),
  topicsCovered: Joi.array().items(Joi.string()).default([]).messages({
    "array.base": "Les sujets couverts doivent être un tableau",
    "string.base": "Chaque sujet doit être une chaîne de caractères",
  }),
})
  .custom((value, helpers) => {
    if (value.correctAnswers > value.questionsAnswered) {
      return helpers.error("custom.correctAnswersExceedsTotal");
    }
    return value;
  })
  .messages({
    "custom.correctAnswersExceedsTotal":
      "Le nombre de bonnes réponses ne peut pas dépasser le nombre total de questions",
  });

// Update subject stats schema
const updateSubjectStatsSchema = Joi.object({
  series: Joi.string().required().messages({
    "string.base": "La série doit être une chaîne de caractères",
    "any.required": "La série est requise",
  }),
  averageScore: Joi.number().min(0).max(100).required().messages({
    "number.base": "Le score moyen doit être un nombre",
    "number.min": "Le score moyen ne peut pas être négatif",
    "number.max": "Le score moyen ne peut pas dépasser 100",
    "any.required": "Le score moyen est requis",
  }),
  timeSpent: Joi.number().min(0).default(0).messages({
    "number.base": "Le temps passé doit être un nombre",
    "number.min": "Le temps passé ne peut pas être négatif",
  }),
});

// Update learning patterns schema
const updateLearningPatternsSchema = Joi.object({
  preferredStudyTime: Joi.string()
    .valid("morning", "afternoon", "evening", "night", "")
    .messages({
      "string.base":
        "L'heure d'étude préférée doit être une chaîne de caractères",
      "any.only":
        "L'heure d'étude préférée doit être: morning, afternoon, evening, night ou vide",
    }),
  mostProductiveDays: Joi.array()
    .items(
      Joi.string().valid(
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
      )
    )
    .max(7)
    .messages({
      "array.base": "Les jours les plus productifs doivent être un tableau",
      "array.max": "Maximum 7 jours peuvent être sélectionnés",
      "string.base": "Chaque jour doit être une chaîne de caractères",
      "any.only":
        "Les jours doivent être: monday, tuesday, wednesday, thursday, friday, saturday, sunday",
    }),
  averageSessionLength: Joi.number().min(0).max(480).messages({
    "number.base": "La durée moyenne de session doit être un nombre",
    "number.min": "La durée moyenne de session ne peut pas être négative",
    "number.max":
      "La durée moyenne de session ne peut pas dépasser 8 heures (480 minutes)",
  }),
});

// Update mastery schema
const updateMasterySchema = Joi.object({
  series: Joi.string().required().messages({
    "string.base": "La série doit être une chaîne de caractères",
    "any.required": "La série est requise",
  }),
  masteryLevel: Joi.number().min(0).max(100).required().messages({
    "number.base": "Le niveau de maîtrise doit être un nombre",
    "number.min": "Le niveau de maîtrise ne peut pas être négatif",
    "number.max": "Le niveau de maîtrise ne peut pas dépasser 100",
    "any.required": "Le niveau de maîtrise est requis",
  }),
  improvementRate: Joi.number().min(-100).max(100).default(0).messages({
    "number.base": "Le taux d'amélioration doit être un nombre",
    "number.min": "Le taux d'amélioration ne peut pas être inférieur à -100",
    "number.max": "Le taux d'amélioration ne peut pas dépasser 100",
  }),
});

// Update efficiency schema
const updateEfficiencySchema = Joi.object({
  averageResponseTime: Joi.number().min(0).max(300).messages({
    "number.base": "Le temps de réponse moyen doit être un nombre",
    "number.min": "Le temps de réponse moyen ne peut pas être négatif",
    "number.max":
      "Le temps de réponse moyen ne peut pas dépasser 5 minutes (300 secondes)",
  }),
  accuracyRate: Joi.number().min(0).max(100).messages({
    "number.base": "Le taux de précision doit être un nombre",
    "number.min": "Le taux de précision ne peut pas être négatif",
    "number.max": "Le taux de précision ne peut pas dépasser 100",
  }),
  timeSpentPerTopic: Joi.number().min(0).max(120).messages({
    "number.base": "Le temps passé par sujet doit être un nombre",
    "number.min": "Le temps passé par sujet ne peut pas être négatif",
    "number.max":
      "Le temps passé par sujet ne peut pas dépasser 2 heures (120 minutes)",
  }),
});

module.exports = {
  addDailyStatsSchema,
  updateSubjectStatsSchema,
  updateLearningPatternsSchema,
  updateMasterySchema,
  updateEfficiencySchema,
};
