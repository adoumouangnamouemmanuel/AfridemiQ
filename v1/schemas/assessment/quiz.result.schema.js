const Joi = require("joi");

// =============== ANSWER SCHEMA ===============
const answerSchema = Joi.object({
  questionId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "L'ID de la question est requis",
      "string.pattern.base": "ID de question invalide",
    }),

  selectedAnswer: Joi.alternatives()
    .try(Joi.string(), Joi.number(), Joi.boolean())
    .required()
    .messages({
      "any.required": "La réponse sélectionnée est requise",
    }),

  correctAnswer: Joi.alternatives()
    .try(Joi.string(), Joi.number(), Joi.boolean())
    .required()
    .messages({
      "any.required": "La réponse correcte est requise",
    }),

  isCorrect: Joi.boolean().required().messages({
    "any.required": "Le statut de correction est requis",
  }),

  timeSpent: Joi.number().min(0).optional().default(0).messages({
    "number.min": "Le temps ne peut pas être négatif",
  }),
});

// =============== CREATE QUIZ RESULT SCHEMA ===============
const createQuizResultSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "L'ID de l'utilisateur est requis",
      "string.pattern.base": "ID d'utilisateur invalide",
    }),

  quizId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "L'ID du quiz est requis",
      "string.pattern.base": "ID de quiz invalide",
    }),

  score: Joi.number().min(0).max(100).required().messages({
    "any.required": "Le score est requis",
    "number.min": "Le score ne peut pas être négatif",
    "number.max": "Le score ne peut pas dépasser 100",
  }),

  totalQuestions: Joi.number().min(1).required().messages({
    "any.required": "Le nombre total de questions est requis",
    "number.min": "Au moins une question est requise",
  }),

  correctAnswers: Joi.number().min(0).required().messages({
    "any.required": "Le nombre de bonnes réponses est requis",
    "number.min": "Le nombre ne peut pas être négatif",
  }),

  incorrectAnswers: Joi.number().min(0).required().messages({
    "any.required": "Le nombre de mauvaises réponses est requis",
    "number.min": "Le nombre ne peut pas être négatif",
  }),

  totalTimeSpent: Joi.number().min(0).required().messages({
    "any.required": "Le temps passé est requis",
    "number.min": "Le temps ne peut pas être négatif",
  }),

  startedAt: Joi.date().required().messages({
    "any.required": "L'heure de début est requise",
  }),

  completedAt: Joi.date().required().greater(Joi.ref("startedAt")).messages({
    "any.required": "L'heure de fin est requise",
    "date.greater": "L'heure de fin doit être après l'heure de début",
  }),

  answers: Joi.array().items(answerSchema).min(1).required().messages({
    "any.required": "Les réponses sont requises",
    "array.min": "Au moins une réponse est requise",
  }),

  isPassed: Joi.boolean().required().messages({
    "any.required": "Le statut de réussite est requis",
  }),

  attemptNumber: Joi.number().min(1).optional().default(1).messages({
    "number.min": "Le numéro de tentative doit être positif",
  }),

  submissionMethod: Joi.string()
    .valid("submitted", "time_expired", "auto_submit")
    .optional()
    .default("submitted")
    .messages({
      "any.only": "Méthode de soumission invalide",
    }),
});

// =============== UPDATE QUIZ RESULT SCHEMA ===============
const updateQuizResultSchema = Joi.object({
  score: Joi.number().min(0).max(100).optional(),
  totalQuestions: Joi.number().min(1).optional(),
  correctAnswers: Joi.number().min(0).optional(),
  incorrectAnswers: Joi.number().min(0).optional(),
  totalTimeSpent: Joi.number().min(0).optional(),
  startedAt: Joi.date().optional(),
  completedAt: Joi.date().optional(),
  answers: Joi.array().items(answerSchema).min(1).optional(),
  isPassed: Joi.boolean().optional(),
  attemptNumber: Joi.number().min(1).optional(),
  submissionMethod: Joi.string()
    .valid("submitted", "time_expired", "auto_submit")
    .optional(),
});

const updateQuizResultSchema = createQuizResultSchema
  .fork(
    [
      "userId",
      "quizId",
      "series",
      "questionIds",
      "correctCount",
      "score",
      "timeTaken",
      "completedAt",
      "hintUsages",
      "questionFeedback",
      "feedback",
    ],
    (schema) => schema.optional()
  )
  .min(1);

const getQuizResultSchema = Joi.object({
  userId: Joi.objectId().optional(),
  quizId: Joi.objectId().optional(),
});

module.exports = {
  createQuizResultSchema,
  updateQuizResultSchema,
  getQuizResultSchema,
};
