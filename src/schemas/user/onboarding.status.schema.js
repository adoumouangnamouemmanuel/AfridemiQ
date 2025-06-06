const Joi = require("joi");

// Valid onboarding steps
const VALID_STEPS = [
  "profile_setup",
  "preferences",
  "subjects_selection",
  "exam_selection",
  "goals_setting",
  "tutorial_completion",
  "completed",
];

const completeStepSchema = Joi.object({
  stepName: Joi.string()
    .valid(...VALID_STEPS.filter((step) => step !== "completed"))
    .required()
    .messages({
      "any.only": "Nom d'étape invalide",
      "any.required": "Le nom de l'étape est requis",
    }),
});

const updateCurrentStepSchema = Joi.object({
  stepName: Joi.string()
    .valid(...VALID_STEPS)
    .required()
    .messages({
      "any.only": "Nom d'étape invalide",
      "any.required": "Le nom de l'étape est requis",
    }),
});

module.exports = {
  completeStepSchema,
  updateCurrentStepSchema,
};