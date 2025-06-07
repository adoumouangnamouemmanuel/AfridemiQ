const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const baseLessonSchema = require("./lesson.schema").createLessonSchema;

const frenchLessonSchema = baseLessonSchema.append({
  subjectType: Joi.string().valid("french").required().messages({
    "any.only": "Type de sujet doit être 'french'",
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
  literaryAnalysis: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().trim().min(100).required().messages({
          "string.min": "Texte littéraire trop court (min 100 caractères)",
          "any.required": "Texte littéraire requis",
        }),
        author: Joi.string().trim().min(3).required().messages({
          "string.min": "Auteur trop court (min 3 caractères)",
          "any.required": "Auteur requis",
        }),
        title: Joi.string().trim().min(3).required().messages({
          "string.min": "Titre trop court (min 3 caractères)",
          "any.required": "Titre requis",
        }),
        themes: Joi.array()
          .items(Joi.string().trim().min(1))
          .optional()
          .messages({
            "string.min": "Thème trop court (min 1 caractère)",
          }),
        questions: Joi.array()
          .items(
            Joi.object({
              question: Joi.string().trim().min(5).required().messages({
                "string.min": "Question trop courte (min 5 caractères)",
                "any.required": "Question requise",
              }),
              type: Joi.string()
                .valid("multiple_choice", "short_answer", "essay")
                .required()
                .messages({
                  "any.only": "Type de question invalide",
                  "any.required": "Type de question requis",
                }),
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
        context: Joi.string().trim().max(1000).optional().messages({
          "string.max": "Contexte trop long (max 1000 caractères)",
        }),
        analysisQuizId: Joi.objectId().optional().messages({
          "string.pattern.base": "Identifiant de quiz invalide",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins une analyse littéraire est requise",
    }),
  grammar: Joi.array()
    .items(
      Joi.object({
        rule: Joi.string().trim().min(3).required().messages({
          "string.min": "Règle grammaticale trop courte (min 3 caractères)",
          "any.required": "Règle grammaticale requise",
        }),
        topic: Joi.string()
          .valid(...["grammar", "literature", "text_analysis", "composition"])
          .default("grammar")
          .messages({
            "any.only": "Sujet de français invalide",
          }),
        explanation: Joi.string().trim().max(500).optional().messages({
          "string.max": "Explication trop longue (max 500 caractères)",
        }),
        examples: Joi.array()
          .items(Joi.string().trim().min(1))
          .optional()
          .messages({
            "string.min": "Exemple trop court (min 1 caractère)",
          }),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
        grammarExerciseId: Joi.objectId().optional().messages({
          "string.pattern.base": "Identifiant d'exercice invalide",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins une règle grammaticale est requise",
    }),
  vocabulary: Joi.array()
    .items(
      Joi.object({
        word: Joi.string().trim().min(1).required().messages({
          "string.min": "Mot trop court (min 1 caractère)",
          "any.required": "Mot requis",
        }),
        topic: Joi.string()
          .valid(...["grammar", "literature", "text_analysis", "composition"])
          .default("vocabulary")
          .messages({
            "any.only": "Sujet de français invalide",
          }),
        definition: Joi.string().trim().min(5).required().messages({
          "string.min": "Définition trop courte (min 5 caractères)",
          "any.required": "Définition requise",
        }),
        partOfSpeech: Joi.string().trim().max(50).optional().messages({
          "string.max": "Partie du discours trop longue (max 50 caractères)",
        }),
        examples: Joi.array()
          .items(Joi.string().trim().min(1))
          .optional()
          .messages({
            "string.min": "Exemple trop court (min 1 caractère)",
          }),
        pronunciation: Joi.string().trim().max(100).optional().messages({
          "string.max": "Prononciation trop longue (max 100 caractères)",
        }),
        synonyms: Joi.array()
          .items(Joi.string().trim().min(1))
          .optional()
          .messages({
            "string.min": "Synonyme trop court (min 1 caractère)",
          }),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
        vocabularyQuizId: Joi.objectId().optional().messages({
          "string.pattern.base": "Identifiant de quiz invalide",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins un mot de vocabulaire est requis",
    }),
  writingSkills: Joi.array()
    .items(
      Joi.object({
        format: Joi.string()
          .valid("essay", "letter", "commentary", "summary")
          .required()
          .messages({
            "any.only": "Format d'écriture invalide",
            "any.required": "Format d'écriture requis",
          }),
        topic: Joi.string()
          .valid(...["grammar", "literature", "text_analysis", "composition"])
          .default("composition")
          .messages({
            "any.only": "Sujet de français invalide",
          }),
        guidelines: Joi.array()
          .items(Joi.string().trim().min(1))
          .optional()
          .messages({
            "string.min": "Ligne directrice trop courte (min 1 caractère)",
          }),
        prompts: Joi.array()
          .items(
            Joi.object({
              prompt: Joi.string().trim().min(10).required().messages({
                "string.min": "Prompt trop court (min 10 caractères)",
                "any.required": "Prompt requis",
              }),
              instructions: Joi.string().trim().max(500).optional().messages({
                "string.max": "Instructions trop longues (max 500 caractères)",
              }),
            })
          )
          .optional(),
        modelAnswer: Joi.string().trim().max(2000).optional().messages({
          "string.max": "Réponse modèle trop longue (max 2000 caractères)",
        }),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
        writingExerciseId: Joi.objectId().optional().messages({
          "string.pattern.base": "Identifiant d'exercice invalide",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Au moins une compétence d'écriture est requise",
    }),
  oralSkills: Joi.array()
    .items(
      Joi.object({
        topic: Joi.string().trim().min(3).required().messages({
          "string.min": "Sujet trop court (min 3 caractères)",
          "any.required": "Sujet requis",
        }),
        instructions: Joi.string().trim().max(500).optional().messages({
          "string.max": "Instructions trop longues (max 500 caractères)",
        }),
        sampleDialogue: Joi.string().trim().max(1000).optional().messages({
          "string.max": "Dialogue exemple trop long (max 1000 caractères)",
        }),
        pronunciationGuide: Joi.string().trim().max(500).optional().messages({
          "string.max": "Guide de prononciation trop long (max 500 caractères)",
        }),
        difficultyLevel: Joi.string()
          .valid("beginner", "intermediate", "advanced")
          .required()
          .messages({
            "any.only": "Niveau de difficulté invalide",
            "any.required": "Niveau de difficulté requis",
          }),
        oralExerciseId: Joi.objectId().optional().messages({
          "string.pattern.base": "Identifiant d'exercice invalide",
        }),
      })
    )
    .optional(),
  workedExamples: Joi.array()
    .items(
      Joi.object({
        type: Joi.string()
          .valid(
            ..."essay",
            "letter",
            "commentary",
            "summary",
            "text_analysis",
            "grammar_correction"
          )
          .required()
          .messages({
            "any.only": "Type d'exemple invalide",
            "any.required": "Type d'exemple requis",
          }),
        problem: Joi.string().trim().min(10).required().messages({
          "string.min": "Problème trop court (min 10 caractères)",
          "any.required": "Problème requis",
        }),
        solution: Joi.string().trim().max(2000).optional().messages({
          "string.max": "Solution trop longue (max 2000 caractères)",
        }),
        annotations: Joi.array()
          .items(Joi.string().trim().min(1))
          .optional()
          .messages({
            "string.min": "Annotation trop courte (min 1 caractère)",
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

const updateFrenchLessonSchema = frenchLessonSchema
  .fork([
    "topicId",
    "title",
    "subjectType",
    "interactivityLevel",
    "metadata.createdBy",
    "introduction.text",
    "literaryAnalysis",
    "grammar",
    "vocabulary",
    "writingSkills",
    "practiceExercises",
  ])
  .optional()
  .min(1)
  .messages({
    "object.min": "Au moins un champ doit être fourni pour la mise à jour",
  });

module.exports = {
  frenchLessonSchema,
  updateFrenchLessonSchema,
};