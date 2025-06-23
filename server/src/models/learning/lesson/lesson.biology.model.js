const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const BIOLOGY_TOPICS = ["cell_biology", "genetics", "ecology", "physiology"];
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];
const MEDIA_TYPES = ["image", "audio", "video"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];

// Biology Lesson Schema
const BiologyLessonSchema = new Schema(
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
        match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, "URL de la vidéo invalide"],
      },
      transcript: {
        type: String,
        trim: true,
        maxlength: [5000, "Transcription trop longue (max 5000 caractères)"],
      },
      accessibility: {
        hasSubtitles: Boolean,
        hasAudioDescription: Boolean,
      },
    },
    concepts: {
      type: [
        {
          name: {
            type: String,
            trim: true,
            required: [true, "Nom du concept requis"],
            minlength: [3, "Nom du concept trop court (min 3 caractères)"],
          },
          topic: {
            type: String,
            enum: {
              values: BIOLOGY_TOPICS,
              message: "Sujet de biologie invalide",
            },
            required: [true, "Sujet requis"],
          },
          description: {
            type: String,
            trim: true,
            required: [true, "Description requise"],
            minlength: [10, "Description trop courte (min 10 caractères)"],
          },
          keyProcesses: [
            {
              name: {
                type: String,
                trim: true,
                minlength: [
                  3,
                  "Nom du processus trop court (min 3 caractères)",
                ],
              },
              explanation: {
                type: String,
                trim: true,
                minlength: [10, "Explication trop courte (min 10 caractères)"],
              },
            },
          ],
          examples: [
            {
              scenario: {
                type: String,
                trim: true,
                minlength: [10, "Scénario trop court (min 10 caractères)"],
              },
              explanation: {
                type: String,
                trim: true,
                minlength: [10, "Explication trop courte (min 10 caractères)"],
              },
            },
          ],
          visualAid: {
            mediaType: {
              type: String,
              enum: {
                values: MEDIA_TYPES,
                message: "Type de média invalide",
              },
            },
            url: {
              type: String,
              trim: true,
              match: [/^https?:\/\/[^\s$.?#].[^\s]*$/, "URL du média invalide"],
            },
            altText: {
              type: String,
              trim: true,
              maxlength: [
                200,
                "Texte alternatif trop long (max 200 caractères)",
              ],
            },
          },
          difficultyLevel: {
            type: String,
            enum: {
              values: DIFFICULTY_LEVELS,
              message: "Niveau de difficulté invalide",
            },
            required: [true, "Niveau de difficulté requis"],
          },
          conceptQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
        },
      ],
      validate: {
        validator: (v) => v.length > 0,
        message: "Au moins un concept est requis",
      },
    },
    experiments: [
      {
        title: {
          type: String,
          trim: true,
          required: [true, "Titre requis"],
          minlength: [3, "Titre trop court (min 3 caractères)"],
        },
        objective: {
          type: String,
          trim: true,
          maxlength: [500, "Objectif trop long (max 500 caractères)"],
        },
        materials: [{ type: String, trim: true }],
        procedure: [{ type: String, trim: true }],
        expectedResults: {
          type: String,
          trim: true,
          maxlength: [
            1000,
            "Résultats attendus trop longs (max 1000 caractères)",
          ],
        },
        safetyNotes: [{ type: String, trim: true }],
        dataTableTemplate: [
          {
            variable: { type: String, trim: true },
            unit: { type: String, trim: true },
            values: [Number],
          },
        ],
        diagram: {
          mediaType: {
            type: String,
            enum: {
              values: MEDIA_TYPES,
              message: "Type de média invalide",
            },
          },
          url: {
            type: String,
            trim: true,
            match: [
              /^https?:\/\/[^\s$.?#].[^\s]*$/,
              "URL du diagramme invalide",
            ],
          },
          altText: {
            type: String,
            trim: true,
            maxlength: [200, "Texte alternatif trop long (max 200 caractères)"],
          },
        },
        difficultyLevel: {
          type: String,
          enum: {
            values: DIFFICULTY_LEVELS,
            message: "Niveau de difficulté invalide",
          },
          required: [true, "Niveau de difficulté requis"],
        },
        experimentExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      },
    ],
    caseStudies: [
      {
        title: {
          type: String,
          trim: true,
          required: [true, "Titre requis"],
          minlength: [3, "Titre trop court (min 3 caractères)"],
        },
        context: {
          type: String,
          trim: true,
          maxlength: [1000, "Contexte trop long (max 1000 caractères)"],
        },
        questions: [
          {
            question: {
              type: String,
              trim: true,
              minlength: [5, "Question trop courte (min 5 caractères)"],
            },
            type: {
              type: String,
              enum: {
                values: QUESTION_TYPES,
                message: "Type de question invalide",
              },
            },
          },
        ],
        keyFindings: {
          type: String,
          trim: true,
          maxlength: [500, "Résultats clés trop longs (max 500 caractères)"],
        },
        difficultyLevel: {
          type: String,
          enum: {
            values: DIFFICULTY_LEVELS,
            message: "Niveau de difficulté invalide",
          },
          required: [true, "Niveau de difficulté requis"],
        },
        caseStudyQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    workedExamples: [
      {
        problem: {
          type: String,
          trim: true,
          required: [true, "Problème requis"],
          minlength: [10, "Problème trop court (min 10 caractères)"],
        },
        type: {
          type: String,
          enum: {
            values: EXERCISE_TYPES,
            message: "Type d'exercice invalide",
          },
          required: [true, "Type d'exercice requis"],
        },
        solution: {
          type: String,
          trim: true,
          maxlength: [1000, "Solution trop longue (max 1000 caractères)"],
        },
        annotations: {
          type: [{ type: String, trim: true }],
          validate: {
            validator: (v) => v.every((val) => val.length >= 1),
            message: "Les annotations ne peuvent pas être vides",
          },
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
            /^https?:\/\/[^\s$.?#].[^\s]*$/,
            "URL de l'élément interactif invalide",
          ],
        },
        instructions: {
          type: String,
          trim: true,
          maxlength: [500, "Instructions trop longues (max 500 caractères)"],
        },
        offlineAvailable: {
          type: Boolean,
          default: false,
        },
      },
    ],
    summary: {
      keyTakeaways: {
        type: [String],
        validate: {
          validator: (v) => v.every((val) => val.trim().length >= 1),
          message: "Les points clés ne peuvent pas être vides",
        },
      },
      suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    learningObjectives: {
      type: [String],
      validate: {
        validator: (v) => v.every((val) => val.trim().length >= 1),
        message: "Les objectifs d'apprentissage ne peuvent pas être vides",
      },
    },
    gamification: {
      badges: [{ type: String, trim: true }],
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
      hasBraille: Boolean,
      hasSignLanguage: Boolean,
      languages: [{ type: String, trim: true }],
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes for performance
BiologyLessonSchema.index({ "concepts.conceptQuizId": 1 });
BiologyLessonSchema.index({ "experiments.experimentExerciseId": 1 });
BiologyLessonSchema.index({ "caseStudies.caseStudyQuizId": 1 });
BiologyLessonSchema.index({ "practiceExercises.exerciseId": 1 });
BiologyLessonSchema.index({ prerequisites: 1 });
BiologyLessonSchema.index({ "summary.suggestedNextTopics": 1 });
BiologyLessonSchema.index({ "progressTracking.completedBy": 1 });

// Pre-save hook for validation
BiologyLessonSchema.pre("save", async function (next) {
  try {
    // Validate quizzes
    const quizIds = [
      ...this.concepts
        .filter((c) => c.conceptQuizId)
        .map((c) => c.conceptQuizId),
      ...this.caseStudies
        .filter((cs) => cs.caseStudyQuizId)
        .map((cs) => cs.caseStudyQuizId),
    ];
    if (quizIds.length > 0) {
      const validQuizzes = await mongoose
        .model("Quiz")
        .countDocuments({ _id: { $in: quizIds } });
      if (validQuizzes !== quizIds.length) {
        throw new Error(
          "Identifiants de quiz invalides dans les concepts ou études de cas"
        );
      }
    }

    // Validate exercises
    const exerciseIds = [
      ...this.experiments
        .filter((e) => e.experimentExerciseId)
        .map((e) => e.experimentExerciseId),
      ...this.practiceExercises.map((p) => p.exerciseId),
    ];
    if (exerciseIds.length > 0) {
      const validExercises = await mongoose
        .model("Exercise")
        .countDocuments({ _id: { $in: exerciseIds } });
      if (validExercises !== exerciseIds.length) {
        throw new Error(
          "Identifiants d'exercices invalides dans les expériences ou exercices pratiques"
        );
      }
    }

    // Validate topics
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
          "Identifiants de sujets invalides dans les prérequis ou suggestions"
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

    // Ensure premiumOnly alignment
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
BiologyLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    (this.concepts?.length || 0) * 15 +
      (this.experiments?.length || 0) * 20 +
      (this.caseStudies?.length || 0) * 15 +
      (this.practiceExercises?.length || 0) * 10 +
      (this.interactiveElements?.length || 0) * 5
  ); // Minutes
});

// Virtual for completion status
BiologyLessonSchema.virtual("completionStatus").get(function () {
  if (!this.progressTracking) return "not_started";
  const completion = this.progressTracking.completionRate || 0;
  if (completion >= 100) return "completed";
  if (completion > 0) return "in_progress";
  return "not_started";
});

module.exports = {
  BiologyLesson: mongoose
    .model("Lesson")
    .discriminator("biology", BiologyLessonSchema),
};