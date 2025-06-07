const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const createPeerTutorProfileSchema = Joi.object({
  userId: Joi.objectId().required().messages({
    "any.required": "Identifiant d'utilisateur requis",
    "string.pattern.base": "Identifiant d'utilisateur invalide",
  }),
  subjects: Joi.array().items(Joi.objectId()).min(1).required().messages({
    "array.min": "Au moins une matière est requise",
    "string.pattern.base": "Identifiant de matière invalide",
  }),
  series: Joi.array().items(Joi.string().trim().min(1)).optional().messages({
    "string.min": "Les séries ne peuvent pas être vides",
  }),
  topics: Joi.array().items(Joi.objectId()).min(1).required().messages({
    "array.min": "Au moins un sujet est requis",
    "string.pattern.base": "Identifiant de sujet invalide",
  }),
  availability: Joi.array()
    .items(
      Joi.object({
        day: Joi.string()
          .valid(
            "lundi",
            "mardi",
            "mercredi",
            "jeudi",
            "vendredi",
            "samedi",
            "dimanche"
          )
          .required()
          .messages({
            "any.only": "Jour invalide",
            "any.required": "Jour requis",
          }),
        startTime: Joi.string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
          .required()
          .messages({
            "string.pattern.base": "Format d'heure de début invalide (HH:MM)",
            "any.required": "Heure de début requise",
          }),
        endTime: Joi.string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
          .required()
          .messages({
            "string.pattern.base": "Format d'heure de fin invalide (HH:MM)",
            "any.required": "Heure de fin requise",
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins une disponibilité est requise",
    }),
  bio: Joi.string().trim().min(10).max(500).required().messages({
    "string.min": "Biographie trop courte (min 10 caractères)",
    "string.max": "Biographie trop longue (max 500 caractères)",
    "any.required": "Biographie requise",
  }),
  isAvailable: Joi.boolean().default(true),
  premiumOnly: Joi.boolean().default(false),
});

const updatePeerTutorProfileSchema = Joi.object({
  subjects: Joi.array().items(Joi.objectId()).min(1).optional().messages({
    "array.min": "Au moins une matière est requise",
    "string.pattern.base": "Identifiant de matière invalide",
  }),
  series: Joi.array().items(Joi.string().trim().min(1)).optional().messages({
    "string.min": "Les séries ne peuvent pas être vides",
  }),
  topics: Joi.array().items(Joi.objectId()).min(1).optional().messages({
    "array.min": "Au moins un sujet est requis",
    "string.pattern.base": "Identifiant de sujet invalide",
  }),
  availability: Joi.array()
    .items(
      Joi.object({
        day: Joi.string()
          .valid(
            "lundi",
            "mardi",
            "mercredi",
            "jeudi",
            "vendredi",
            "samedi",
            "dimanche"
          )
          .required(),
        startTime: Joi.string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
          .required(),
        endTime: Joi.string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
          .required(),
      })
    )
    .min(1)
    .optional(),
  bio: Joi.string().trim().min(10).max(500).optional(),
  isAvailable: Joi.boolean().optional(),
  premiumOnly: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    "object.min": "Au moins un champ doit être fourni pour la mise à jour",
  });

const addReviewSchema = Joi.object({
  rating: Joi.number().integer().min(0).max(10).required().messages({
    "number.min": "La note doit être au moins 0",
    "number.max": "La note ne peut dépasser 10",
    "any.required": "Note requise",
  }),
  comments: Joi.string().trim().max(500).optional().messages({
    "string.max": "Commentaires trop longs (max 500 caractères)",
  }),
});

const getPeerTutorProfileSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  subjectId: Joi.objectId().optional(),
  topicId: Joi.objectId().optional(),
  series: Joi.string().trim().min(1).optional(),
  isAvailable: Joi.boolean().optional(),
  premiumOnly: Joi.boolean().optional(),
});

module.exports = {
  createPeerTutorProfileSchema,
  updatePeerTutorProfileSchema,
  addReviewSchema,
  getPeerTutorProfileSchema,
};