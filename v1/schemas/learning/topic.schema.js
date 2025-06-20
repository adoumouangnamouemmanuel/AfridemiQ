const Joi = require("joi");

// Base topic schema
const baseTopicSchema = {
  name: Joi.string().trim().min(2).max(200).required().messages({
    "string.empty": "Topic name is required",
    "string.min": "Topic name must be at least 2 characters long",
    "string.max": "Topic name cannot exceed 200 characters",
  }),

  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid subject ID format",
      "string.empty": "Subject ID is required",
    }),

  series: Joi.array()
    .items(Joi.string().trim().min(1).max(50))
    .default([])
    .messages({
      "array.base": "Series must be an array",
      "string.min": "Series item must be at least 1 character long",
      "string.max": "Series item cannot exceed 50 characters",
    }),

  description: Joi.string().trim().min(10).max(1000).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 1000 characters",
  }),

  difficulty: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .required()
    .messages({
      "any.only": "Difficulty must be one of: beginner, intermediate, advanced",
      "string.empty": "Difficulty is required",
    }),

  estimatedTime: Joi.number().integer().min(1).max(10080).required().messages({
    "number.base": "Estimated time must be a number",
    "number.integer": "Estimated time must be an integer",
    "number.min": "Estimated time must be at least 1 minute",
    "number.max": "Estimated time cannot exceed 10080 minutes (1 week)",
    "any.required": "Estimated time is required",
  }),

  estimatedCompletionDate: Joi.date().iso().optional().messages({
    "date.format": "Estimated completion date must be a valid ISO date",
  }),

  relatedTopics: Joi.array()
    .items(Joi.string().trim().min(1).max(200))
    .default([])
    .messages({
      "array.base": "Related topics must be an array",
      "string.min": "Related topic must be at least 1 character long",
      "string.max": "Related topic cannot exceed 200 characters",
    }),

  hasPractice: Joi.boolean().default(false).messages({
    "boolean.base": "Has practice must be a boolean",
  }),

  hasNote: Joi.boolean().default(false).messages({
    "boolean.base": "Has note must be a boolean",
  }),

  hasStudyMaterial: Joi.boolean().default(false).messages({
    "boolean.base": "Has study material must be a boolean",
  }),

  prerequisites: Joi.array()
    .items(Joi.string().trim().min(1).max(200))
    .default([])
    .messages({
      "array.base": "Prerequisites must be an array",
      "string.min": "Prerequisite must be at least 1 character long",
      "string.max": "Prerequisite cannot exceed 200 characters",
    }),

  learningObjectives: Joi.array()
    .items(Joi.string().trim().min(5).max(300))
    .default([])
    .messages({
      "array.base": "Learning objectives must be an array",
      "string.min": "Learning objective must be at least 5 characters long",
      "string.max": "Learning objective cannot exceed 300 characters",
    }),

  estimatedTimeToMaster: Joi.number()
    .integer()
    .min(1)
    .max(43200)
    .required()
    .messages({
      "number.base": "Estimated time to master must be a number",
      "number.integer": "Estimated time to master must be an integer",
      "number.min": "Estimated time to master must be at least 1 minute",
      "number.max":
        "Estimated time to master cannot exceed 43200 minutes (30 days)",
      "any.required": "Estimated time to master is required",
    }),

  resourceIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.pattern.base": "Invalid resource ID format",
        })
    )
    .default([])
    .messages({
      "array.base": "Resource IDs must be an array",
    }),

  assessmentCriteria: Joi.object({
    minimumScore: Joi.number().min(0).max(100).optional().messages({
      "number.base": "Minimum score must be a number",
      "number.min": "Minimum score cannot be negative",
      "number.max": "Minimum score cannot exceed 100",
    }),

    requiredPracticeQuestions: Joi.number()
      .integer()
      .min(0)
      .max(1000)
      .optional()
      .messages({
        "number.base": "Required practice questions must be a number",
        "number.integer": "Required practice questions must be an integer",
        "number.min": "Required practice questions cannot be negative",
        "number.max": "Required practice questions cannot exceed 1000",
      }),

    masteryThreshold: Joi.number().min(0).max(100).optional().messages({
      "number.base": "Mastery threshold must be a number",
      "number.min": "Mastery threshold cannot be negative",
      "number.max": "Mastery threshold cannot exceed 100",
    }),
  })
    .optional()
    .messages({
      "object.base": "Assessment criteria must be an object",
    }),
};

// Create topic schema
const createTopicSchema = Joi.object(baseTopicSchema);

// Update topic schema (all fields optional except validation rules)
const updateTopicSchema = Joi.object({
  ...Object.fromEntries(
    Object.entries(baseTopicSchema).map(([key, schema]) => [
      key,
      key === "subjectId" ? schema.optional() : schema.optional(),
    ])
  ),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Bulk create topics schema
const bulkCreateTopicsSchema = Joi.object({
  topics: Joi.array()
    .items(createTopicSchema)
    .min(1)
    .max(100)
    .required()
    .messages({
      "array.base": "Topics must be an array",
      "array.min": "At least one topic is required",
      "array.max": "Cannot create more than 100 topics at once",
      "any.required": "Topics array is required",
    }),
});

// Bulk update topics schema
const bulkUpdateTopicsSchema = Joi.object({
  updates: Joi.array()
    .items(
      Joi.object({
        id: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            "string.pattern.base": "Invalid topic ID format",
            "any.required": "Topic ID is required",
          }),
        data: updateTopicSchema.required().messages({
          "any.required": "Update data is required",
        }),
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.base": "Updates must be an array",
      "array.min": "At least one update is required",
      "array.max": "Cannot update more than 50 topics at once",
      "any.required": "Updates array is required",
    }),
});

module.exports = {
  createTopicSchema,
  updateTopicSchema,
  bulkCreateTopicsSchema,
  bulkUpdateTopicsSchema,
};
