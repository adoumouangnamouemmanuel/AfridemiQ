const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];
const WRITING_FORMATS = ["essay", "letter", "commentary", "summary"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];
const FRENCH_TOPICS = ["grammar", "literature", "text_analysis", "composition"];

// French Lesson Schema
const FrenchLessonSchema = new Schema(
  {
    introduction: {
      text: {
        type: String,
        trim: true,
        required: [true, "Texte d'introduction requis"],
        minlength: [10, "Texte d'introduction trop court (min 10 caractères)"],
        maxlength: [
          1000,
          "Texte d'introduction trop long (max 1000 caractères)",
        ],
      },
      videoUrl: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          "URL de la vidéo invalide",
        ],
      },
      transcript: {
        type: String,
        trim: true,
        maxlength: [5000, "Transcription trop longue (max 5000 caractères)"],
      },
      accessibility: {
        hasSubtitles: { type: Boolean, default: false },
        hasAudioDescription: { type: Boolean, default: false },
      },
    },
    literaryAnalysis: {
      type: [
        {
          text: {
            type: String,
            trim: true,
            required: [true, "Texte littéraire requis"],
            minlength: [100, "Texte trop court (min 100 caractères)"],
          },
          author: {
            type: String,
            trim: true,
            required: [true, "Auteur requis"],
            minlength: [3, "Auteur trop court (min 3 caractères)"],
          },
          title: {
            type: String,
            trim: true,
            required: [true, "Titre requis"],
            minlength: [3, "Titre trop court (min 3 caractères)"],
          },
          themes: [
            {
              type: String,
              trim: true,
              minlength: [1, "Thème trop court (min 1 caractère)"],
            },
          ],
          questions: [
            {
              question: {
                type: String,
                trim: true,
                required: [true, "Question requise"],
                minlength: [5, "Question trop courte (min 5 caractères)"],
              },
              type: {
                type: String,
                enum: {
                  values: QUESTION_TYPES,
                  message: "Type de question invalide",
                },
                required: [true, "Type de question requis"],
              },
            },
          ],
          difficultyLevel: {
            type: String,
            enum: {
              values: DIFFICULTY_LEVELS,
              message: "Niveau de difficulté invalide",
            },
            required: [true, "Niveau de difficulté requis"],
          },
          context: {
            type: String,
            trim: true,
            maxlength: [1000, "Contexte trop long (max 1000 caractères)"],
          },
          analysisQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
        },
      ],
      validate: {
        validator: (v) => v.length > 0,
        message: "Au moins une analyse littéraire est requise",
      },
    },
    grammar: {
      type: [
        {
          rule: {
            type: String,
            trim: true,
            required: [true, "Règle grammaticale requise"],
            minlength: [3, "Règle trop courte (min 3 caractères)"],
          },
          topic: {
            type: String,
            enum: {
              values: FRENCH_TOPICS,
              message: "Sujet de français invalide",
            },
            default: "grammar",
          },
          explanation: {
            type: String,
            trim: true,
            maxlength: [500, "Explication trop longue (max 500 caractères)"],
          },
          examples: [
            {
              type: String,
              trim: true,
              minlength: [1, "Exemple trop court (min 1 caractère)"],
            },
          ],
          difficultyLevel: {
            type: String,
            enum: {
              values: DIFFICULTY_LEVELS,
              message: "Niveau de difficulté invalide",
            },
            required: [true, "Niveau de difficulté requis"],
          },
          grammarExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
        },
      ],
      validate: {
        validator: (v) => v.length > 0,
        message: "Au moins une règle grammaticale est requise",
      },
    },
    vocabulary: {
      type: [
        {
          word: {
            type: String,
            trim: true,
            required: [true, "Mot requis"],
            minlength: [1, "Mot trop court (min 1 caractère)"],
          },
          topic: {
            type: String,
            enum: {
              values: FRENCH_TOPICS,
              message: "Sujet de français invalide",
            },
            default: "vocabulary",
          },
          definition: {
            type: String,
            trim: true,
            required: [true, "Définition requise"],
            minlength: [5, "Définition trop courte (min 5 caractères)"],
          },
          partOfSpeech: {
            type: String,
            trim: true,
            maxlength: [
              50,
              "Partie du discours trop longue (max 50 caractères)",
            ],
          },
          examples: [
            {
              type: String,
              trim: true,
              minlength: [1, "Exemple trop court (min 1 caractère)"],
            },
          ],
          pronunciation: {
            type: String,
            trim: true,
            maxlength: [100, "Prononciation trop longue (max 100 caractères)"],
          },
          synonyms: [
            {
              type: String,
              trim: true,
              minlength: [1, "Synonyme trop court (min 1 caractère)"],
            },
          ],
          difficultyLevel: {
            type: String,
            enum: {
              values: DIFFICULTY_LEVELS,
              message: "Niveau de difficulté invalide",
            },
            required: [true, "Niveau de difficulté requis"],
          },
          vocabularyQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
        },
      ],
      validate: {
        validator: (v) => v.length > 0,
        message: "Au moins un mot de vocabulaire est requis",
      },
    },
    writingSkills: {
      type: [
        {
          format: {
            type: String,
            enum: {
              values: WRITING_FORMATS,
              message: "Format d'écriture invalide",
            },
            required: [true, "Format d'écriture requis"],
          },
          topic: {
            type: String,
            enum: {
              values: FRENCH_TOPICS,
              message: "Sujet de français invalide",
            },
            default: "composition",
          },
          guidelines: [
            {
              type: String,
              trim: true,
              minlength: [1, "Ligne directrice trop courte (min 1 caractère)"],
            },
          ],
          prompts: [
            {
              prompt: {
                type: String,
                trim: true,
                required: [true, "Prompt requis"],
                minlength: [10, "Prompt trop court (min 10 caractères)"],
              },
              instructions: {
                type: String,
                trim: true,
                maxlength: [
                  500,
                  "Instructions trop longues (max 500 caractères)",
                ],
              },
            },
          ],
          modelAnswer: {
            type: String,
            trim: true,
            maxlength: [
              2000,
              "Réponse modèle trop longue (max 2000 caractères)",
            ],
          },
          difficultyLevel: {
            type: String,
            enum: {
              values: DIFFICULTY_LEVELS,
              message: "Niveau de difficulté invalide",
            },
            required: [true, "Niveau de difficulté requis"],
          },
          writingExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
        },
      ],
      validate: {
        validator: (v) => v.length > 0,
        message: "Au moins une compétence d'écriture est requise",
      },
    },
    oralSkills: [
      {
        topic: {
          type: String,
          trim: true,
          required: [true, "Sujet requis"],
          minlength: [3, "Sujet trop court (min 3 caractères)"],
        },
        instructions: {
          type: String,
          trim: true,
          maxlength: [500, "Instructions trop longues (max 500 caractères)"],
        },
        sampleDialogue: {
          type: String,
          trim: true,
          maxlength: [1000, "Dialogue exemple trop long (max 1000 caractères)"],
        },
        pronunciationGuide: {
          type: String,
          trim: true,
          maxlength: [
            500,
            "Guide de prononciation trop long (max 500 caractères)",
          ],
        },
        difficultyLevel: {
          type: String,
          enum: {
            values: DIFFICULTY_LEVELS,
            message: "Niveau de difficulté invalide",
          },
          required: [true, "Niveau de difficulté requis"],
        },
        oralExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      },
    ],
    workedExamples: [
      {
        type: {
          type: String,
          enum: {
            values: WRITING_FORMATS.concat([
              "text_analysis",
              "grammar_correction",
            ]),
            message: "Type d'exemple invalide",
          },
          required: [true, "Type d'exemple requis"],
        },
        problem: {
          type: String,
          trim: true,
          required: [true, "Problème requis"],
          minlength: [10, "Problème trop court (min 10 caractères)"],
        },
        solution: {
          type: String,
          trim: true,
          maxlength: [2000, "Solution trop longue (max 2000 caractères)"],
        },
        annotations: [
          {
            type: String,
            trim: true,
            minlength: [1, "Annotation trop courte (min 1 caractère)"],
          },
        ],
        difficultyLevel: {
          type: String,
          enum: {
            values: DIFFICULTY_LEVELS,
            message: "Niveau de difficulté invalide",
          },
          required: [true, "Niveau de difficulté requis"],
        },
      },
    ],
    practiceExercises: {
      type: [
        {
          exerciseId: {
            type: Schema.Types.ObjectId,
            ref: "Exercise",
            required: [true, "Identifiant d'exercice requis"],
          },
          type: {
            type: String,
            enum: {
              values: EXERCISE_TYPES,
              message: "Type d'exercice invalide",
            },
            required: [true, "Type d'exercice requis"],
          },
          description: {
            type: String,
            trim: true,
            maxlength: [500, "Description trop longue (max 500 caractères)"],
          },
          difficultyLevel: {
            type: String,
            enum: {
              values: DIFFICULTY_LEVELS,
              message: "Niveau de difficulté invalide",
            },
            required: [true, "Niveau de difficulté requis"],
          },
        },
      ],
      validate: {
        validator: (v) => v.length > 0,
        message: "Au moins un exercice pratique est requis",
      },
    },
    interactiveElements: [
      {
        elementType: {
          type: String,
          enum: {
            values: INTERACTIVE_ELEMENT_TYPES,
            message: "Type d'élément interactif invalide",
          },
          required: [true, "Type d'élément interactif requis"],
        },
        url: {
          type: String,
          trim: true,
          required: [true, "URL de l'élément interactif requis"],
          match: [
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
            "URL de l'élément interactif invalide",
          ],
        },
        instructions: {
          type: String,
          trim: true,
          maxlength: [500, "Instructions trop longues (max 500 caractères)"],
        },
        offlineAvailable: { type: Boolean, default: false },
      },
    ],
    summary: {
      keyTakeaways: {
        type: [String],
        validate: {
          validator: (v) => v.every((val) => val.trim().length > 0),
          message: "Les points clés ne peuvent pas être vides",
        },
      },
      suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    learningObjectives: {
      type: [String],
      validate: {
        validator: (v) => v.every((val) => val.trim().length > 0),
        message: "Les objectifs d'apprentissage ne peuvent pas être vides",
      },
    },
    gamification: {
      badges: [
        {
          type: String,
          trim: true,
          minlength: [1, "Badge trop court (min 1 caractère)"],
        },
      ],
      points: {
        type: Number,
        default: 0,
        min: [0, "Les points ne peuvent pas être négatifs"],
      },
    },
    progressTracking: {
      completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      completionRate: {
        type: Number,
        default: 0,
        min: [0, "Le taux de complétion ne peut pas être négatif"],
        max: [100, "Le taux de complétion ne peut pas dépasser 100"],
      },
    },
    accessibilityOptions: {
      hasBraille: { type: Boolean, default: false },
      hasSignLanguage: { type: Boolean, default: false },
      languages: [
        {
          type: String,
          trim: true,
          minlength: [1, "Langue trop courte (min 1 caractère)"],
        },
      ],
    },
    premiumOnly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes for performance
FrenchLessonSchema.index({ "literaryAnalysis.analysisQuizId": 1 });
FrenchLessonSchema.index({ "grammar.grammarExerciseId": 1 });
FrenchLessonSchema.index({ "vocabulary.vocabularyQuizId": 1 });
FrenchLessonSchema.index({ "writingSkills.writingExerciseId": 1 });
FrenchLessonSchema.index({ "oralSkills.oralExerciseId": 1 });
FrenchLessonSchema.index({ "practiceExercises.exerciseId": 1 });
FrenchLessonSchema.index({ prerequisites: 1 });
FrenchLessonSchema.index({ "summary.suggestedNextTopics": 1 });
FrenchLessonSchema.index({ "progressTracking.completedBy": 1 });

// Pre-save hook for validation
FrenchLessonSchema.pre("save", async function (next) {
  try {
    // Validate quiz IDs
    const quizIds = [
      ...this.literaryAnalysis
        .filter((a) => a.analysisQuizId)
        .map((a) => a.analysisQuizId),
      ...this.vocabulary
        .filter((v) => v.vocabularyQuizId)
        .map((v) => v.vocabularyQuizId),
    ];
    if (quizIds.length > 0) {
      const validQuizzes = await mongoose
        .model("Quiz")
        .countDocuments({ _id: { $in: quizIds } });
      if (validQuizzes !== quizIds.length) {
        throw new Error(
          "Identifiants de quiz invalides dans analyse littéraire ou vocabulaire"
        );
      }
    }

    // Validate exercise IDs
    const exerciseIds = [
      ...this.grammar
        .filter((g) => g.grammarExerciseId)
        .map((g) => g.grammarExerciseId),
      ...this.writingSkills
        .filter((w) => w.writingExerciseId)
        .map((w) => w.writingExerciseId),
      ...this.oralSkills
        .filter((o) => o.oralExerciseId)
        .map((o) => o.oralExerciseId),
      ...this.practiceExercises.map((p) => p.exerciseId),
    ];
    if (exerciseIds.length > 0) {
      const validExercises = await mongoose
        .model("Exercise")
        .countDocuments({ _id: { $in: exerciseIds } });
      if (validExercises !== exerciseIds.length) {
        throw new Error(
          "Identifiants d'exercices invalides dans grammaire, compétences d'écriture, compétences orales ou exercices pratiques"
        );
      }
    }

    // Validate topic IDs
    const topicIds = [
      ...this.prerequisites,
      ...this.summary.suggestedNextTopics,
    ];
    if (topicIds.length > 0) {
      const validTopics = await mongoose
        .model("Topic")
        .countDocuments({ _id: { $in: topicIds } });
      if (validTopics !== topicIds.length) {
        throw new Error(
          "Identifiants de sujets invalides dans prérequis ou suggestions"
        );
      }
    }

    // Validate completedBy users
    if (this.progressTracking.completedBy.length > 0) {
      const validUsers = await mongoose
        .model("User")
        .countDocuments({ _id: { $in: this.progressTracking.completedBy } });
      if (validUsers !== this.progressTracking.completedBy.length) {
        throw new Error(
          "Identifiants d'utilisateurs invalides dans completedBy"
        );
      }
    }

    // Ensure premiumOnly alignment with parent Lesson
    const baseLesson = await mongoose.model("Lesson").findById(this._id);
    if (this.premiumOnly && baseLesson && !baseLesson.premiumOnly) {
      throw new Error(
        "Leçon premiumOnly doit hériter de premiumOnly du parent"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for estimated time
FrenchLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    (this.literaryAnalysis?.length || 0) * 15 +
      (this.grammar?.length || 0) * 10 +
      (this.vocabulary?.length || 0) * 5 +
      (this.writingSkills?.length || 0) * 20 +
      (this.oralSkills?.length || 0) * 15 +
      (this.practiceExercises?.length || 0) * 10
  ); // Minutes
});

// Virtual for completion status
FrenchLessonSchema.virtual("completionStatus").get(function () {
  if (!this.progressTracking) return "not_started";
  const completion = this.progressTracking.completionRate || 0;
  if (completion >= 100) return "completed";
  if (completion > 0) return "in_progress";
  return "not_started";
});

module.exports = {
  FrenchLesson: mongoose
    .model("Lesson")
    .discriminator("french", FrenchLessonSchema),
};