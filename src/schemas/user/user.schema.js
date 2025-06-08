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
  country: Joi.string().required().messages({ "any.required": "Pays requis" }),
  role: Joi.string().valid("student", "teacher", "admin").default("student"),
  // Add missing fields that can be provided during registration
  schoolName: Joi.string().optional(),
  gradeLevel: Joi.string().optional(),
  timeZone: Joi.string().optional(),
  preferredLanguage: Joi.string().optional(),
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
      progressUpdates: Joi.boolean()
    }),
    darkMode: Joi.boolean(),
    fontSize: Joi.string().valid('small', 'medium', 'large'),
    preferredContentFormat: Joi.string().valid('video', 'text', 'audio', 'mixed'),
    enableHints: Joi.boolean(),
    autoPlayAudio: Joi.boolean(),
    showStepSolutions: Joi.boolean(),
    leaderboardVisibility: Joi.boolean(),
    allowFriendRequests: Joi.boolean(),
    multilingualSupport: Joi.array().items(Joi.string())
  }).required()
});

const updatePreferenceTypeSchema = Joi.object({
  value: Joi.alternatives().try(
    Joi.boolean(),
    Joi.string(),
    Joi.array().items(Joi.string()),
    Joi.object({
      general: Joi.boolean(),
      dailyReminderTime: Joi.string(),
      challengeNotifications: Joi.boolean(),
      progressUpdates: Joi.boolean()
    })
  ).required()
});

const updateMultiplePreferencesSchema = Joi.object({
  preferences: Joi.object({
    notifications: Joi.object({
      general: Joi.boolean(),
      dailyReminderTime: Joi.string(),
      challengeNotifications: Joi.boolean(),
      progressUpdates: Joi.boolean()
    }),
    darkMode: Joi.boolean(),
    fontSize: Joi.string().valid('small', 'medium', 'large'),
    preferredContentFormat: Joi.string().valid('video', 'text', 'audio', 'mixed'),
    enableHints: Joi.boolean(),
    autoPlayAudio: Joi.boolean(),
    showStepSolutions: Joi.boolean(),
    leaderboardVisibility: Joi.boolean(),
    allowFriendRequests: Joi.boolean(),
    multilingualSupport: Joi.array().items(Joi.string())
  }).min(1).required()
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
  updateMultiplePreferencesSchema
};
