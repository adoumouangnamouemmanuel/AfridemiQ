const Joi = require("joi");

const createStudyPlanSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  targetExam: Joi.string().hex().length(24).required(),
  targetSeries: Joi.array().items(Joi.string().trim().min(1)).optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  adaptiveLearningId: Joi.string().hex().length(24).optional(),
  dailyGoals: Joi.array()
    .items(
      Joi.object({
        date: Joi.date().required(),
        topics: Joi.array()
          .items(
            Joi.object({
              topicId: Joi.string().hex().length(24).required(),
              duration: Joi.number().min(1).required(),
              priority: Joi.string().valid("high", "medium", "low").required(),
            })
          )
          .required(),
        exercises: Joi.array()
          .items(
            Joi.object({
              exerciseId: Joi.string().hex().length(24).required(),
              count: Joi.number().min(1).required(),
              type: Joi.string().valid("practice", "assessment").required(),
            })
          )
          .required(),
        breaks: Joi.array()
          .items(
            Joi.object({
              startTime: Joi.string()
                .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
                .required(),
              endTime: Joi.string()
                .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
                .required(),
              duration: Joi.number().min(1).required(),
            })
          )
          .required(),
      })
    )
    .required(),
  weeklyReview: Joi.object({
    day: Joi.string()
      .valid(
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      )
      .required(),
    topics: Joi.array().items(Joi.string().hex().length(24)).required(),
    assessmentType: Joi.string()
      .valid("quiz", "mock_exam", "review")
      .required(),
  }).required(),
  progressTracking: Joi.object({
    completedTopics: Joi.array().items(Joi.objectId()).required(),
    weakAreas: Joi.array().items(Joi.objectId()).required(),
    strongAreas: Joi.array().items(Joi.objectId()).required(),
    adjustmentNeeded: Joi.boolean().default(false),
    lastAdjusted: Joi.date().optional(),
  }).required(),
  reminders: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid("study", "practice", "review", "assessment")
          .required(),
        time: Joi.string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
          .required(),
        message: Joi.string().trim().required(),
        repeat: Joi.string().valid("daily", "weekly", "monthly").required(),
        status: Joi.string()
          .valid("active", "inactive")
          .default("active")
          .required(),
      }).required()
    )
    .required(),
});

const updateStudyPlanSchema = createStudyPlanSchema
  .fork(
    [
      "userId",
      "targetExam",
      "targetSeries",
      "startDate",
      "endDate",
      "adaptiveLearningId",
      "dailyGoals",
      "weeklyReview",
      "progressTracking",
      "reminders",
    ],
    (schema) => schema.optional()
  )
  .min(1);

const getStudyPlanSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  targetExam: Joi.string().hex().length(24).optional(),
});

module.exports = {
  createStudyPlanSchema,
  updateStudyPlanSchema,
  getStudyPlanSchema,
};