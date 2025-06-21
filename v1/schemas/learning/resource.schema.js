const Joi = require("joi");

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const RESOURCE_TYPES = [
  "document",
  "video",
  "audio",
  "interactive",
  "past_exam",
];

// Feedback schema
const feedbackSchema = Joi.object({
  rating: Joi.number().min(0).max(10).required().messages({
    "number.base": "La note doit être un nombre",
    "number.min": "La note doit être au moins 0",
    "number.max": "La note ne peut pas dépasser 10",
    "any.required": "La note est requise",
  }),
  comments: Joi.string().max(500).messages({
    "string.max": "Les commentaires ne peuvent pas dépasser 500 caractères",
  }),
});

// Metadata schema
const metadataSchema = Joi.object({
  fileSize: Joi.number().positive().messages({
    "number.positive": "La taille du fichier doit être positive",
  }),
  duration: Joi.number().positive().messages({
    "number.positive": "La durée doit être positive",
  }),
  format: Joi.string().max(50).messages({
    "string.max": "Le format ne peut pas dépasser 50 caractères",
  }),
  language: Joi.string().max(50).messages({
    "string.max": "La langue ne peut pas dépasser 50 caractères",
  }),
  tags: Joi.array().items(Joi.string().max(50)).messages({
    "array.base": "Les tags doivent être un tableau",
    "string.max": "Chaque tag ne peut pas dépasser 50 caractères",
  }),
  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .messages({
      "any.only": `La difficulté doit être l'une des valeurs suivantes: ${DIFFICULTY_LEVELS.join(
        ", "
      )}`,
    }),
  prerequisites: Joi.array().items(Joi.string().max(100)).messages({
    "array.base": "Les prérequis doivent être un tableau",
    "string.max": "Chaque prérequis ne peut pas dépasser 100 caractères",
  }),
  lastUpdated: Joi.date().messages({
    "date.base": "La date de dernière mise à jour doit être une date valide",
  }),
  version: Joi.string().max(20).messages({
    "string.max": "La version ne peut pas dépasser 20 caractères",
  }),
  contributors: Joi.array().items(Joi.string().max(100)).messages({
    "array.base": "Les contributeurs doivent être un tableau",
    "string.max": "Chaque contributeur ne peut pas dépasser 100 caractères",
  }),
  license: Joi.string().max(100).messages({
    "string.max": "La licence ne peut pas dépasser 100 caractères",
  }),
});

// Accessibility schema
const accessibilitySchema = Joi.object({
  hasTranscript: Joi.boolean().messages({
    "boolean.base": "hasTranscript doit être un booléen",
  }),
  hasSubtitles: Joi.boolean().messages({
    "boolean.base": "hasSubtitles doit être un booléen",
  }),
  hasAudioDescription: Joi.boolean().messages({
    "boolean.base": "hasAudioDescription doit être un booléen",
  }),
});

// Create resource schema
const createResourceSchema = Joi.object({
  format: Joi.string()
    .valid(...RESOURCE_TYPES)
    .required()
    .messages({
      "any.only": `Le format doit être l'une des valeurs suivantes: ${RESOURCE_TYPES.join(
        ", "
      )}`,
      "any.required": "Le format est requis",
    }),
  title: Joi.string().min(3).max(200).required().messages({
    "string.min": "Le titre doit contenir au moins 3 caractères",
    "string.max": "Le titre ne peut pas dépasser 200 caractères",
    "any.required": "Le titre est requis",
  }),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "L'ID du sujet doit être un ObjectId valide",
      "any.required": "L'ID du sujet est requis",
    }),
  series: Joi.array().items(Joi.string().max(50)).messages({
    "array.base": "Les séries doivent être un tableau",
    "string.max": "Chaque série ne peut pas dépasser 50 caractères",
  }),
  topicIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.pattern.base":
            "Chaque ID de sujet doit être un ObjectId valide",
        })
    )
    .messages({
      "array.base": "Les IDs des sujets doivent être un tableau",
    }),
  url: Joi.string().uri().required().messages({
    "string.uri": "L'URL doit être une URL valide",
    "any.required": "L'URL est requise",
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    "string.min": "La description doit contenir au moins 10 caractères",
    "string.max": "La description ne peut pas dépasser 1000 caractères",
    "any.required": "La description est requise",
  }),
  level: Joi.string().required().messages({
    "any.required": "Le niveau est requis",
  }),
  examIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.pattern.base":
            "Chaque ID d'examen doit être un ObjectId valide",
        })
    )
    .messages({
      "array.base": "Les IDs des examens doivent être un tableau",
    }),
  thumbnail: Joi.string().uri().messages({
    "string.uri": "La miniature doit être une URL valide",
  }),
  offlineAvailable: Joi.boolean().messages({
    "boolean.base": "offlineAvailable doit être un booléen",
  }),
  premiumOnly: Joi.boolean().messages({
    "boolean.base": "premiumOnly doit être un booléen",
  }),
  metadata: metadataSchema,
  accessibility: accessibilitySchema,
});

