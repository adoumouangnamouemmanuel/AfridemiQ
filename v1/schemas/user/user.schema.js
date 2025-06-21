const Joi = require("joi");
const {
  COUNTRIES,
  EXAM_TYPES,
  EDUCATION_LEVELS,
  LANGUAGES,
  GENDERS,
} = require("../../constants");

// =============== KEEP 100% INTACT - NO CHANGES ===============
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
  })
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

// =============== SIMPLIFIED MVP SCHEMAS ===============

// Basic profile update (essential fields only)
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .allow(null, ""),
  preferredLanguage: Joi.string()
    .valid(...LANGUAGES)
    .optional(),
})
  .min(1)
  .messages({
    "object.min": "Au moins un champ est requis pour mettre à jour le profil",
  });

// Africa-specific onboarding (after registration)
const onboardingSchema = Joi.object({
  country: Joi.string()
    .valid(...COUNTRIES)
    .required()
    .messages({
      "any.required": "Le pays est requis",
      "any.only":
        "Le pays doit être l'un des suivants : " + COUNTRIES.join(", "),
    }),

  examType: Joi.string()
    .valid(...EXAM_TYPES)
    .required()
    .messages({
      "any.required": "Le type d'examen est requis",
      "any.only":
        "Le type d'examen doit être l'un des suivants : " +
        EXAM_TYPES.join(", "),
    }),

  educationLevel: Joi.string()
    .valid(...EDUCATION_LEVELS)
    .required()
    .messages({
      "any.required": "Le niveau d'éducation est requis",
      "any.only":
        "Le niveau d'éducation doit être : " + EDUCATION_LEVELS.join(", "),
    }),

  preferredLanguage: Joi.string()
    .valid(...LANGUAGES)
    .required()
    .messages({
      "any.required": "La langue préférée est requise",
      "any.only": "La langue préférée doit être : " + LANGUAGES.join(", "),
    }),
});

// Password management (keep simple)
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

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Mot de passe actuel requis",
  }),
  newPassword: Joi.string().min(8).required().messages({
    "string.min": "Le nouveau mot de passe doit contenir au moins 8 caractères",
    "any.required": "Nouveau mot de passe requis",
  }),
});

// Token management
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({ "any.required": "Token de rafraîchissement requis" }),
});

// Simple user search
const searchUsersSchema = Joi.object({
  search: Joi.string().optional().allow(""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  country: Joi.string()
    .valid(...COUNTRIES)
    .optional(),
  examType: Joi.string()
    .valid(...EXAM_TYPES)
    .optional(),
  educationLevel: Joi.string()
    .valid(...EDUCATION_LEVELS)
    .optional(),
});

// Check if onboarding is complete
const checkOnboardingSchema = Joi.object({
  userId: Joi.string().required(),
});

// Update basic personal info
const updatePersonalInfoSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  dateOfBirth: Joi.date().max("now").optional(),
  gender: Joi.string()
    .valid(...GENDERS)
    .optional(),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .allow(null, ""),
})
  .min(1)
  .messages({
    "object.min": "Au moins un champ est requis",
  });

module.exports = {
  // =============== CORE AUTH (100% INTACT) ===============
  registerSchema,
  loginSchema,

  // =============== MVP FEATURES ===============
  // Onboarding
  onboardingSchema,
  checkOnboardingSchema,

  // Profile management
  updateProfileSchema,
  updatePersonalInfoSchema,

  // Password management
  passwordResetRequestSchema,
  passwordResetSchema,
  changePasswordSchema,

  // Token management
  refreshTokenSchema,

  // Search
  searchUsersSchema,
};
