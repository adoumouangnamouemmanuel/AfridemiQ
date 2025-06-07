const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const createStudyPlanSchema = Joi.object({
  userId: Joi.objectId().required(),
  targetExam: Joi.objectId().required(),
  targetSeries: Joi.array().items(Joi.string().trim().min(1)).optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  adaptiveLearningId: Joi.objectId().optional(),
  dailyGoals: Joi.array()
    .items(
      Joi.object({
        date: Joi.date().required(),
        topics: Joi.array()
          .items(
            Joi.object({
              topicId: Joi.objectId().required(),
              duration: Joi.number().min(1).required(),
              priority: Joi.string().valid("high", "medium", "low").required(),
            })
          )
          .optional(),
        exercises: Joi.array()
          .items(
            Joi.object({
              exerciseId: Joi.objectId().required(),
              count: Joi.number().min(1).required(),
              type: Joi.string().valid("practice", "assessment").required(),
            })
          )
          .optional(),
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
          .optional(),
      })
    )
    .optional(),
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
    topics: Joi.array().items(Joi.objectId()).optional(),
    assessmentType: Joi.string()
      .valid("quiz", "mock_exam", "review")
      .required(),
  }).required(),
  progressTracking: Joi.object({
    completedTopics: Joi.array().items(Joi.objectId()).optional(),
    weakAreas: Joi.array().items(Joi.objectId()).optional(),
    strongAreas: Joi.array().items(Joi.objectId()).optional(),
    adjustmentNeeded: Joi.boolean().default(false),
    lastAdjusted: Joi.date().optional(),
  }).optional(),
  reminders: Joi.array()
    .items(
      Joi.object({
        type: Joi.string().valid("study", "review", "assessment").required(),
        time: Joi.string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
          .required(),
        message: Joi.string().trim().required(),
        repeat: Joi.string().valid("daily", "weekly", "monthly").required(),
        status: Joi.string().valid("active", "inactive").default("active"),
      })
    )
    .optional(),
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
  userId: Joi.objectId().optional(),
  targetExam: Joi.objectId().optional(),
});

module.exports = {
  createStudyPlanSchema,
  updateStudyPlanSchema,
  getStudyPlanSchema,
};