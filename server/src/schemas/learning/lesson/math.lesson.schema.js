const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const baseLessonSchema = require("./lesson.schema").createLessonSchema;

const mathLessonSchema = baseLessonSchema.append({
  subjectType: Joi.string().valid("math").required().messages({
    "any.only": "Type de sujet doit être 'math'",
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
      hasSubtitles: Joi.boolean().optional(),
      hasAudioDescription: Joi.boolean().optional(),
    }).optional(),
  }).required(),
  concepts: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(3).required().messages({
          "string.min": "Nom du concept trop court (min 3 caractères)",
          "any.required": "Nom du concept requis",
        }),
        definition: Joi.string().trim().min(10).required().messages({
          "string.min": "Définition trop courte (min 10 caractères)",
          "any.required": "Définition requise",
        }),
        topic: Joi.string()
          .valid("algebra", "geometry", "calculus", "statistics")
          .required()
          .messages({
            "any.only": "Sujet de mathématiques invalide",
            "any.required": "Sujet requis",
          }),
        explanation: Joi.string().trim().max(1000).optional().messages({
          "string.max": "Explication trop longue (max 1000 caractères)",
        }),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
        examples: Joi.array()
          .items(
            Joi.object({
              expression: Joi.string().trim().min(1).required().messages({
                "string.min": "Expression trop courte (min 1 caractère)",
                "any.required": "Expression requise",
              }),
              explanation: Joi.string().trim().max(500).optional().messages({
                "string.max": "Explication trop longue (max 500 caractères)",
              }),
              steps: Joi.array().items(Joi.string().trim()).optional(),
            })
          )
          .optional(),
        formulas: Joi.array()
          .items(
            Joi.object({
              formula: Joi.string().trim().min(1).required().messages({
                "string.min": "Formule trop courte (min 1 caractère)",
                "any.required": "Formule requise",
              }),
              useCase: Joi.string().trim().max(500).optional().messages({
                "string.max": "Cas d'utilisation trop long (max 500 caractères)",
              }),
              derivationSteps: Joi.array().items(Joi.string().trim()).optional(),
            })
          )
          .optional(),
        visualAid: Joi.object({
          mediaType: Joi.string().valid("image", "audio", "video").optional().messages({
            "any.only": "Type de média invalide",
          }),
          url: Joi.string().uri().optional().messages({
            "string.uri": "URL du média invalide",
          }),
          altText: Joi.string().trim().max(200).optional().messages({
            "string.max": "Texte alternatif trop long (max 200 caractères)",
          }),
        }).optional(),
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
  theorems: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().trim().min(3).required().messages({
          "string.min": "Titre trop court (min 3 caractères)",
          "any.required": "Titre requis",
        }),
        statement: Joi.string().trim().min(10).required().messages({
          "string.min": "Énoncé trop court (min 10 caractères)",
          "any.required": "Énoncé requis",
        }),
        proof: Joi.array().items(Joi.string().trim()).optional(),
        diagram: Joi.object({
          mediaType: Joi.string().valid("image", "audio", "video").optional().messages({
            "any.only": "Type de média invalide",
          }),
          url: Joi.string().uri().optional().messages({
            "string.uri": "URL du diagramme invalide",
          }),
          altText: Joi.string().trim().max(200).optional().messages({
            "string.max": "Texte alternatif trop long (max 200 caractères)",
          }),
        }).optional(),
        applications: Joi.array().items(Joi.string().trim()).optional(),
      })
    )
    .optional(),
  workedExamples: Joi.array()
    .items(
      Joi.object({
        problem: Joi.string().trim().min(10).required().messages({
          "string.min": "Problème trop court (min 10 caractères)",
          "any.required": "Problème requis",
        }),
        solutionSteps: Joi.array().items(Joi.string().trim()).optional(),
        answer: Joi.string().trim().max(500).optional().messages({
          "string.max": "Réponse trop longue (max 500 caractères)",
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
        offlineAvailable: Joi.boolean().optional(),
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
    badges: Joi.array().items(Joi.string().trim()).optional(),
    points: Joi.number().min(0).optional().messages({
      "number.min": "Les points ne peuvent pas être négatifs",
    }),
  }).optional(),
  progressTracking: Joi.object({
    completedBy: Joi.array().items(Joi.objectId()).optional().messages({
      "string.pattern.base": "Identifiant d'utilisateur invalide",
    }),
    completionRate: Joi.number().min(0).max(100).optional().messages({
      "number.min": "Le taux de complétion ne peut pas être négatif",
      "number.max": "Le taux de complétion ne peut pas dépasser 100",
    }),
  }).optional(),
  accessibilityOptions: Joi.object({
    hasBraille: Joi.boolean().optional(),
    hasSignLanguage: Joi.boolean().optional(),
    languages: Joi.array().items(Joi.string().trim()).optional(),
  }).optional(),
  premiumOnly: Joi.boolean().default(false),
});

const updateMathLessonSchema = mathLessonSchema.fork(
  ["topicId", "subjectType", "introduction", "concepts", "theorems", "workedExamples", "practiceExercises", "interactiveElements"],
  (schema) => schema.optional()
);

const getMathLessonSchema = Joi.object({
  id: Joi.objectId().required().messages({
    "any.required": "Identifiant de leçon requis",
    "string.pattern.base": "Identifiant de leçon invalide",
  }),
});

module.exports = {
  createMathLessonSchema: mathLessonSchema,
  updateMathLessonSchema,
  getMathLessonSchema,
};