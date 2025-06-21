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

const createQuizResultSchema = Joi.object({
  userId: Joi.objectId().required(),
  quizId: Joi.objectId().required(),
  series: Joi.array().items(Joi.string().trim().min(1)).optional(),
  questionIds: Joi.array().items(Joi.objectId()).optional(),
  correctCount: Joi.number().min(0).required(),
  score: Joi.number().min(0).required(),
  timeTaken: Joi.number().min(0).required(),
  completedAt: Joi.date().default(Date.now),
  hintUsages: Joi.array().items(Joi.objectId()).optional(),
  questionFeedback: Joi.array().items(feedbackSchema).max(100).optional(),
  feedback: Joi.object({
    title: Joi.string().trim().optional(),
    subtitle: Joi.string().trim().optional(),
    color: Joi.string().trim().optional(),
    emoji: Joi.string().trim().optional(),
    message: Joi.string().trim().max(1000).optional(),
  }).optional(),
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
