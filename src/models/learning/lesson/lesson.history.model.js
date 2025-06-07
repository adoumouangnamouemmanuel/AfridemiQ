const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];
const MEDIA_TYPES = ["image", "audio", "video"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];
const HISTORY_TOPICS = [
  "colonialism",
  "independence_movements",
  "world_wars",
  "chadian_history",
];

// History Lesson Schema
const HistoryLessonSchema = new Schema(
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
            values: HISTORY_TOPICS,
            message: "Sujet d'histoire invalide",
          },
          required: [true, "Sujet requis"],
        },
        description: {
          type: String,
          trim: true,
          required: [true, "Description requise"],
          minlength: [10, "Description trop courte (min 10 caractères)"],
        },
        keyEvents: [
          {
            event: {
              type: String,
              trim: true,
              minlength: [1, "Événement trop court (min 1 caractère)"],
            },
            date: {
              type: String,
              trim: true,
              minlength: [1, "Date trop courte (min 1 caractère)"],
            },
            significance: {
              type: String,
              trim: true,
              minlength: [1, "Signification trop courte (min 1 caractère)"],
            },
          },
        ],
        keyFigures: [
          {
            name: {
              type: String,
              trim: true,
              minlength: [1, "Nom de la figure trop court (min 1 caractère)"],
            },
            role: {
              type: String,
              trim: true,
              minlength: [1, "Rôle trop court (min 1 caractère)"],
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
    sourceAnalysis: [
      {
        title: {
          type: String,
          trim: true,
          required: [true, "Titre de l'analyse requis"],
          minlength: [3, "Titre trop court (min 3 caractères)"],
        },
        sourceType: {
          type: String,
          enum: {
            values: ["primary", "secondary"],
            message: "Type de source invalide",
          },
          required: [true, "Type de source requis"],
        },
        excerpt: {
          type: String,
          trim: true,
          maxlength: [2000, "Extrait trop long (max 2000 caractères)"],
        },
        author: {
          type: String,
          trim: true,
          maxlength: [100, "Auteur trop long (max 100 caractères)"],
        },
        date: {
          type: String,
          trim: true,
          maxlength: [50, "Date trop longue (max 50 caractères)"],
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
              minlength: [1, "Question trop courte (min 1 caractère)"],
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
        difficultyLevel: {
          type: String,
          enum: {
            values: DIFFICULTY_LEVELS,
            message: "Niveau de difficulté invalide",
          },
          required: [true, "Niveau de difficulté requis"],
        },
        sourceQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    timeline: [
      {
        period: {
          type: String,
          trim: true,
          required: [true, "Période requise"],
          minlength: [3, "Période trop courte (min 3 caractères)"],
        },
        startDate: {
          type: String,
          trim: true,
          maxlength: [50, "Date de début trop longue (max 50 caractères)"],
        },
        endDate: {
          type: String,
          trim: true,
          maxlength: [50, "Date de fin trop longue (max 50 caractères)"],
        },
        events: [
          {
            event: {
              type: String,
              trim: true,
              minlength: [1, "Événement trop court (min 1 caractère)"],
            },
            date: {
              type: String,
              trim: true,
              minlength: [1, "Date trop courte (min 1 caractère)"],
            },
            description: {
              type: String,
              trim: true,
              minlength: [1, "Description trop courte (min 1 caractère)"],
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
        timelineExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
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
        solution: {
          type: String,
          trim: true,
          minlength: [1, "Solution trop courte (min 1 caractère)"],
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
HistoryLessonSchema.path("concepts").validate({
  validator: (v) => v.length > 0,
  message: "Au moins un concept est requis",
});
HistoryLessonSchema.path("sourceAnalysis").validate({
  validator: (v) => v.length > 0,
  message: "Au moins une analyse de source est requise",
});
HistoryLessonSchema.path("timeline").validate({
  validator: (v) => v.length > 0,
  message: "Au moins une chronologie est requise",
});
HistoryLessonSchema.path("practiceExercises").validate({
  validator: (v) => v.length > 0,
  message: "Au moins un exercice pratique est requis",
});

// Indexes for performance
HistoryLessonSchema.index({ "concepts.conceptQuizId": 1 });
HistoryLessonSchema.index({ "sourceAnalysis.sourceQuizId": 1 });
HistoryLessonSchema.index({ "timeline.timelineExerciseId": 1 });
HistoryLessonSchema.index({ "practiceExercises.exerciseId": 1 });
HistoryLessonSchema.index({ prerequisites: 1 });
HistoryLessonSchema.index({ "summary.suggestedNextTopics": 1 });
HistoryLessonSchema.index({ "progressTracking.completedBy": 1 });

// Pre-save hook for reference validation
HistoryLessonSchema.pre("save", async function (next) {
  try {
    // Validate quiz IDs
    const quizIds = [
      ...this.concepts
        .filter((c) => c.conceptQuizId)
        .map((c) => c.conceptQuizId),
      ...this.sourceAnalysis
        .filter((s) => s.sourceQuizId)
        .map((s) => s.sourceQuizId),
    ];
    if (quizIds.length > 0) {
      const validQuizzes = await mongoose
        .model("Quiz")
        .countDocuments({ _id: { $in: quizIds } });
      if (validQuizzes !== quizIds.length) {
        throw new Error(
          "Identifiants de quiz invalides dans concepts ou analyse de source"
        );
      }
    }

    // Validate exercise IDs
    const exerciseIds = [
      ...this.timeline
        .filter((t) => t.timelineExerciseId)
        .map((t) => t.timelineExerciseId),
      ...this.practiceExercises.map((p) => p.exerciseId),
    ];
    if (exerciseIds.length > 0) {
      const validExercises = await mongoose
        .model("Exercise")
        .countDocuments({ _id: { $in: exerciseIds } });
      if (validExercises !== exerciseIds.length) {
        throw new Error(
          "Identifiants d'exercices invalides dans chronologie ou exercices pratiques"
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
HistoryLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    (this.expiration?.concepts?.length || 0) * 15 +
      (this.expiration?.length || 0) * 20 +
      (this.expiration?.length || 0) * 10 +
      (this.expiration?.practiceExercises?.length || 0) * 15
  ); // Minutes
});

// Virtual for completion status
HistoryLessonSchema.virtual("completionStatus").get(function () {
  if (!this.progressTracking) return "not_started";
  const completion = this.progressTracking.completionRate || 0;
  if (completion >= 100) return "completed";
  if (completion > 0) return "in_progress";
  return "not_started";
});

module.exports = {
  HistoryLesson: mongoose
    .model("Lesson")
    .discriminator("history", HistoryLessonSchema),
};