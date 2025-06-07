const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const createTutoringSessionSchema = Joi.object({
  tutorId: Joi.objectId().required().messages({
    "any.required": "Identifiant du tuteur requis",
    "string.pattern.base": "Identifiant du tuteur invalide",
  }),
  subjectId: Joi.objectId().required().messages({
    "any.required": "Identifiant de la matière requis",
    "string.pattern.base": "Identifiant de la matière invalide",
  }),
  series: Joi.array().items(Joi.string().trim().min(1)).optional().messages({
    "string.min": "Les séries ne peuvent pas être vides",
  }),
  topicId: Joi.objectId().optional().messages({
    "string.pattern.base": "Identifiant du sujet invalide",
  }),
  scheduledAt: Joi.date().iso().greater("now").required().messages({
    "date.greater": "La date de planification doit être future",
    "any.required": "Date de planification requise",
  }),
  duration: Joi.number().integer().min(15).required().messages({
    "number.min": "La durée doit être d'au moins 15 minutes",
    "any.required": "Durée requise",
  }),
  premiumOnly: Joi.boolean().default(false),
});

const updateTutoringSessionSchema = Joi.object({
  scheduledAt: Joi.date().iso().greater("now").optional(),
  duration: Joi.number().integer().min(15).optional(),
  status: Joi.string()
    .valid("scheduled", "completed", "cancelled")
    .optional()
    .messages({
      "any.only": "Statut invalide",
    }),
  feedback: Joi.string().trim().max(500).optional().messages({
    "string.max": "Commentaires trop longs (max 500 caractères)",
  }),
  sessionRecording: Joi.object({
    url: Joi.string().uri().optional().messages({
      "string.uri": "URL d'enregistrement invalide",
    }),
    duration: Joi.number().min(0).optional().messages({
      "number.min": "La durée de l'enregistrement ne peut pas être négative",
    }),
  }).optional(),
  premiumOnly: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    "object.min": "Au moins un champ doit être fourni pour la mise à jour",
  });

const getTutoringSessionSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  tutorId: Joi.objectId().optional(),
  studentId: Joi.objectId().optional(),
  subjectId: Joi.objectId().optional(),
  topicId: Joi.objectId().optional(),
  series: Joi.string().trim().min(1).optional(),
  status: Joi.string().valid("scheduled", "completed", "cancelled").optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
});

module.exports = {
  createTutoringSessionSchema,
  updateTutoringSessionSchema,
  getTutoringSessionSchema,
};
