const Joi = require("joi");

const createStudyGroupSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  series: Joi.array().items(Joi.string().trim().min(1)).optional(),
  memberIds: Joi.array().items(Joi.string().hex().length(24)).optional(),
  createdBy: Joi.string().hex().length(24).required(),
  challengeIds: Joi.array().items(Joi.string().hex().length(24)).optional(),
  learningPathId: Joi.string().hex().length(24).optional(),
  features: Joi.object({
    chatEnabled: Joi.boolean().default(false),
    fileSharing: Joi.boolean().default(false),
    liveSessions: Joi.boolean().default(false),
    progressTracking: Joi.boolean().default(false),
  }).optional(),
  roles: Joi.array()
    .items(
      Joi.object({
        userId: Joi.string().hex().length(24).required(),
        role: Joi.string().valid("admin", "moderator", "member").required(),
        permissions: Joi.array()
          .items(
            Joi.string().valid(
              "manage_members",
              "post_content",
              "schedule_sessions"
            )
          )
          .optional(),
      })
    )
    .optional(),
  activities: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid("quiz", "discussion", "resource_share")
          .required(),
        quizId: Joi.string()
          .hex()
          .length(24)
          .when("type", { is: "quiz", then: Joi.required() }),
        message: Joi.string().when("type", {
          is: "discussion",
          then: Joi.required(),
        }),
        resourceId: Joi.string()
          .hex()
          .length(24)
          .when("type", { is: "resource_share", then: Joi.required() }),
        createdBy: Joi.string().hex().length(24).required(),
      })
    )
    .optional(),
  studySchedule: Joi.object({
    sessions: Joi.array()
      .items(
        Joi.object({
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
          time: Joi.string()
            .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
            .required(),
          topic: Joi.string().hex().length(24).required(),
          duration: Joi.number().min(1).required(),
        })
      )
      .optional(),
  }).optional(),
  resourceIds: Joi.array().items(Joi.string().hex().length(24)).optional(),
  groupProgressSummary: Joi.object({
    completedTopics: Joi.array()
      .items(Joi.string().hex().length(24))
      .optional(),
    averageScore: Joi.number().min(0).max(100).optional(),
    lastUpdated: Joi.date().optional(),
  }).optional(),
});

const updateStudyGroupSchema = createStudyGroupSchema
  .fork(
    [
      "name",
      "description",
      "series",
      "memberIds",
      "createdBy",
      "challengeIds",
      "learningPathId",
      "features",
      "roles",
      "activities",
      "studySchedule",
      "resourceIds",
      "groupProgressSummary",
    ],
    (schema) => schema.optional()
  )
  .min(1);

const getStudyGroupSchema = Joi.object({
  createdBy: Joi.string().hex().length(24).optional(),
  memberId: Joi.string().hex().length(24).optional(),
});

module.exports = {
  createStudyGroupSchema,
  updateStudyGroupSchema,
  getStudyGroupSchema,
};