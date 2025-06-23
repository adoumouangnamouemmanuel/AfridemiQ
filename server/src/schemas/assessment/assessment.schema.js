const Joi = require("joi");

// Create assessment schema
const createAssessmentSchema = Joi.object({
  format: Joi.string()
    .valid("quiz", "exam", "project", "practice", "mock")
    .required(),
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(1000).required(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  topicIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
  questionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required(),
  passingScore: Joi.number().min(0).max(100).required(),
  timeLimit: Joi.number().min(1).max(480).optional(),
  attempts: Joi.number().min(1).max(10).default(3),
  difficulty: Joi.string()
    .valid("Easy", "Medium", "Hard", "Mixed")
    .default("Medium"),
  series: Joi.array().items(Joi.string()).optional(),
  level: Joi.string()
    .valid("Primary", "JSS", "SSS", "University", "Professional")
    .required(),
  feedback: Joi.object({
    immediate: Joi.boolean().default(true),
    detailed: Joi.boolean().default(true),
    solutions: Joi.boolean().default(true),
    showCorrectAnswers: Joi.boolean().default(true),
  }).optional(),
  settings: Joi.object({
    shuffleQuestions: Joi.boolean().default(false),
    shuffleOptions: Joi.boolean().default(false),
    allowReview: Joi.boolean().default(true),
    showProgress: Joi.boolean().default(true),
    preventCheating: Joi.boolean().default(false),
  }).optional(),
  scheduling: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().greater(Joi.ref("startDate")).optional(),
    timezone: Joi.string().default("Africa/Lagos"),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string()
    .valid("draft", "published", "archived", "scheduled")
    .default("draft"),
  premiumOnly: Joi.boolean().default(false),
});

// Update assessment schema
const updateAssessmentSchema = Joi.object({
  format: Joi.string()
    .valid("quiz", "exam", "project", "practice", "mock")
    .optional(),
  title: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(1000).optional(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  topicIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
  questionIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .optional(),
  passingScore: Joi.number().min(0).max(100).optional(),
  timeLimit: Joi.number().min(1).max(480).optional(),
  attempts: Joi.number().min(1).max(10).optional(),
  difficulty: Joi.string().valid("Easy", "Medium", "Hard", "Mixed").optional(),
  series: Joi.array().items(Joi.string()).optional(),
  level: Joi.string()
    .valid("Primary", "JSS", "SSS", "University", "Professional")
    .optional(),
  feedback: Joi.object({
    immediate: Joi.boolean(),
    detailed: Joi.boolean(),
    solutions: Joi.boolean(),
    showCorrectAnswers: Joi.boolean(),
  }).optional(),
  settings: Joi.object({
    shuffleQuestions: Joi.boolean(),
    shuffleOptions: Joi.boolean(),
    allowReview: Joi.boolean(),
    showProgress: Joi.boolean(),
    preventCheating: Joi.boolean(),
  }).optional(),
  scheduling: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().greater(Joi.ref("startDate")).optional(),
    timezone: Joi.string(),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string()
    .valid("draft", "published", "archived", "scheduled")
    .optional(),
  premiumOnly: Joi.boolean().optional(),
});

// Get assessments schema
const getAssessmentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("createdAt", "title", "passingScore", "totalMarks")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  search: Joi.string().trim().optional(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  level: Joi.string()
    .valid("Primary", "JSS", "SSS", "University", "Professional")
    .optional(),
  format: Joi.string()
    .valid("quiz", "exam", "project", "practice", "mock")
    .optional(),
  difficulty: Joi.string().valid("Easy", "Medium", "Hard", "Mixed").optional(),
  status: Joi.string()
    .valid("draft", "published", "archived", "scheduled")
    .optional(),
  premiumOnly: Joi.boolean().optional(),
  creatorId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

// Bulk update assessments schema
const bulkUpdateAssessmentsSchema = Joi.object({
  assessmentIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required(),
  updateData: Joi.object({
    status: Joi.string()
      .valid("draft", "published", "archived", "scheduled")
      .optional(),
    premiumOnly: Joi.boolean().optional(),
    difficulty: Joi.string()
      .valid("Easy", "Medium", "Hard", "Mixed")
      .optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  })
    .min(1)
    .required(),
});

// Bulk delete assessments schema
const bulkDeleteAssessmentsSchema = Joi.object({
  assessmentIds: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .required(),
});

module.exports = {
  createAssessmentSchema,
  updateAssessmentSchema,
  getAssessmentsSchema,
  bulkUpdateAssessmentsSchema,
  bulkDeleteAssessmentsSchema,
};