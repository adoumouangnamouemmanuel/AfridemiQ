const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const createLessonSchema = Joi.object({
  topicId: Joi.objectId().required().messages({
    "any.required": "Identifiant du sujet requis",
    "string.pattern.base": "Identifiant du sujet invalide",
  }),
  title: Joi.string().trim().min(3).max(100).required().messages({
    "string.min": "Titre trop court (min 3 caractères)",
    "string.max": "Titre trop long (max 100 caractères)",
    "any.required": "Titre requis",
  }),
  series: Joi.array().items(Joi.string().trim().min(1)).optional().messages({
    "string.min": "Les séries ne peuvent pas être vides",
  }),
  overview: Joi.string().trim().max(1000).optional().messages({
    "string.max": "Résumé trop long (max 1000 caractères)",
  }),
  objectives: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional()
    .messages({
      "string.min": "Les objectifs ne peuvent pas être vides",
    }),
  keyPoints: Joi.array().items(Joi.string().trim().min(1)).optional().messages({
    "string.min": "Les points clés ne peuvent pas être vides",
  }),
  duration: Joi.number().integer().min(5).required().messages({
    "number.min": "La durée doit être d'au moins 5 minutes",
    "any.required": "Durée requise",
  }),
  resourceIds: Joi.array().items(Joi.objectId()).optional().messages({
    "string.pattern.base": "Identifiant de ressource invalide",
  }),
  exerciseIds: Joi.array().items(Joi.objectId()).optional().messages({
    "string.pattern.base": "Identifiant d'exercice invalide",
  }),
  interactivityLevel: Joi.string()
    .valid("low", "medium", "high")
    .required()
    .messages({
      "any.only": "Niveau d'interactivité invalide",
      "any.required": "Niveau d'interactivité requis",
    }),
  offlineAvailable: Joi.boolean().default(false),
  premiumOnly: Joi.boolean().default(false),
  metadata: Joi.object({
    createdBy: Joi.objectId().required().messages({
      "any.required": "Créateur requis",
      "string.pattern.base": "Identifiant du créateur invalide",
    }),
    updatedBy: Joi.objectId().optional().messages({
      "string.pattern.base": "Identifiant du modificateur invalide",
    }),
  }).required(),
});

const updateLessonSchema = createLessonSchema
  .fork(
    [
      "topicId",
      "title",
      "duration",
      "interactivityLevel",
      "metadata.createdBy",
    ],
    (schema) => schema.optional()
  )
  .min(1)
  .messages({
    "object.min": "Au moins un champ doit être fourni pour la mise à jour",
  });

const addFeedbackSchema = Joi.object({
  rating: Joi.number().integer().min(0).max(10).required().messages({
    "number.min": "La note doit être au moins 0",
    "number.max": "La note ne peut dépasser 10",
    "any.required": "Note requise",
  }),
  comments: Joi.string().trim().max(500).optional().messages({
    "string.max": "Commentaires trop longs (max 500 caractères)",
  }),
});

const getLessonSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  topicId: Joi.objectId().optional(),
  series: Joi.string().trim().min(1).optional(),
  interactivityLevel: Joi.string().valid("low", "medium", "high").optional(),
  premiumOnly: Joi.boolean().optional(),
  offlineAvailable: Joi.boolean().optional(),
});

module.exports = {
  createLessonSchema,
  updateLessonSchema,
  addFeedbackSchema,
  getLessonSchema,
};