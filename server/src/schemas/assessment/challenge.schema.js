const Joi = require("joi");

// Create challenge schema
const createChallengeSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(1000).required(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  topicId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  level: Joi.string()
    .valid("Primary", "JSS", "SSS", "University", "Professional")
    .required(),
  difficulty: Joi.string().valid("Easy", "Medium", "Hard").required(),
  series: Joi.array().items(Joi.string()).optional(),
  questionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required(),
  timeLimit: Joi.number().min(1).max(480).required(),
  maxParticipants: Joi.number().min(2).max(1000).default(100),
  prizes: Joi.array()
    .items(
      Joi.object({
        rank: Joi.number().min(1).required(),
        description: Joi.string().optional(),
        points: Joi.number().min(0).optional(),
        badge: Joi.string().optional(),
      })
    )
    .optional(),
  rules: Joi.object({
    allowMultipleAttempts: Joi.boolean().default(false),
    showLeaderboard: Joi.boolean().default(true),
    shuffleQuestions: Joi.boolean().default(true),
    preventCheating: Joi.boolean().default(true),
  }).optional(),
  scheduling: Joi.object({
    startDate: Joi.date().greater("now").required(),
    endDate: Joi.date().greater(Joi.ref("startDate")).required(),
    timezone: Joi.string().default("Africa/Lagos"),
    registrationDeadline: Joi.date().less(Joi.ref("startDate")).optional(),
  }).required(),
  tags: Joi.array().items(Joi.string()).optional(),
  premiumOnly: Joi.boolean().default(false),
});

// Update challenge schema
const updateChallengeSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(1000).optional(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  topicId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  level: Joi.string()
    .valid("Primary", "JSS", "SSS", "University", "Professional")
    .optional(),
  difficulty: Joi.string().valid("Easy", "Medium", "Hard").optional(),
  series: Joi.array().items(Joi.string()).optional(),
  questionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .optional(),
  timeLimit: Joi.number().min(1).max(480).optional(),
  maxParticipants: Joi.number().min(2).max(1000).optional(),
  prizes: Joi.array()
    .items(
      Joi.object({
        rank: Joi.number().min(1).required(),
        description: Joi.string().optional(),
        points: Joi.number().min(0).optional(),
        badge: Joi.string().optional(),
      })
    )
    .optional(),
  rules: Joi.object({
    allowMultipleAttempts: Joi.boolean(),
    showLeaderboard: Joi.boolean(),
    shuffleQuestions: Joi.boolean(),
    preventCheating: Joi.boolean(),
  }).optional(),
  scheduling: Joi.object({
    startDate: Joi.date().greater("now").optional(),
    endDate: Joi.date().greater(Joi.ref("startDate")).optional(),
    timezone: Joi.string().optional(),
    registrationDeadline: Joi.date().less(Joi.ref("startDate")).optional(),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  premiumOnly: Joi.boolean().optional(),
});

// Get challenges schema
const getChallengesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("createdAt", "title", "scheduling.startDate")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  search: Joi.string().trim().optional(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  topicId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  level: Joi.string()
    .valid("Primary", "JSS", "SSS", "University", "Professional")
    .optional(),
  difficulty: Joi.string().valid("Easy", "Medium", "Hard").optional(),
  status: Joi.string()
    .valid("draft", "open", "active", "completed", "cancelled")
    .optional(),
  creatorId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  premiumOnly: Joi.boolean().optional(),
});

// Submit challenge result schema
const submitChallengeResultSchema = Joi.object({
  score: Joi.number().min(0).required(),
  timeSpent: Joi.number().min(0).required(),
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required(),
        answer: Joi.alternatives()
          .try(Joi.string(), Joi.number(), Joi.array())
          .required(),
        timeSpent: Joi.number().min(0).optional(),
      })
    )
    .optional(),
});

module.exports = {
  createChallengeSchema,
  updateChallengeSchema,
  getChallengesSchema,
  submitChallengeResultSchema,
};