// Update resource schema
const updateResourceSchema = Joi.object({
  format: Joi.string()
    .valid(...RESOURCE_TYPES)
    .messages({
      "any.only": `Le format doit être l'une des valeurs suivantes: ${RESOURCE_TYPES.join(
        ", "
      )}`,
    }),
  title: Joi.string().min(3).max(200).messages({
    "string.min": "Le titre doit contenir au moins 3 caractères",
    "string.max": "Le titre ne peut pas dépasser 200 caractères",
  }),
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "L'ID du sujet doit être un ObjectId valide",
    }),
  series: Joi.array().items(Joi.string().max(50)).messages({
    "array.base": "Les séries doivent être un tableau",
    "string.max": "Chaque série ne peut pas dépasser 50 caractères",
  }),
  topicIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.pattern.base":
            "Chaque ID de sujet doit être un ObjectId valide",
        })
    )
    .messages({
      "array.base": "Les IDs des sujets doivent être un tableau",
    }),
  url: Joi.string().uri().messages({
    "string.uri": "L'URL doit être une URL valide",
  }),
  description: Joi.string().min(10).max(1000).messages({
    "string.min": "La description doit contenir au moins 10 caractères",
    "string.max": "La description ne peut pas dépasser 1000 caractères",
  }),
  level: Joi.string(),
  examIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.pattern.base":
            "Chaque ID d'examen doit être un ObjectId valide",
        })
    )
    .messages({
      "array.base": "Les IDs des examens doivent être un tableau",
    }),
  thumbnail: Joi.string().uri().messages({
    "string.uri": "La miniature doit être une URL valide",
  }),
  offlineAvailable: Joi.boolean().messages({
    "boolean.base": "offlineAvailable doit être un booléen",
  }),
  premiumOnly: Joi.boolean().messages({
    "boolean.base": "premiumOnly doit être un booléen",
  }),
  metadata: metadataSchema,
  accessibility: accessibilitySchema,
});

// Add feedback schema
const addFeedbackSchema = Joi.object({
  rating: Joi.number().min(0).max(10).required().messages({
    "number.base": "La note doit être un nombre",
    "number.min": "La note doit être au moins 0",
    "number.max": "La note ne peut pas dépasser 10",
    "any.required": "La note est requise",
  }),
  comments: Joi.string().max(500).messages({
    "string.max": "Les commentaires ne peuvent pas dépasser 500 caractères",
  }),
});

// Bulk create resources schema
const bulkCreateResourcesSchema = Joi.object({
  resources: Joi.array()
    .items(createResourceSchema)
    .min(1)
    .max(50)
    .required()
    .messages({
      "array.base": "Les ressources doivent être un tableau",
      "array.min": "Au moins une ressource est requise",
      "array.max": "Maximum 50 ressources peuvent être créées à la fois",
      "any.required": "Les ressources sont requises",
    }),
});

module.exports = {
  createResourceSchema,
  updateResourceSchema,
  addFeedbackSchema,
  bulkCreateResourcesSchema,
};
