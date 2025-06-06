const Joi = require("joi");

const createExamSchema = Joi.object({
  name: Joi.string().required().trim().max(200).messages({
    "any.required": "Le nom de l'examen est requis",
    "string.max": "Le nom ne peut pas dépasser 200 caractères",
  }),
  description: Joi.string().required().trim().max(1000).messages({
    "any.required": "La description est requise",
    "string.max": "La description ne peut pas dépasser 1000 caractères",
  }),
  longDescription: Joi.string().trim().optional(),
  icon: Joi.string().required().trim().messages({
    "any.required": "L'icône est requise",
  }),
  color: Joi.string()
    .required()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .messages({
      "any.required": "La couleur est requise",
      "string.pattern.base":
        "La couleur doit être un code hexadécimal valide (ex: #FF0000)",
    }),
  examType: Joi.string()
    .valid("certification", "concours", "test", "autre")
    .default("test"),
  difficulty: Joi.string()
    .valid("facile", "moyen", "difficile", "expert")
    .default("moyen"),
  country: Joi.string().required().trim().max(100).messages({
    "any.required": "Le pays est requis",
    "string.max": "Le nom du pays ne peut pas dépasser 100 caractères",
  }),
  levels: Joi.array().items(Joi.string().trim()).min(1).required().messages({
    "any.required": "Au moins un niveau doit être spécifié",
    "array.min": "Au moins un niveau doit être spécifié",
  }),
  series: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required().trim().messages({
          "any.required": "L'ID de la série est requis",
        }),
        name: Joi.string().required().trim().max(100).messages({
          "any.required": "Le nom de la série est requis",
          "string.max": "Le nom ne peut pas dépasser 100 caractères",
        }),
        description: Joi.string().trim().max(500).optional(),
        coefficient: Joi.number().min(1).max(10).default(1),
        duration: Joi.number().min(15).max(360).required().messages({
          "any.required": "La durée est requise",
          "number.min": "La durée doit être au moins 15 minutes",
          "number.max": "La durée ne peut pas dépasser 6 heures",
        }),
        totalMarks: Joi.number().min(10).max(200).required().messages({
          "any.required": "Le total des notes est requis",
          "number.min": "Le total doit être au moins 10",
          "number.max": "Le total ne peut pas dépasser 200",
        }),
        passingMarks: Joi.number().min(5).max(100).required().messages({
          "any.required": "La note de passage est requise",
          "number.min": "La note de passage doit être au moins 5",
          "number.max": "La note de passage ne peut pas dépasser 100",
        }),
        subjects: Joi.array().items(Joi.string()).default([]),
      })
    )
    .default([]),
  curriculumId: Joi.string().required().messages({
    "any.required": "Le curriculum est requis",
  }),
  examFormat: Joi.string()
    .valid("papier", "ordinateur", "hybride")
    .default("papier"),
  accessibilityOptions: Joi.array()
    .items(
      Joi.string().valid(
        "braille",
        "gros_caracteres",
        "temps_supplementaire",
        "aide_technique",
        "salle_separee"
      )
    )
    .default([]),
  importantDates: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid("inscription", "examen", "resultats", "rattrapage")
          .required()
          .messages({
            "any.required": "Le type de date est requis",
            "any.only": "Type de date invalide",
          }),
        date: Joi.date().required().messages({
          "any.required": "La date est requise",
        }),
        description: Joi.string().trim().optional(),
      })
    )
    .default([]),
  registrationRequirements: Joi.object({
    minimumAge: Joi.number().integer().min(10).max(100).optional(),
    requiredDocuments: Joi.array().items(Joi.string().trim()).default([]),
    fees: Joi.object({
      amount: Joi.number().min(0).optional(),
      currency: Joi.string().trim().max(10).optional(),
    }).optional(),
  }).optional(),
  examCenters: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required().trim().messages({
          "any.required": "L'ID du centre est requis",
        }),
        name: Joi.string().required().trim().max(200).messages({
          "any.required": "Le nom du centre est requis",
          "string.max": "Le nom ne peut pas dépasser 200 caractères",
        }),
        location: Joi.object({
          address: Joi.string().required().trim().messages({
            "any.required": "L'adresse est requise",
          }),
          city: Joi.string().required().trim().messages({
            "any.required": "La ville est requise",
          }),
          country: Joi.string().required().trim().messages({
            "any.required": "Le pays est requis",
          }),
          postalCode: Joi.string().trim().optional(),
        }).required(),
        capacity: Joi.number().integer().min(1).optional(),
        contact: Joi.object({
          phone: Joi.string().trim().optional(),
          email: Joi.string().email().trim().optional(),
        }).optional(),
      })
    )
    .default([]),
  statistics: Joi.array()
    .items(
      Joi.object({
        year: Joi.number()
          .integer()
          .min(2000)
          .max(new Date().getFullYear() + 5)
          .required()
          .messages({
            "any.required": "L'année est requise",
            "number.min": "L'année doit être au moins 2000",
            "number.max": "L'année ne peut pas être trop dans le futur",
          }),
        session: Joi.string()
          .valid("janvier", "juin", "septembre", "decembre")
          .required()
          .messages({
            "any.required": "La session est requise",
          }),
        totalCandidates: Joi.number().integer().min(0).optional(),
        totalPassed: Joi.number().integer().min(0).optional(),
        passRate: Joi.number().min(0).max(100).optional(),
        averageScore: Joi.number().min(0).optional(),
        series: Joi.string().trim().optional(),
        subjectStatistics: Joi.array()
          .items(
            Joi.object({
              subject: Joi.string().required(),
              averageScore: Joi.number().min(0).optional(),
              highestScore: Joi.number().min(0).optional(),
              lowestScore: Joi.number().min(0).optional(),
            })
          )
          .default([]),
      })
    )
    .default([]),
  examBoard: Joi.object({
    name: Joi.string().trim().max(100).optional(),
    website: Joi.string().uri().trim().optional(),
    contact: Joi.object({
      phone: Joi.string().trim().optional(),
      email: Joi.string().email().trim().optional(),
      address: Joi.string().trim().max(500).optional(),
    }).optional(),
  }).optional(),
  language: Joi.string().trim().optional(),
  primaryLanguage: Joi.string().required().trim().max(50).messages({
    "any.required": "La langue principale est requise",
    "string.max": "La langue ne peut pas dépasser 50 caractères",
  }),
  alternativeLanguages: Joi.array()
    .items(Joi.string().trim().max(50))
    .default([]),
  keywords: Joi.array().items(Joi.string().trim()).default([]),
  popularity: Joi.number().min(0).default(0),
  rating: Joi.object({
    average: Joi.number().min(0).max(5).default(0),
    count: Joi.number().min(0).default(0),
  }).default({ average: 0, count: 0 }),
  metadata: Joi.object({
    views: Joi.number().min(0).default(0),
    likes: Joi.number().min(0).default(0),
    shares: Joi.number().min(0).default(0),
  }).default({ views: 0, likes: 0, shares: 0 }),
  tags: Joi.array().items(Joi.string().trim()).default([]),
});

