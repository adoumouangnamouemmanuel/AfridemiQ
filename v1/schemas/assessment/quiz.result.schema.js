const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const feedbackSchema = Joi.object({
  userId: Joi.objectId().required(),
  rating: Joi.number().min(0).max(10).required(),
  comments: Joi.string().max(1000).optional(),
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
