const Joi = require("joi");
const {
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  EDUCATION_LEVELS,
  EXAM_TYPES,
  STATUSES,
} = require("../../constants");

// =============== CREATE QUESTION SCHEMA ===============
const createQuestionSchema = Joi.object({
  topicId: Joi.objectId().required(),
  subjectId: Joi.objectId().required(),
  creatorId: Joi.objectId().required(),
  series: Joi.array().items(Joi.string().trim().min(1)).optional(),
  level: Joi.string()
    .valid(
      "primary",
      "junior_secondary",
      "senior_secondary",
      "university",
      "professional"
    )
    .required(),
  question: Joi.string().trim().max(2000).required(),
  format: Joi.string()
    .valid(...QUESTION_TYPES)
    .required(),
  options: Joi.array()
    .items(Joi.string())
    .when("format", {
      is: Joi.valid("multiple_choice", "true_false"),
      then: Joi.array().min(2).required(),
      otherwise: Joi.when("format", {
        is: "matching",
        then: Joi.array().custom((value, helpers) => {
          if (value.length % 2 !== 0) {
            return helpers.error("array.length", {
              message: "Matching options must have even length",
            });
          }
          return value;
        }),
      }),
    }),
  correctAnswer: Joi.any().required(),
  explanation: Joi.string().trim().max(1500).required(),
  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .required(),
  points: Joi.number().min(1).max(100).required(),
  timeEstimate: Joi.number().min(10).max(3600).default(120),
  steps: Joi.array().items(Joi.string().max(500)).optional(),
  hints: Joi.array().items(Joi.string().max(500)).optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  relatedQuestions: Joi.array().items(Joi.objectId()).optional(),
  content: Joi.object({
    media: Joi.array()
      .items(
        Joi.object({
          mediaType: Joi.string().valid(...MEDIA_TYPES),
          url: Joi.string().uri(),
          altText: Joi.string().optional(),
          caption: Joi.string().optional(),
          size: Joi.number().optional(),
          duration: Joi.number().optional(),
        })
      )
      .optional(),
    formatting: Joi.object({
      hasLatex: Joi.boolean().default(false),
      hasCode: Joi.boolean().default(false),
      hasTable: Joi.boolean().default(false),
    }).optional(),
    accessibility: Joi.object({
      hasAudioVersion: Joi.boolean().default(false),
      hasBrailleVersion: Joi.boolean().default(false),
      hasSignLanguageVideo: Joi.boolean().default(false),
      screenReaderFriendly: Joi.boolean().default(true),
    }).optional(),
  }).optional(),
  validation: Joi.object({
    isVerified: Joi.boolean().default(false),
    verifiedBy: Joi.objectId().optional(),
    verifiedAt: Joi.date().optional(),
    qualityScore: Joi.number().min(0).max(10).optional(),
    feedback: Joi.array().items(Joi.string().max(500)).optional(),
  }).optional(),
  usage: Joi.object({
    assessmentCount: Joi.number().default(0),
    lastUsed: Joi.date().optional(),
    popularityScore: Joi.number().default(0),
  }).optional(),
  status: Joi.string()
    .valid("draft", "review", "approved", "rejected", "archived")
    .default("draft"),
  premiumOnly: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
});

const updateQuestionSchema = createQuestionSchema
  .fork(
    [
      "topicId",
      "subjectId",
      "creatorId",
      "series",
      "level",
      "question",
      "format",
      "options",
      "correctAnswer",
      "explanation",
      "difficulty",
      "points",
      "timeEstimate",
      "steps",
      "hints",
      "tags",
      "relatedQuestions",
      "content",
      "validation",
      "usage",
      "status",
      "premiumOnly",
      "isActive",
    ],
    (schema) => schema.optional()
  )
  .min(1);

const getQuestionSchema = Joi.object({
  topicId: Joi.objectId().optional(),
  subjectId: Joi.objectId().optional(),
  creatorId: Joi.objectId().optional(),
  series: Joi.string().optional(),
  level: Joi.string()
    .valid(
      "primary",
      "junior_secondary",
      "senior_secondary",
      "university",
      "professional"
    )
    .optional(),
  format: Joi.string()
    .valid(...QUESTION_TYPES)
    .optional(),
  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .optional(),
  status: Joi.string()
    .valid("draft", "review", "approved", "rejected", "archived")
    .optional(),
  premiumOnly: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  getQuestionSchema,
};
