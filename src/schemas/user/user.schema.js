const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({ "any.required": "Le nom est requis" }),
  email: Joi.string().email().required().messages({
    "string.email": "Email invalide",
    "any.required": "Email requis",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Mot de passe trop court",
    "any.required": "Mot de passe requis",
  }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .allow(null)
    .messages({ "string.pattern.base": "Numéro de téléphone invalide" }),
  role: Joi.string().valid("student", "teacher", "admin").default("student"),
  gender: Joi.string().valid("male", "female"),
  dateOfBirth: Joi.date(),
  // Add missing fields that can be provided during registration
  schoolName: Joi.string().optional(),
  gradeLevel: Joi.string().optional(),
  timeZone: Joi.string().optional(),
  preferredLanguage: Joi.string(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email invalide",
    "any.required": "Email requis",
  }),
  password: Joi.string()
    .required()
    .messages({ "any.required": "Mot de passe requis" }),
});

const updateProfileSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .allow(null),
  country: Joi.string(),
  timeZone: Joi.string(),
  preferredLanguage: Joi.string(),
  schoolName: Joi.string(),
  gradeLevel: Joi.string(),
  parentEmail: Joi.string().email().allow(null),
  avatar: Joi.string(),
  socialProfile: Joi.object({
    bio: Joi.string().allow(""),
    publicAchievements: Joi.array().items(Joi.string()),
    visibility: Joi.string().valid("public", "friends", "private"),
    socialLinks: Joi.array().items(
      Joi.object({ platform: Joi.string(), url: Joi.string().uri() })
    ),
  }),
});

const updatePreferencesSchema = Joi.object({
  notifications: Joi.object({
    general: Joi.boolean(),
    dailyReminderTime: Joi.string(),
    challengeNotifications: Joi.boolean(),
    progressUpdates: Joi.boolean(),
  }),
  darkMode: Joi.boolean(),
  fontSize: Joi.string().valid("small", "medium", "large"),
  preferredContentFormat: Joi.string().valid("video", "text", "audio", "mixed"),
  enableHints: Joi.boolean(),
  autoPlayAudio: Joi.boolean(),
  showStepSolutions: Joi.boolean(),
  leaderboardVisibility: Joi.boolean(),
  allowFriendRequests: Joi.boolean(),
  multilingualSupport: Joi.array().items(Joi.string()),
});

const updateProgressSchema = Joi.object({
  selectedExam: Joi.string(),
  selectedSeries: Joi.string(),
  selectedLevel: Joi.string(),
  xp: Joi.number().integer().min(0),
  level: Joi.number().integer().min(1),
  streak: Joi.object({
    current: Joi.number().integer().min(0),
    longest: Joi.number().integer().min(0),
    lastStudyDate: Joi.date(),
  }),
  goalDate: Joi.date(),
  totalQuizzes: Joi.number().integer().min(0),
  averageScore: Joi.number().min(0),
  completedTopics: Joi.array().items(Joi.string()),
  weakSubjects: Joi.array().items(Joi.string()),
  badges: Joi.array().items(Joi.string()),
  achievements: Joi.array().items(Joi.string()),
  progressSummary: Joi.object({
    completedPercentage: Joi.number().min(0).max(100),
    remainingTopics: Joi.number().min(0),
  }),
});

const addFriendSchema = Joi.object({
  friendId: Joi.string()
    .required()
    .messages({ "any.required": "ID de l'ami requis" }),
});

const verifyPhoneSchema = Joi.object({
  code: Joi.string().length(6).required().messages({
    "any.required": "Code requis",
    "string.length": "Code doit avoir 6 chiffres",
  }),
});

const phoneVerificationSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      "any.required": "Numéro de téléphone requis",
      "string.pattern.base": "Numéro de téléphone invalide",
    }),
});

const updateSubscriptionSchema = Joi.object({
  type: Joi.string().valid("free", "premium"),
  startDate: Joi.date(),
  expiresAt: Joi.date(),
  paymentStatus: Joi.string().valid("active", "pending", "failed"),
  trialPeriod: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date(),
  }),
  features: Joi.array().items(Joi.string()),
  accessLevel: Joi.string().valid("basic", "premium"),
});

const passwordResetRequestSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email invalide",
    "any.required": "Email requis",
  }),
});

