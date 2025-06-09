const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const baseLessonSchema = require("./lesson.schema").createLessonSchema;

const chemistryLessonSchema = baseLessonSchema.append({
  subjectType: Joi.string().valid("chemistry").required().messages({
    "any.only": "Type de sujet doit être 'chemistry'",
    "any.required": "Type de sujet requis",
  }),
  introduction: Joi.object({
    text: Joi.string().trim().min(10).max(1000).required().messages({
      "string.min": "Texte d'introduction trop court (min 10 caractères)",
      "string.max": "Texte d'introduction trop long (max 1000 caractères)",
      "any.required": "Texte d'introduction requis",
    }),
    videoUrl: Joi.string().uri().optional().messages({
      "string.uri": "URL de la vidéo invalide",
    }),
    transcript: Joi.string().trim().max(5000).optional().messages({
      "string.max": "Transcription trop longue (max 5000 caractères)",
    }),
    accessibility: Joi.object({
      hasSubtitles: Joi.boolean().default(false),
      hasAudioDescription: Joi.boolean().default(false),
    }).optional(),
  }).required(),
  concepts: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(3).required().messages({
          "string.min": "Nom du concept trop court (min 3 caractères)",
          "any.required": "Nom du concept requis",
        }),
        topic: Joi.string()
          .valid(
            "stoichiometry",
            "organic_chemistry",
            "thermodynamics",
            "acids_bases"
          )
          .required()
          .messages({
            "any.only": "Sujet de chimie invalide",
            "any.required": "Sujet requis",
          }),
        description: Joi.string().trim().min(10).required().messages({
          "string.min": "Description trop courte (min 10 caractères)",
          "any.required": "Description requise",
        }),
        keyEquations: Joi.array()
          .items(
            Joi.object({
              equation: Joi.string().trim().min(1).messages({
                "string.min": "Équation trop courte (min 1 caractère)",
              }),
              explanation: Joi.string().trim().min(1).messages({
                "string.min": "Explication trop courte (min 1 caractère)",
              }),
            })
          )
          .optional(),
        examples: Joi.array()
          .items(
            Joi.object({
              problem: Joi.string().trim().min(10).messages({
                "string.min": "Problème trop court (min 10 caractères)",
              }),
              solutionSteps: Joi.array()
                .items(
                  Joi.string().trim().min(1).messages({
                    "string.min":
                      "Étape de solution trop courte (min 1 caractère)",
                  })
                )
                .optional(),
              answer: Joi.string().trim().min(1).messages({
                "string.min": "Réponse trop courte (min 1 caractère)",
              }),
            })
          )
          .optional(),
        visualAid: Joi.object({
          mediaType: Joi.string()
            .valid("image", "audio", "video")
            .optional()
            .messages({
              "any.only": "Type de média invalide",
            }),
          url: Joi.string().uri().optional().messages({
            "string.uri": "URL du média invalide",
          }),
          altText: Joi.string().trim().max(500).optional().messages({
            "string.max": "Texte alternatif trop long (max 500 caractères)",
          }),
        }).optional(),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
        conceptQuizId: Joi.objectId().optional().messages({
          "string.pattern.base": "Identifiant de quiz invalide",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins un concept est requis",
    }),
  experiments: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().trim().min(3).required().messages({
          "string.min": "Titre trop court (min 3 caractères)",
          "any.required": "Titre de l'expérience requis",
        }),
        objective: Joi.string().trim().max(500).optional().messages({
          "string.max": "Objectif trop long (max 500 caractères)",
        }),
        materials: Joi.array()
          .items(
            Joi.string().trim().min(1).messages({
              "string.min": "Matériel trop court (min 1 caractère)",
            })
          )
          .optional(),
        procedure: Joi.array()
          .items(
            Joi.string().trim().min(1).messages({
              "string.min": "Étape de procédure trop courte (min 1 caractère)",
            })
          )
          .optional(),
        expectedResults: Joi.string().trim().max(1000).optional().messages({
          "string.max": "Résultats attendus trop longs (max 1000 caractères)",
        }),
        safetyNotes: Joi.array()
          .items(
            Joi.string().trim().min(1).messages({
              "string.min": "Note de sécurité trop courte (min 1 caractère)",
            })
          )
          .optional(),
        dataTableTemplate: Joi.array()
          .items(
            Joi.object({
              variable: Joi.string().trim().min(1).messages({
                "string.min": "Variable trop courte (min 1 caractère)",
              }),
              unit: Joi.string().trim().min(1).messages({
                "string.min": "Unité trop courte (min 1 caractère)",
              }),
              values: Joi.array().items(Joi.number()).optional(),
            })
          )
          .optional(),
        diagram: Joi.object({
          mediaType: Joi.string()
            .valid("image", "audio", "video")
            .optional()
            .messages({
              "any.only": "Type de média invalide",
            }),
          url: Joi.string().uri().optional().messages({
            "string.uri": "URL du diagramme invalide",
          }),
          altText: Joi.string().trim().max(500).optional().messages({
            "string.max": "Texte alternatif trop long (max 500 caractères)",
          }),
        }).optional(),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
        experimentExerciseId: Joi.objectId().optional().messages({
          "string.pattern.base": "Identifiant d'exercice invalide",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins une expérience est requise",
    }),
  reactionAnalysis: Joi.array()
    .items(
      Joi.object({
        reaction: Joi.string().trim().min(3).required().messages({
          "string.min": "Réaction trop courte (min 3 caractères)",
          "any.required": "Réaction chimique requise",
        }),
        type: Joi.string()
          .valid(
            "synthesis",
            "decomposition",
            "redox",
            "acid_base",
            "precipitation"
          )
          .required()
          .messages({
            "any.only": "Type de réaction invalide",
            "any.required": "Type de réaction requis",
          }),
        balancedEquation: Joi.string().trim().min(3).optional().messages({
          "string.min": "Équation équilibrée trop courte (min 3 caractères)",
        }),
        explanation: Joi.string().trim().max(1000).optional().messages({
          "string.max": "Explication trop longue (max 1000 caractères)",
        }),
        applications: Joi.array()
          .items(
            Joi.string().trim().min(1).messages({
              "string.min": "Application trop courte (min 1 caractère)",
            })
          )
          .optional(),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
        reactionQuizId: Joi.objectId().optional().messages({
          "string.pattern.base": "Identifiant de quiz invalide",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins une analyse de réaction est requise",
    }),
  workedExamples: Joi.array()
    .items(
      Joi.object({
        problem: Joi.string().trim().min(10).required().messages({
          "string.min": "Problème trop court (min 10 caractères)",
          "any.required": "Problème requis",
        }),
        type: Joi.string()
          .valid("practice", "quiz", "assignment", "exam")
          .required()
          .messages({
            "any.only": "Type d'exemple invalide",
            "any.required": "Type d'exemple requis",
          }),
        solutionSteps: Joi.array()
          .items(
            Joi.string().trim().min(1).messages({
              "string.min": "Étape de solution trop courte (min 1 caractère)",
            })
          )
          .optional(),
        answer: Joi.string().trim().min(1).optional().messages({
          "string.min": "Réponse trop courte (min 1 caractère)",
        }),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
      })
    )
    .optional(),
  practiceExercises: Joi.array()
    .items(
      Joi.object({
        exerciseId: Joi.objectId().required().messages({
          "any.required": "Identifiant d'exercice requis",
          "string.pattern.base": "Identifiant d'exercice invalide",
        }),
        type: Joi.string()
          .valid("practice", "quiz", "assignment", "exam")
          .required()
          .messages({
            "any.only": "Type d'exercice invalide",
            "any.required": "Type d'exercice requis",
          }),
        description: Joi.string().trim().max(500).optional().messages({
          "string.max": "Description trop longue (max 500 caractères)",
        }),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins un exercice pratique est requis",
    }),
  interactiveElements: Joi.array()
    .items(
      Joi.object({
        elementType: Joi.string()
          .valid("geogebra", "desmos", "video", "quiz")
          .required()
          .messages({
            "any.only": "Type d'élément interactif invalide",
            "any.required": "Type d'élément interactif requis",
          }),
        url: Joi.string().uri().required().messages({
          "string.uri": "URL de l'élément interactif invalide",
          "any.required": "URL de l'élément interactif requis",
        }),
        instructions: Joi.string().trim().max(500).optional().messages({
          "string.max": "Instructions trop longues (max 500 caractères)",
        }),
        offlineAvailable: Joi.boolean().default(false),
      })
    )
    .optional(),
  summary: Joi.object({
    keyTakeaways: Joi.array()
      .items(Joi.string().trim().min(1))
      .optional()
      .messages({
        "string.min": "Les points clés ne peuvent pas être vides",
      }),
    suggestedNextTopics: Joi.array().items(Joi.objectId()).optional().messages({
      "string.pattern.base": "Identifiant de sujet invalide",
    }),
  }).optional(),
  prerequisites: Joi.array().items(Joi.objectId()).optional().messages({
    "string.pattern.base": "Identifiant de sujet invalide",
  }),
  learningObjectives: Joi.array()
    .items(Joi.string().trim().min(1))
    .optional()
    .messages({
      "string.min": "Les objectifs d'apprentissage ne peuvent pas être vides",
    }),
  gamification: Joi.object({
    badges: Joi.array().items(Joi.string().trim().min(1)).optional().messages({
      "string.min": "Badge trop court (min 1 caractère)",
    }),
    points: Joi.number().min(0).default(0).messages({
      "number.min": "Les points ne peuvent pas être négatifs",
    }),
  }).optional(),
  progressTracking: Joi.object({
    completedBy: Joi.array().items(Joi.objectId()).optional().messages({
      "string.pattern.base": "Identifiant d'utilisateur invalide",
    }),
    completionRate: Joi.number().min(0).max(100).default(0).messages({
      "number.min": "Le taux de complétion ne peut pas être négatif",
      "number.max": "Le taux de complétion ne peut pas dépasser 100",
    }),
  }).optional(),
  accessibilityOptions: Joi.object({
    hasBraille: Joi.boolean().default(false),
    hasSignLanguage: Joi.boolean().default(false),
    languages: Joi.array()
      .items(
        Joi.string().trim().min(1).messages({
          "string.min": "Langue trop courte (min 1 caractère)",
        })
      )
      .optional(),
  }).optional(),
  premiumOnly: Joi.boolean().default(false),
});

const updateChemistryLessonSchema = chemistryLessonSchema.fork(
  [
    "topicId",
    "subjectType",
    "introduction",
    "concepts",
    "experiments",
    "reactionAnalysis",
    "workedExamples",
    "practiceExercises",
    "interactiveElements",
  ],
  (schema) => schema.optional()
);

const getChemistryLessonSchema = Joi.object({
  id: Joi.objectId().required().messages({
    "any.required": "Identifiant de leçon requis",
    "string.pattern.base": "Identifiant de leçon invalide",
  }),
});

module.exports = {
  createChemistryLessonSchema: chemistryLessonSchema,
  updateChemistryLessonSchema,
  getChemistryLessonSchema,
};
