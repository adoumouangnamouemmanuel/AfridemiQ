const Joi = require("joi");

// Create exam schedule schema
const createExamScheduleSchema = Joi.object({
  examId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(1000).optional(),
  series: Joi.array().items(Joi.string()).optional(),
  level: Joi.string()
    .valid("Primary", "JSS", "SSS", "University", "Professional")
    .required(),
  examType: Joi.string()
    .valid("mock", "practice", "official", "assessment")
    .default("practice"),
  scheduling: Joi.object({
    date: Joi.date().greater("now").required(),
    time: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    duration: Joi.number().min(1).max(480).required(),
    timezone: Joi.string().default("Africa/Lagos"),
    buffer: Joi.object({
      before: Joi.number().min(0).max(60).default(15),
      after: Joi.number().min(0).max(60).default(15),
    }).optional(),
  }).required(),
  venue: Joi.object({
    type: Joi.string().valid("online", "physical", "hybrid").default("online"),
    location: Joi.string().when("type", {
      is: Joi.string().valid("physical", "hybrid"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    onlineLink: Joi.string()
      .uri()
      .when("type", {
        is: Joi.string().valid("online", "hybrid"),
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
      }),
    capacity: Joi.number().min(1).optional(),
    requirements: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  registration: Joi.object({
    isRequired: Joi.boolean().default(true),
    deadline: Joi.date().optional(),
    fee: Joi.number().min(0).default(0),
    maxParticipants: Joi.number().min(1).optional(),
  }).optional(),
  proctoring: Joi.object({
    enabled: Joi.boolean().default(false),
    type: Joi.string()
      .valid("automated", "human", "hybrid")
      .default("automated"),
    settings: Joi.object({
      cameraRequired: Joi.boolean().default(false),
      screenRecording: Joi.boolean().default(false),
      tabSwitchDetection: Joi.boolean().default(false),
      plagiarismCheck: Joi.boolean().default(false),
    }).optional(),
  }).optional(),
  instructions: Joi.object({
    general: Joi.array().items(Joi.string()).optional(),
    technical: Joi.array().items(Joi.string()).optional(),
    materials: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  notifications: Joi.object({
    reminder: Joi.object({
      enabled: Joi.boolean().default(true),
      schedule: Joi.array()
        .items(
          Joi.object({
            time: Joi.number().min(1).required(),
          })
        )
        .optional(),
    }).optional(),
    updates: Joi.object({
      enabled: Joi.boolean().default(true),
    }).optional(),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional(),
});

// Update exam schedule schema
const updateExamScheduleSchema = Joi.object({
  examId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  title: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(1000).optional(),
  series: Joi.array().items(Joi.string()).optional(),
  level: Joi.string()
    .valid("Primary", "JSS", "SSS", "University", "Professional")
    .optional(),
  examType: Joi.string()
    .valid("mock", "practice", "official", "assessment")
    .optional(),
  scheduling: Joi.object({
    date: Joi.date().greater("now").optional(),
    time: Joi.string()
      .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .optional(),
    duration: Joi.number().min(1).max(480).optional(),
    timezone: Joi.string().optional(),
    buffer: Joi.object({
      before: Joi.number().min(0).max(60),
      after: Joi.number().min(0).max(60),
    }).optional(),
  }).optional(),
  venue: Joi.object({
    type: Joi.string().valid("online", "physical", "hybrid").optional(),
    location: Joi.string().optional(),
    onlineLink: Joi.string().uri().optional(),
    capacity: Joi.number().min(1).optional(),
    requirements: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  registration: Joi.object({
    isRequired: Joi.boolean().optional(),
    deadline: Joi.date().optional(),
    fee: Joi.number().min(0).optional(),
    maxParticipants: Joi.number().min(1).optional(),
  }).optional(),
  proctoring: Joi.object({
    enabled: Joi.boolean().optional(),
    type: Joi.string().valid("automated", "human", "hybrid").optional(),
    settings: Joi.object({
      cameraRequired: Joi.boolean().optional(),
      screenRecording: Joi.boolean().optional(),
      tabSwitchDetection: Joi.boolean().optional(),
      plagiarismCheck: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
  instructions: Joi.object({
    general: Joi.array().items(Joi.string()).optional(),
    technical: Joi.array().items(Joi.string()).optional(),
    materials: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  notifications: Joi.object({
    reminder: Joi.object({
      enabled: Joi.boolean().optional(),
      schedule: Joi.array()
        .items(
          Joi.object({
            time: Joi.number().min(1).required(),
          })
        )
        .optional(),
    }).optional(),
    updates: Joi.object({
      enabled: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional(),
  status: Joi.string()
    .valid(
      "draft",
      "scheduled",
      "active",
      "completed",
      "cancelled",
      "postponed"
    )
    .optional(),
});

// Get exam schedules schema
const getExamSchedulesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid("scheduling.date", "title", "createdAt")
    .default("scheduling.date"),
  sortOrder: Joi.string().valid("asc", "desc").default("asc"),
  search: Joi.string().trim().optional(),
  examId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  level: Joi.string()
    .valid("Primary", "JSS", "SSS", "University", "Professional")
    .optional(),
  examType: Joi.string()
    .valid("mock", "practice", "official", "assessment")
    .optional(),
  status: Joi.string()
    .valid(
      "draft",
      "scheduled",
      "active",
      "completed",
      "cancelled",
      "postponed"
    )
    .optional(),
  creatorId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().min(Joi.ref("dateFrom")).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().min(Joi.ref("startDate")).optional(),
});

// Update participant status schema
const updateParticipantStatusSchema = Joi.object({
  status: Joi.string()
    .valid("registered", "confirmed", "attended", "absent", "cancelled")
    .required(),
});

module.exports = {
  createExamScheduleSchema,
  updateExamScheduleSchema,
  getExamSchedulesSchema,
  updateParticipantStatusSchema,
};