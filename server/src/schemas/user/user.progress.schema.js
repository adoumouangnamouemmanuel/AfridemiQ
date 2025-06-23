const Joi = require("joi");
const {
  PROGRESS_STATUSES,
  COMPLETION_TYPES,
} = require("../../models/user/user.progress.model");

// Complete lesson schema
const completeLessonSchema = Joi.object({
  score: Joi.number().min(0).max(100).required().messages({
    "number.base": "Le score doit être un nombre",
    "number.min": "Le score ne peut pas être négatif",
    "number.max": "Le score ne peut pas dépasser 100",
    "any.required": "Le score est requis",
  }),
  timeSpent: Joi.number().min(0).required().messages({
    "number.base": "Le temps passé doit être un nombre",
    "number.min": "Le temps passé ne peut pas être négatif",
    "any.required": "Le temps passé est requis",
  }),
  completionType: Joi.string()
    .valid(...COMPLETION_TYPES)
    .default("manual")
    .messages({
      "string.base": "Le type de completion doit être une chaîne de caractères",
      "any.only": `Le type de completion doit être l'un des suivants: ${COMPLETION_TYPES.join(
        ", "
      )}`,
    }),
});

// Update lesson progress schema
const updateLessonProgressSchema = Joi.object({
  status: Joi.string()
    .valid(...PROGRESS_STATUSES)
    .messages({
      "string.base": "Le statut doit être une chaîne de caractères",
      "any.only": `Le statut doit être l'un des suivants: ${PROGRESS_STATUSES.join(
        ", "
      )}`,
    }),
  timeSpent: Joi.number().min(0).messages({
    "number.base": "Le temps passé doit être un nombre",
    "number.min": "Le temps passé ne peut pas être négatif",
  }),
  score: Joi.number().min(0).max(100).messages({
    "number.base": "Le score doit être un nombre",
    "number.min": "Le score ne peut pas être négatif",
    "number.max": "Le score ne peut pas dépasser 100",
  }),
  attempts: Joi.number().integer().min(0).messages({
    "number.base": "Le nombre de tentatives doit être un nombre",
    "number.integer": "Le nombre de tentatives doit être un entier",
    "number.min": "Le nombre de tentatives ne peut pas être négatif",
  }),
  hintsUsed: Joi.number().integer().min(0).messages({
    "number.base": "Le nombre d'indices utilisés doit être un nombre",
    "number.integer": "Le nombre d'indices utilisés doit être un entier",
    "number.min": "Le nombre d'indices utilisés ne peut pas être négatif",
  }),
  bookmarked: Joi.boolean().messages({
    "boolean.base": "Le marquage en favori doit être un booléen",
  }),
  notes: Joi.string().max(1000).messages({
    "string.base": "Les notes doivent être une chaîne de caractères",
    "string.max": "Les notes ne peuvent pas dépasser 1000 caractères",
  }),
});

// Enroll in course schema
const enrollInCourseSchema = Joi.object({
  totalLessons: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Le nombre total de leçons doit être un nombre",
    "number.integer": "Le nombre total de leçons doit être un entier",
    "number.min": "Le nombre total de leçons ne peut pas être négatif",
  }),
});

// Update learning goals schema
const updateLearningGoalsSchema = Joi.object({
  dailyStudyTime: Joi.number().min(1).max(1440).messages({
    "number.base": "Le temps d'étude quotidien doit être un nombre",
    "number.min": "Le temps d'étude quotidien doit être d'au moins 1 minute",
    "number.max":
      "Le temps d'étude quotidien ne peut pas dépasser 24 heures (1440 minutes)",
  }),
  weeklyGoal: Joi.number().min(1).max(100).messages({
    "number.base": "L'objectif hebdomadaire doit être un nombre",
    "number.min": "L'objectif hebdomadaire doit être d'au moins 1 leçon",
    "number.max": "L'objectif hebdomadaire ne peut pas dépasser 100 leçons",
  }),
  targetCompletionDate: Joi.date().min("now").messages({
    "date.base": "La date cible de completion doit être une date valide",
    "date.min": "La date cible de completion ne peut pas être dans le passé",
  }),
  prioritySubjects: Joi.array().items(Joi.string()).max(10).messages({
    "array.base": "Les matières prioritaires doivent être un tableau",
    "string.base":
      "Chaque matière prioritaire doit être une chaîne de caractères",
    "array.max": "Maximum 10 matières prioritaires peuvent être sélectionnées",
  }),
});

// Query parameters schema for getting progress
const getProgressQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "La page doit être un nombre",
    "number.integer": "La page doit être un entier",
    "number.min": "La page doit être au moins 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    "number.base": "La limite doit être un nombre",
    "number.integer": "La limite doit être un entier",
    "number.min": "La limite doit être au moins 1",
    "number.max": "La limite ne peut pas dépasser 100",
  }),
  status: Joi.string()
    .valid(...PROGRESS_STATUSES)
    .messages({
      "string.base": "Le statut doit être une chaîne de caractères",
      "any.only": `Le statut doit être l'un des suivants: ${PROGRESS_STATUSES.join(
        ", "
      )}`,
    }),
});

// Lesson progress filter schema
const lessonProgressFilterSchema = Joi.object({
  status: Joi.string()
    .valid(...PROGRESS_STATUSES)
    .messages({
      "string.base": "Le statut doit être une chaîne de caractères",
      "any.only": `Le statut doit être l'un des suivants: ${PROGRESS_STATUSES.join(
        ", "
      )}`,
    }),
  minScore: Joi.number().min(0).max(100).messages({
    "number.base": "Le score minimum doit être un nombre",
    "number.min": "Le score minimum ne peut pas être négatif",
    "number.max": "Le score minimum ne peut pas dépasser 100",
  }),
  maxScore: Joi.number().min(0).max(100).messages({
    "number.base": "Le score maximum doit être un nombre",
    "number.min": "Le score maximum ne peut pas être négatif",
    "number.max": "Le score maximum ne peut pas dépasser 100",
  }),
  dateFrom: Joi.date().messages({
    "date.base": "La date de début doit être une date valide",
  }),
  dateTo: Joi.date().min(Joi.ref("dateFrom")).messages({
    "date.base": "La date de fin doit être une date valide",
    "date.min": "La date de fin doit être postérieure à la date de début",
  }),
})
  .with("maxScore", "minScore")
  .custom((value, helpers) => {
    if (value.minScore && value.maxScore && value.minScore > value.maxScore) {
      return helpers.error("custom.scoreRange");
    }
    return value;
  })
  .messages({
    "custom.scoreRange":
      "Le score minimum ne peut pas être supérieur au score maximum",
  });

module.exports = {
  completeLessonSchema,
  updateLessonProgressSchema,
  enrollInCourseSchema,
  updateLearningGoalsSchema,
  getProgressQuerySchema,
  lessonProgressFilterSchema,
};
