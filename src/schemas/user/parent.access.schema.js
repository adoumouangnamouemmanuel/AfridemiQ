const Joi = require("joi");

const createParentAccessSchema = Joi.object({
  parentEmail: Joi.string().email().required().messages({
    "string.base": "L'email du parent doit être une chaîne",
    "string.email": "L'email du parent doit être un email valide",
    "any.required": "L'email du parent est requis",
  }),
  accessLevel: Joi.string()
    .valid("viewProgress", "viewReports", "fullAccess")
    .optional()
    .messages({
      "any.only":
        "Le niveau d'accès doit être viewProgress, viewReports ou fullAccess",
    }),
  notifications: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid(
            "daily_progress",
            "weekly_summary",
            "achievement",
            "low_performance",
            "exam_reminder"
          )
          .required(),
        frequency: Joi.string()
          .valid("immediate", "daily", "weekly", "monthly")
          .required(),
        enabled: Joi.boolean().optional(),
      })
    )
    .optional(),
});

const updateParentAccessSchema = Joi.object({
  accessLevel: Joi.string()
    .valid("viewProgress", "viewReports", "fullAccess")
    .optional()
    .messages({
      "any.only":
        "Le niveau d'accès doit être viewProgress, viewReports ou fullAccess",
    }),
  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive doit être un booléen",
  }),
  notifications: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid(
            "daily_progress",
            "weekly_summary",
            "achievement",
            "low_performance",
            "exam_reminder"
          )
          .required(),
        frequency: Joi.string()
          .valid("immediate", "daily", "weekly", "monthly")
          .required(),
        enabled: Joi.boolean().optional(),
      })
    )
    .optional(),
});

const updateNotificationPreferencesSchema = Joi.object({
  notifications: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid(
            "daily_progress",
            "weekly_summary",
            "achievement",
            "low_performance",
            "exam_reminder"
          )
          .required()
          .messages({
            "any.only":
              "Le type doit être daily_progress, weekly_summary, achievement, low_performance ou exam_reminder",
            "any.required": "Le type est requis",
          }),
        frequency: Joi.string()
          .valid("immediate", "daily", "weekly", "monthly")
          .required()
          .messages({
            "any.only":
              "La fréquence doit être immediate, daily, weekly ou monthly",
            "any.required": "La fréquence est requise",
          }),
        enabled: Joi.boolean().optional().messages({
          "boolean.base": "enabled doit être un booléen",
        }),
      })
    )
    .required()
    .messages({
      "array.base": "Les notifications doivent être un tableau",
      "any.required": "Les notifications sont requises",
    }),
});

const verifyParentAccessSchema = Joi.object({
  verificationCode: Joi.string().required().messages({
    "string.base": "Le code de vérification doit être une chaîne",
    "any.required": "Le code de vérification est requis",
  }),
});

module.exports = {
  createParentAccessSchema,
  updateParentAccessSchema,
  updateNotificationPreferencesSchema,
  verifyParentAccessSchema,
};