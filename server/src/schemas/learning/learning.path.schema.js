const Joi = require("joi");
const {
  DIFFICULTY_LEVELS,
} = require("../../constants/index");

const createLearningPathSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  targetExam: Joi.string().hex().length(24).required(),
  targetSeries: Joi.array().items(Joi.string().trim().min(1)).optional(),
  duration: Joi.number().min(1).required(),
  levels: Joi.array()
    .items(
      Joi.object({
        level: Joi.number().min(1).required(),
        name: Joi.string().trim().required(),
        description: Joi.string().trim().optional(),
        difficulty: Joi.string()
          .valid(...DIFFICULTY_LEVELS)
          .required(),
        modules: Joi.array().items(Joi.string().hex().length(24)).optional(),
        prerequisites: Joi.array()
          .items(Joi.string().hex().length(24))
          .optional(),
        expectedOutcomes: Joi.array().items(Joi.string().trim()).optional(),
      })
    )
    .optional(),
  milestones: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().required(),
        description: Joi.string().trim().optional(),
        requiredAchievements: Joi.array().items(Joi.string().trim()).optional(),
        reward: Joi.object({
          type: Joi.string().valid("badge", "certificate", "points").required(),
          name: Joi.string().when("type", {
            is: Joi.valid("badge", "certificate"),
            then: Joi.required(),
          }),
          points: Joi.number().when("type", {
            is: "points",
            then: Joi.required(),
          }),
        }).required(),
      })
    )
    .optional(),
  adaptiveLearning: Joi.object({
    difficultyAdjustment: Joi.boolean().default(false),
    personalizedPacing: Joi.boolean().default(false),
    adaptiveLearningId: Joi.string().hex().length(24).optional(),
    remediationPaths: Joi.array()
      .items(
        Joi.object({
          topicId: Joi.string().hex().length(24).optional(),
          alternativeResources: Joi.array()
            .items(Joi.string().hex().length(24))
            .optional(),
          practiceExercises: Joi.array()
            .items(Joi.string().hex().length(24))
            .optional(),
        })
      )
      .optional(),
  }).optional(),
});

const updateLearningPathSchema = createLearningPathSchema
  .fork(["name", "description", "targetExam", "duration"], (schema) =>
    schema.optional()
  )
  .min(1);

const getLearningPathSchema = Joi.object({
  targetExam: Joi.string().hex().length(24).optional(),
  targetSeries: Joi.string().trim().optional(),
});

module.exports = {
  createLearningPathSchema,
  updateLearningPathSchema,
  getLearningPathSchema,
};