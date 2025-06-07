const Joi = require("joi");
const {
  DIFFICULTY_LEVELS,
} = require("../../models/learning/adaptive.learning.model");

const createAdaptiveLearningSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  currentLevel: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .required(),
  series: Joi.array().items(Joi.string().trim()).optional(),
  adjustmentRules: Joi.array()
    .items(
      Joi.object({
        metric: Joi.string()
          .valid("score", "timeSpent", "accuracy", "completionRate")
          .required(),
        threshold: Joi.number().required(),
        action: Joi.string()
          .valid("increaseDifficulty", "decreaseDifficulty", "suggestResource")
          .required(),
        resourceId: Joi.string().hex().length(24).when("action", {
          is: "suggestResource",
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        }),
        value: Joi.number().default(1),
      })
    )
    .optional(),
  recommendedContent: Joi.array()
    .items(
      Joi.object({
        contentType: Joi.string().valid("topic", "quiz", "resource").required(),
        contentId: Joi.string().hex().length(24).required(),
      })
    )
    .optional(),
  progress: Joi.object({
    scores: Joi.array().items(Joi.number().min(0).max(100)).optional(),
    timeSpent: Joi.array().items(Joi.number().min(0)).optional(),
    accuracy: Joi.array().items(Joi.number().min(0).max(100)).optional(),
    completionRate: Joi.array().items(Joi.number().min(0).max(100)).optional(),
  }).optional(),
});

const updateAdaptiveLearningSchema = Joi.object({
  currentLevel: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .optional(),
  series: Joi.array().items(Joi.string().trim()).optional(),
  adjustmentRules: Joi.array()
    .items(
      Joi.object({
        metric: Joi.string()
          .valid("score", "timeSpent", "accuracy", "completionRate")
          .required(),
        threshold: Joi.number().required(),
        action: Joi.string()
          .valid("increaseDifficulty", "decreaseDifficulty", "suggestResource")
          .required(),
        resourceId: Joi.string().hex().length(24).when("action", {
          is: "suggestResource",
          then: Joi.required(),
          otherwise: Joi.forbidden(),
        }),
        value: Joi.number().optional(),
      })
    )
    .optional(),
  recommendedContent: Joi.array()
    .items(
      Joi.object({
        contentType: Joi.string().valid("topic", "quiz", "resource").required(),
        contentId: Joi.string().hex().length(24).required(),
      })
    )
    .optional(),
  progress: Joi.object({
    scores: Joi.array().items(Joi.number().min(0).max(100)).optional(),
    timeSpent: Joi.array().items(Joi.number().min(0)).optional(),
    accuracy: Joi.array().items(Joi.number().min(0).max(100)).optional(),
    completionRate: Joi.array().items(Joi.number().min(0).max(100)).optional(),
  }).optional(),
}).min(1);

const getAdaptiveLearningSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
});

module.exports = {
  createAdaptiveLearningSchema,
  updateAdaptiveLearningSchema,
  getAdaptiveLearningSchema,
};