const passwordResetSchema = Joi.object({
  token: Joi.string().required().messages({ "any.required": "Token requis" }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Mot de passe trop court",
    "any.required": "Mot de passe requis",
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({ "any.required": "Token de rafraîchissement requis" }),
});

const searchUsersSchema = Joi.object({
  search: Joi.string()
    .optional()
    .messages({ "string.base": "Recherche doit être une chaîne" }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const updateSocialProfileSchema = Joi.object({
  bio: Joi.string().allow(""),
  publicAchievements: Joi.array().items(Joi.string()),
  visibility: Joi.string().valid("public", "friends", "private"),
  socialLinks: Joi.array().items(
    Joi.object({
      platform: Joi.string(),
      url: Joi.string().uri(),
    })
  ),
});

const updateAllPreferencesSchema = Joi.object({
  preferences: Joi.object({
    notifications: Joi.object({
      general: Joi.boolean(),
      dailyReminderTime: Joi.string(),
      challengeNotifications: Joi.boolean(),
      progressUpdates: Joi.boolean(),
    }),
    darkMode: Joi.boolean(),
    fontSize: Joi.string().valid("small", "medium", "large"),
    preferredContentFormat: Joi.string().valid(
      "video",
      "text",
      "audio",
      "mixed"
    ),
    enableHints: Joi.boolean(),
    autoPlayAudio: Joi.boolean(),
    showStepSolutions: Joi.boolean(),
    leaderboardVisibility: Joi.boolean(),
    allowFriendRequests: Joi.boolean(),
    multilingualSupport: Joi.array().items(Joi.string()),
  }).required(),
});

const updatePreferenceTypeSchema = Joi.object({
  value: Joi.alternatives()
    .try(
      Joi.boolean(),
      Joi.string(),
      Joi.array().items(Joi.string()),
      Joi.object({
        general: Joi.boolean(),
        dailyReminderTime: Joi.string(),
        challengeNotifications: Joi.boolean(),
        progressUpdates: Joi.boolean(),
      })
    )
    .required(),
});

const updateMultiplePreferencesSchema = Joi.object({
  preferences: Joi.object({
    notifications: Joi.object({
      general: Joi.boolean(),
      dailyReminderTime: Joi.string(),
      challengeNotifications: Joi.boolean(),
      progressUpdates: Joi.boolean(),
    }),
    darkMode: Joi.boolean(),
    fontSize: Joi.string().valid("small", "medium", "large"),
    preferredContentFormat: Joi.string().valid(
      "video",
      "text",
      "audio",
      "mixed"
    ),
    enableHints: Joi.boolean(),
    autoPlayAudio: Joi.boolean(),
    showStepSolutions: Joi.boolean(),
    leaderboardVisibility: Joi.boolean(),
    allowFriendRequests: Joi.boolean(),
    multilingualSupport: Joi.array().items(Joi.string()),
  })
    .min(1)
    .required(),
});

// Schema for updating only the bio (part of socialProfile)
const updateBioSchema = Joi.object({
  bio: Joi.string().max(300).optional().messages({
    "string.max": "La biographie ne doit pas dépasser 300 caractères",
  }),
})
  .min(1)
  .messages({
    "object.min":
      "Au moins un champ est requis pour mettre à jour la biographie",
  });

// Schema for updating personal information
const updatePersonalInfoSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    "string.min": "Le nom doit contenir au moins 2 caractères",
    "string.max": "Le nom ne doit pas dépasser 50 caractères",
  }),
  email: Joi.string().email().optional().messages({
    "string.email": "Email invalide",
  }),
  phoneNumber: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .optional()
    .messages({
      "string.pattern.base": "Numéro de téléphone invalide (ex: +1234567890)",
    }),
  country: Joi.string().max(100).optional().messages({
    "string.max": "Le pays ne doit pas dépasser 100 caractères",
  }),
  timeZone: Joi.string().max(100).optional().messages({
    "string.max": "Le fuseau horaire ne doit pas dépasser 100 caractères",
  }),
  preferredLanguage: Joi.string().max(10).optional().messages({
    "string.max": "La langue préférée ne doit pas dépasser 10 caractères",
  }),
  dateOfBirth: Joi.date().iso().optional().messages({
    "date.base": "Date de naissance invalide",
  }),
  gender: Joi.string().valid("male", "female", "other").optional().messages({
    "any.only": "Genre invalide (male, female, other)",
  }),
})
  .min(1)
  .messages({
    "object.min":
      "Au moins un champ est requis pour mettre à jour les informations personnelles",
  });

// Schema for updating education information
const updateEducationSchema = Joi.object({
  schoolName: Joi.string().max(100).optional().messages({
    "string.max": "Le nom de l'école ne doit pas dépasser 100 caractères",
  }),
  gradeLevel: Joi.string().max(50).optional().messages({
    "string.max": "Le niveau scolaire ne doit pas dépasser 50 caractères",
  }),
  parentEmail: Joi.string().email().optional().messages({
    "string.email": "Email du parent invalide",
  }),
  studyField: Joi.string().max(50).optional().messages({
    "string.max": "Le domaine d'étude ne doit pas dépasser 50 caractères",
  }),
  studyHours: Joi.number().min(0).max(24).optional().messages({
    "number.base": "Les heures d'étude quotidiennes doivent être un nombre",
    "number.min":
      "Les heures d'étude quotidiennes doivent être supérieures ou égales à 0",
    "number.max": "Les heures d'étude quotidiennes ne doivent pas dépasser 24",
  }),
})
  .min(1)
  .messages({
    "object.min":
      "Au moins un champ est requis pour mettre à jour les informations éducatives",
  });

// Schema for updating exam preparation (progress-related fields)
const updateExamPreparationSchema = Joi.object({
  selectedExam: Joi.string().max(100).optional().messages({
    "string.max": "L'examen sélectionné ne doit pas dépasser 100 caractères",
  }),
  examYear: Joi.number().integer().min(2020).max(2030).optional().messages({
    "number.base": "L'année de l'examen doit être un nombre",
    "number.integer": "L'année de l'examen doit être un entier",
    "number.min": "L'année de l'examen doit être 2020 ou ultérieure",
    "number.max": "L'année de l'examen ne peut pas dépasser 2030",
  }),
})
  .min(1)
  .messages({
    "object.min":
      "Au moins un champ est requis pour mettre à jour la préparation à l'examen",
  });

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePreferencesSchema,
  updateProgressSchema,
  addFriendSchema,
  verifyPhoneSchema,
  phoneVerificationSchema,
  updateSubscriptionSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  refreshTokenSchema,
  searchUsersSchema,
  updateSocialProfileSchema,
  updateAllPreferencesSchema,
  updatePreferenceTypeSchema,
  updateMultiplePreferencesSchema,
  updateBioSchema,
  updatePersonalInfoSchema,
  updateEducationSchema,
  updateExamPreparationSchema,
};
