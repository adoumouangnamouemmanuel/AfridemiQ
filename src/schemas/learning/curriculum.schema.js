const Joi = require("joi");

const createCurriculumSchema = Joi.object({
  country: Joi.string().required().trim().max(100).messages({
    "any.required": "Le pays est requis",
    "string.max": "Le nom du pays ne peut pas dépasser 100 caractères",
  }),
  educationLevel: Joi.string()
    .valid("primaire", "secondaire", "superieur")
    .required()
    .messages({
      "any.required": "Le niveau d'éducation est requis",
      "any.only":
        "Le niveau d'éducation doit être primaire, secondaire ou superieur",
    }),
  series: Joi.array().items(Joi.string().trim()).default([]),
  subjects: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          "string.pattern.base": "Invalid subject ID format",
        })
    )
    .default([]),
  academicYear: Joi.object({
    startDate: Joi.date().required().messages({
      "any.required": "La date de début de l'année académique est requise",
    }),
    endDate: Joi.date().greater(Joi.ref("startDate")).required().messages({
      "any.required": "La date de fin de l'année académique est requise",
      "date.greater": "La date de fin doit être postérieure à la date de début",
    }),
    terms: Joi.array()
      .items(
        Joi.object({
          term: Joi.number().integer().min(1).max(4).required().messages({
            "any.required": "Le numéro du trimestre est requis",
            "number.min": "Le trimestre doit être au moins 1",
            "number.max": "Le trimestre ne peut pas dépasser 4",
          }),
          startDate: Joi.date().required().messages({
            "any.required": "La date de début du trimestre est requise",
          }),
          endDate: Joi.date()
            .greater(Joi.ref("startDate"))
            .required()
            .messages({
              "any.required": "La date de fin du trimestre est requise",
              "date.greater":
                "La date de fin doit être postérieure à la date de début",
            }),
          holidays: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().required().trim().max(100).messages({
                  "any.required": "Le nom des vacances est requis",
                  "string.max": "Le nom ne peut pas dépasser 100 caractères",
                }),
                startDate: Joi.date().required().messages({
                  "any.required": "La date de début des vacances est requise",
                }),
                endDate: Joi.date()
                  .greater(Joi.ref("startDate"))
                  .required()
                  .messages({
                    "any.required": "La date de fin des vacances est requise",
                    "date.greater":
                      "La date de fin doit être postérieure à la date de début",
                  }),
              })
            )
            .default([]),
        })
      )
      .default([]),
  }).required(),
});

const updateCurriculumSchema = Joi.object({
  country: Joi.string().trim().max(100),
  educationLevel: Joi.string().valid("primaire", "secondaire", "superieur"),
  series: Joi.array().items(Joi.string().trim()),
  subjects: Joi.array().items(
    Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({
        "string.pattern.base": "Invalid subject ID format",
      })
  ),
  academicYear: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date().greater(Joi.ref("startDate")),
    terms: Joi.array().items(
      Joi.object({
        term: Joi.number().integer().min(1).max(4).required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().greater(Joi.ref("startDate")).required(),
        holidays: Joi.array().items(
          Joi.object({
            name: Joi.string().required().trim().max(100),
            startDate: Joi.date().required(),
            endDate: Joi.date().greater(Joi.ref("startDate")).required(),
          })
        ),
      })
    ),
  }),
  isActive: Joi.boolean(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

const getCurriculaSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  country: Joi.string().trim().optional(),
  educationLevel: Joi.string()
    .valid("primaire", "secondaire", "superieur")
    .optional(),
  series: Joi.string().trim().optional(),
  isActive: Joi.boolean().default(true),
  sortBy: Joi.string()
    .valid("country", "educationLevel", "createdAt")
    .default("country"),
  sortOrder: Joi.string().valid("asc", "desc").default("asc"),
});

const addSubjectToCurriculumSchema = Joi.object({
  subjectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "any.required": "L'ID de la matière est requis",
      "string.pattern.base": "Invalid subject ID format",
    }),
});

module.exports = {
  createCurriculumSchema,
  updateCurriculumSchema,
  getCurriculaSchema,
  addSubjectToCurriculumSchema,
};