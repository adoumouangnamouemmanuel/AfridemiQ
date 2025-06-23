const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const MEDIA_TYPES = ["image", "audio", "video"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];
const MATH_TOPICS = ["algebra", "geometry", "calculus", "statistics"];

// Math Lesson Schema
const MathLessonSchema = new Schema(
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
          definition: {
            type: String,
            trim: true,
            required: [true, "Définition requise"],
            minlength: [10, "Définition trop courte (min 10 caractères)"],
          },
          topic: {
            type: String,
            enum: {
              values: MATH_TOPICS,
              message: "Sujet de mathématiques invalide",
            },
            required: [true, "Sujet requis"],
          },
          explanation: {
            type: String,
            trim: true,
            maxlength: [1000, "Explication trop longue (max 1000 caractères)"],
          },
          difficultyLevel: {
            type: String,
            enum: {
              values: DIFFICULTY_LEVELS,
              message: "Niveau de difficulté invalide",
            },
            required: [true, "Niveau de difficulté requis"],
          },
          examples: [
            {
              expression: {
                type: String,
                trim: true,
                required: [true, "Expression requise"],
                minlength: [1, "Expression trop courte (min 1 caractère)"],
              },
              explanation: {
                type: String,
                trim: true,
                maxlength: [
                  500,
                  "Explication trop longue (max 500 caractères)",
                ],
              },
              steps: [{ type: String, trim: true }],
            },
          ],
          formulas: [
            {
              formula: {
                type: String,
                trim: true,
                required: [true, "Formule requise"],
                minlength: [1, "Formule trop courte (min 1 caractère)"],
              },
              useCase: {
                type: String,
                trim: true,
                maxlength: [
                  500,
                  "Cas d'utilisation trop long (max 500 caractères)",
                ],
              },
              derivationSteps: [{ type: String, trim: true }],
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
              match: [
                /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
                "URL du média invalide",
              ],
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
          conceptQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
        },
      ],
      validate: {
        validator: (v) => v.length > 0,
        message: "Au moins un concept est requis",
      },
    },
    theorems: [
      {
        title: {
          type: String,
          trim: true,
          required: [true, "Titre requis"],
          minlength: [3, "Titre trop court (min 3 caractères)"],
        },
        statement: {
          type: String,
          trim: true,
          required: [true, "Énoncé requis"],
          minlength: [10, "Énoncé trop court (min 10 caractères)"],
        },
        proof: [{ type: String, trim: true }],
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
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
              "URL du diagramme invalide",
            ],
          },
          altText: {
            type: String,
            trim: true,
            maxlength: [200, "Texte alternatif trop long (max 200 caractères)"],
          },
        },
        applications: [{ type: String, trim: true }],
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
        solutionSteps: [{ type: String, trim: true }],
        answer: {
          type: String,
          trim: true,
          maxlength: [500, "Réponse trop longue (max 500 caractères)"],
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
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
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
    premiumOnly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes for performance
MathLessonSchema.index({ "concepts.conceptQuizId": 1 });
MathLessonSchema.index({ "practiceExercises.exerciseId": 1 });
MathLessonSchema.index({ prerequisites: 1 });
MathLessonSchema.index({ "summary.suggestedNextTopics": 1 });
MathLessonSchema.index({ "progressTracking.completedBy": 1 });

// Pre-save hook for validation
MathLessonSchema.pre("save", async function (next) {
  try {
    // Validate quizzes
    const quizIds = this.concepts
      .filter((c) => c.conceptQuizId)
      .map((c) => c.conceptQuizId);
    if (quizIds.length > 0) {
      const validQuizzes = await mongoose
        .model("Quiz")
        .countDocuments({ _id: { $in: quizIds } });
      if (validQuizzes !== quizIds.length) {
        throw new Error("Identifiants de quiz invalides dans les concepts");
      }
    }

    // Validate exercises
    const exerciseIds = this.practiceExercises.map((e) => e.exerciseId);
    if (exerciseIds.length > 0) {
      const validExercises = await mongoose
        .model("Exercise")
        .countDocuments({ _id: { $in: exerciseIds } });
      if (validExercises !== exerciseIds.length) {
        throw new Error(
          "Identifiants d'exercices invalides dans les exercices pratiques"
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
MathLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    (this.concepts?.length || 0) * 10 +
      (this.theorems?.length || 0) * 15 +
      (this.workedExamples?.length || 0) * 10 +
      (this.practiceExercises?.length || 0) * 5 +
      (this.interactiveElements?.length || 0) * 5
  ); // Minutes
});

// Virtual for completion status
MathLessonSchema.virtual("completionStatus").get(function () {
  if (!this.progressTracking) return "not_started";
  const completion = this.progressTracking.completionRate || 0;
  if (completion >= 100) return "completed";
  if (completion > 0) return "in_progress";
  return "not_started";
});

module.exports = {
  MathLesson: mongoose.model("Lesson").discriminator("math", MathLessonSchema),
};