const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const MEDIA_TYPES = ["image", "audio", "video"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];
const CHEMISTRY_TOPICS = [
  "stoichiometry",
  "organic_chemistry",
  "thermodynamics",
  "acids_bases",
];

// Chemistry Lesson Schema
const ChemistryLessonSchema = new Schema(
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
    concepts: [
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
            values: CHEMISTRY_TOPICS,
            message: "Sujet de chimie invalide",
          },
          required: [true, "Sujet requis"],
        },
        description: {
          type: String,
          trim: true,
          required: [true, "Description requise"],
          minlength: [10, "Description trop courte (min 10 caractères)"],
        },
        keyEquations: [
          {
            equation: {
              type: String,
              trim: true,
              minlength: [1, "Équation trop courte (min 1 caractère)"],
            },
            explanation: {
              type: String,
              trim: true,
              minlength: [1, "Explication trop courte (min 1 caractère)"],
            },
          },
        ],
        examples: [
          {
            problem: {
              type: String,
              trim: true,
              minlength: [10, "Problème trop court (min 10 caractères)"],
            },
            solutionSteps: [
              {
                type: String,
                trim: true,
                minlength: [
                  1,
                  "Étape de solution trop courte (min 1 caractère)",
                ],
              },
            ],
            answer: {
              type: String,
              trim: true,
              minlength: [1, "Réponse trop courte (min 1 caractère)"],
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
            match: [
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
              "URL du média invalide",
            ],
          },
          altText: {
            type: String,
            trim: true,
            maxlength: [500, "Texte alternatif trop long (max 500 caractères)"],
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
    experiments: [
      {
        title: {
          type: String,
          trim: true,
          required: [true, "Titre de l'expérience requis"],
          minlength: [3, "Titre trop court (min 3 caractères)"],
        },
        objective: {
          type: String,
          trim: true,
          maxlength: [500, "Objectif trop long (max 500 caractères)"],
        },
        materials: [
          {
            type: String,
            trim: true,
            minlength: [1, "Matériel trop court (min 1 caractère)"],
          },
        ],
        procedure: [
          {
            type: String,
            trim: true,
            minlength: [1, "Étape de procédure trop courte (min 1 caractère)"],
          },
        ],
        expectedResults: {
          type: String,
          trim: true,
          maxlength: [
            1000,
            "Résultats attendus trop longs (max 1000 caractères)",
          ],
        },
        safetyNotes: [
          {
            type: String,
            trim: true,
            minlength: [1, "Note de sécurité trop courte (min 1 caractère)"],
          },
        ],
        dataTableTemplate: [
          {
            variable: {
              type: String,
              trim: true,
              minlength: [1, "Variable trop courte (min 1 caractère)"],
            },
            unit: {
              type: String,
              trim: true,
              minlength: [1, "Unité trop courte (min 1 caractère)"],
            },
            values: [{ type: Number }],
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
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
              "URL du diagramme invalide",
            ],
          },
          altText: {
            type: String,
            trim: true,
            maxlength: [500, "Texte alternatif trop long (max 500 caractères)"],
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
    reactionAnalysis: [
      {
        reaction: {
          type: String,
          trim: true,
          required: [true, "Réaction chimique requise"],
          minlength: [3, "Réaction trop courte (min 3 caractères)"],
        },
        type: {
          type: String,
          enum: {
            values: [
              "synthesis",
              "decomposition",
              "redox",
              "acid_base",
              "precipitation",
            ],
            message: "Type de réaction invalide",
          },
          required: [true, "Type de réaction requis"],
        },
        balancedEquation: {
          type: String,
          trim: true,
          minlength: [3, "Équation équilibrée trop courte (min 3 caractères)"],
        },
        explanation: {
          type: String,
          trim: true,
          maxlength: [1000, "Explication trop longue (max 1000 caractères)"],
        },
        applications: [
          {
            type: String,
            trim: true,
            minlength: [1, "Application trop courte (min 1 caractère)"],
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
        reactionQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
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
            message: "Type d'exemple invalide",
          },
          required: [true, "Type d'exemple requis"],
        },
        solutionSteps: [
          {
            type: String,
            trim: true,
            minlength: [1, "Étape de solution trop courte (min 1 caractère)"],
          },
        ],
        answer: {
          type: String,
          trim: true,
          minlength: [1, "Réponse trop courte (min 1 caractère)"],
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
    practiceExercises: [
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

// Array validations
ChemistryLessonSchema.path("concepts").validate({
  validator: (v) => v.length > 0,
  message: "Au moins un concept est requis",
});
ChemistryLessonSchema.path("experiments").validate({
  validator: (v) => v.length > 0,
  message: "Au moins une expérience est requise",
});
ChemistryLessonSchema.path("reactionAnalysis").validate({
  validator: (v) => v.length > 0,
  message: "Au moins une analyse de réaction est requise",
});
ChemistryLessonSchema.path("practiceExercises").validate({
  validator: (v) => v.length > 0,
  message: "Au moins un exercice pratique est requis",
});

// Indexes for performance
ChemistryLessonSchema.index({ "concepts.conceptQuizId": 1 });
ChemistryLessonSchema.index({ "experiments.experimentExerciseId": 1 });
ChemistryLessonSchema.index({ "reactionAnalysis.reactionQuizId": 1 });
ChemistryLessonSchema.index({ "practiceExercises.exerciseId": 1 });
ChemistryLessonSchema.index({ prerequisites: 1 });
ChemistryLessonSchema.index({ "summary.suggestedNextTopics": 1 });
ChemistryLessonSchema.index({ "progressTracking.completedBy": 1 });

// Pre-save hook for reference validation
ChemistryLessonSchema.pre("save", async function (next) {
  try {
    // Validate quiz IDs
    const quizIds = [
      ...this.concepts
        .filter((c) => c.conceptQuizId)
        .map((c) => c.conceptQuizId),
      ...this.reactionAnalysis
        .filter((r) => r.reactionQuizId)
        .map((r) => r.reactionQuizId),
    ];
    if (quizIds.length > 0) {
      const validQuizzes = await mongoose
        .model("Quiz")
        .countDocuments({ _id: { $in: quizIds } });
      if (validQuizzes !== quizIds.length) {
        throw new Error(
          "Identifiants de quiz invalides dans concepts ou analyse de réaction"
        );
      }
    }

    // Validate exercise IDs
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
          "Identifiants d'exercices invalides dans expériences ou exercices pratiques"
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
ChemistryLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    (this.concepts?.length || 0) * 15 +
      (this.experiments?.length || 0) * 20 +
      (this.reactionAnalysis?.length || 0) * 10 +
      (this.practiceExercises?.length || 0) * 10
  ); // Minutes
});

// Virtual for completion status
ChemistryLessonSchema.virtual("completionStatus").get(function () {
  if (!this.progressTracking) return "not_started";
  const completion = this.progressTracking.completionRate || 0;
  if (completion >= 100) return "completed";
  if (completion > 0) return "in_progress";
  return "not_started";
});

module.exports = {
  ChemistryLesson: mongoose
    .model("Lesson")
    .discriminator("chemistry", ChemistryLessonSchema),
};