const updateExamSchema = Joi.object({
  name: Joi.string().trim().max(200),
  description: Joi.string().trim().max(1000),
  longDescription: Joi.string().trim(),
  icon: Joi.string().trim(),
  color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  examType: Joi.string().valid("certification", "concours", "test", "autre"),
  difficulty: Joi.string().valid("facile", "moyen", "difficile", "expert"),
  country: Joi.string().trim().max(100),
  levels: Joi.array().items(Joi.string().trim()).min(1),
  series: Joi.array().items(
    Joi.object({
      id: Joi.string().required().trim(),
      name: Joi.string().required().trim().max(100),
      description: Joi.string().trim().max(500),
      coefficient: Joi.number().min(1).max(10),
      duration: Joi.number().min(15).max(360),
      totalMarks: Joi.number().min(10).max(200),
      passingMarks: Joi.number().min(5).max(100),
      subjects: Joi.array().items(Joi.string()),
    })
  ),
  curriculumId: Joi.string(),
  examFormat: Joi.string().valid("papier", "ordinateur", "hybride"),
  accessibilityOptions: Joi.array().items(
    Joi.string().valid(
      "braille",
      "gros_caracteres",
      "temps_supplementaire",
      "aide_technique",
      "salle_separee"
    )
  ),
  importantDates: Joi.array().items(
    Joi.object({
      type: Joi.string()
        .valid("inscription", "examen", "resultats", "rattrapage")
        .required(),
      date: Joi.date().required(),
      description: Joi.string().trim(),
    })
  ),
  registrationRequirements: Joi.object({
    minimumAge: Joi.number().integer().min(10).max(100),
    requiredDocuments: Joi.array().items(Joi.string().trim()),
    fees: Joi.object({
      amount: Joi.number().min(0),
      currency: Joi.string().trim().max(10),
    }),
  }),
  examCenters: Joi.array().items(
    Joi.object({
      id: Joi.string().required().trim(),
      name: Joi.string().required().trim().max(200),
      location: Joi.object({
        address: Joi.string().required().trim(),
        city: Joi.string().required().trim(),
        country: Joi.string().required().trim(),
        postalCode: Joi.string().trim(),
      }).required(),
      capacity: Joi.number().integer().min(1),
      contact: Joi.object({
        phone: Joi.string().trim(),
        email: Joi.string().email().trim(),
      }),
    })
  ),
  statistics: Joi.array().items(
    Joi.object({
      year: Joi.number()
        .integer()
        .min(2000)
        .max(new Date().getFullYear() + 5)
        .required(),
      session: Joi.string()
        .valid("janvier", "juin", "septembre", "decembre")
        .required(),
      totalCandidates: Joi.number().integer().min(0),
      totalPassed: Joi.number().integer().min(0),
      passRate: Joi.number().min(0).max(100),
      averageScore: Joi.number().min(0),
      series: Joi.string().trim(),
      subjectStatistics: Joi.array().items(
        Joi.object({
          subject: Joi.string().required(),
          averageScore: Joi.number().min(0),
          highestScore: Joi.number().min(0),
          lowestScore: Joi.number().min(0),
        })
      ),
    })
  ),
  examBoard: Joi.object({
    name: Joi.string().trim().max(100),
    website: Joi.string().uri().trim(),
    contact: Joi.object({
      phone: Joi.string().trim(),
      email: Joi.string().email().trim(),
      address: Joi.string().trim().max(500),
    }),
  }),
  language: Joi.string().trim(),
  primaryLanguage: Joi.string().trim().max(50),
  alternativeLanguages: Joi.array().items(Joi.string().trim().max(50)),
  keywords: Joi.array().items(Joi.string().trim()),
  popularity: Joi.number().min(0),
  rating: Joi.object({
    average: Joi.number().min(0).max(5),
    count: Joi.number().min(0),
  }),
  metadata: Joi.object({
    views: Joi.number().min(0),
    likes: Joi.number().min(0),
    shares: Joi.number().min(0),
  }),
  isActive: Joi.boolean(),
  tags: Joi.array().items(Joi.string().trim()),
});

const getExamsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  country: Joi.string().trim().optional(),
  level: Joi.string().trim().optional(),
  examFormat: Joi.string().valid("papier", "ordinateur", "hybride").optional(),
  examType: Joi.string()
    .valid("certification", "concours", "test", "autre")
    .optional(),
  difficulty: Joi.string()
    .valid("facile", "moyen", "difficile", "expert")
    .optional(),
  primaryLanguage: Joi.string().trim().optional(),
  language: Joi.string().trim().optional(),
  isActive: Joi.boolean().default(true),
  search: Joi.string().trim().optional(),
  sortBy: Joi.string()
    .valid(
      "name",
      "country",
      "examFormat",
      "examType",
      "difficulty",
      "primaryLanguage",
      "popularity",
      "createdAt"
    )
    .default("name"),
  sortOrder: Joi.string().valid("asc", "desc").default("asc"),
});

const addSeriesToExamSchema = Joi.object({
  id: Joi.string().required().trim().messages({
    "any.required": "L'ID de la série est requis",
  }),
  name: Joi.string().required().trim().max(100).messages({
    "any.required": "Le nom de la série est requis",
    "string.max": "Le nom ne peut pas dépasser 100 caractères",
  }),
  description: Joi.string().trim().max(500).optional(),
  coefficient: Joi.number().min(1).max(10).default(1),
  duration: Joi.number().min(15).max(360).required(),
  totalMarks: Joi.number().min(10).max(200).required(),
  passingMarks: Joi.number().min(5).max(100).required(),
  subjects: Joi.array().items(Joi.string()).default([]),
});

const addCenterToExamSchema = Joi.object({
  id: Joi.string().required().trim().messages({
    "any.required": "L'ID du centre est requis",
  }),
  name: Joi.string().required().trim().max(200).messages({
    "any.required": "Le nom du centre est requis",
    "string.max": "Le nom ne peut pas dépasser 200 caractères",
  }),
  location: Joi.object({
    address: Joi.string().required().trim().messages({
      "any.required": "L'adresse est requise",
    }),
    city: Joi.string().required().trim().messages({
      "any.required": "La ville est requise",
    }),
    country: Joi.string().required().trim().messages({
      "any.required": "Le pays est requis",
    }),
    postalCode: Joi.string().trim().optional(),
  }).required(),
  capacity: Joi.number().integer().min(1).optional(),
  contact: Joi.object({
    phone: Joi.string().trim().optional(),
    email: Joi.string().email().trim().optional(),
  }).optional(),
});

const addStatisticsToExamSchema = Joi.object({
  year: Joi.number()
    .integer()
    .min(2000)
    .max(new Date().getFullYear() + 5)
    .required()
    .messages({
      "any.required": "L'année est requise",
    }),
  session: Joi.string()
    .valid("janvier", "juin", "septembre", "decembre")
    .required()
    .messages({
      "any.required": "La session est requise",
    }),
  totalCandidates: Joi.number().integer().min(0).optional(),
  totalPassed: Joi.number().integer().min(0).optional(),
  passRate: Joi.number().min(0).max(100).optional(),
  averageScore: Joi.number().min(0).optional(),
  series: Joi.string().trim().optional(),
  subjectStatistics: Joi.array()
    .items(
      Joi.object({
        subject: Joi.string().required(),
        averageScore: Joi.number().min(0).optional(),
        highestScore: Joi.number().min(0).optional(),
        lowestScore: Joi.number().min(0).optional(),
      })
    )
    .default([]),
});

const rateExamSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    "any.required": "La note est requise",
    "number.min": "La note doit être au moins 1",
    "number.max": "La note ne peut pas dépasser 5",
  }),
});

module.exports = {
  createExamSchema,
  updateExamSchema,
  getExamsSchema,
  addSeriesToExamSchema,
  addCenterToExamSchema,
  addStatisticsToExamSchema,
  rateExamSchema,
};
