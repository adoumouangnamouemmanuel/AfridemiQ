const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const QUESTION_TYPES = ["multiple_choice", "short_answer", "essay"];
const MEDIA_TYPES = ["image", "audio", "video"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];
const PHILOSOPHY_TOPICS = [
  "ethics",
  "metaphysics",
  "epistemology",
  "political_philosophy",
];

// Philosophy Lesson Schema
const PhilosophyLessonSchema = new Schema(
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
            values: PHILOSOPHY_TOPICS,
            message: "Sujet de philosophie invalide",
          },
          required: [true, "Sujet requis"],
        },
        description: {
          type: String,
          trim: true,
          required: [true, "Description requise"],
          minlength: [10, "Description trop courte (min 10 caractères)"],
        },
        keyThinkers: [
          {
            name: {
              type: String,
              trim: true,
              minlength: [1, "Nom du penseur trop court (min 1 caractère)"],
            },
            contribution: {
              type: String,
              trim: true,
              minlength: [1, "Contribution trop courte (min 1 caractère)"],
            },
          },
        ],
        arguments: [
          {
            premise: {
              type: String,
              trim: true,
              minlength: [1, "Prémisse trop courte (min 1 caractère)"],
            },
            conclusion: {
              type: String,
              trim: true,
              minlength: [1, "Conclusion trop courte (min 1 caractère)"],
            },
            critique: {
              type: String,
              trim: true,
              minlength: [1, "Critique trop courte (min 1 caractère)"],
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
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zAZ0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
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
    textAnalysis: [
      {
        title: {
          type: String,
          trim: true,
          required: [true, "Titre de l'analyse requis"],
          minlength: [3, "Titre trop court (min 3 caractères)"],
        },
        author: {
          type: String,
          trim: true,
          required: [true, "Auteur requis"],
          maxlength: [100, "Auteur trop long (max 100 caractères)"],
        },
        excerpt: {
          type: String,
          trim: true,
          maxlength: [2000, "Extrait trop long (max 2000 caractères)"],
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
        textQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
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
PhilosophyLessonSchema.path("concepts").validate({
  validator: (v) => v.length > 0,
  message: "Au moins un concept est requis",
});
PhilosophyLessonSchema.path("textAnalysis").validate({
  validator: (v) => v.length > 0,
  message: "Au moins une analyse de texte est requise",
});
PhilosophyLessonSchema.path("practiceExercises").validate({
  validator: (v) => v.length > 0,
  message: "Au moins un exercice pratique est requis",
});

// Indexes for performance
PhilosophyLessonSchema.index({ "concepts.conceptQuizId": 1 });
PhilosophyLessonSchema.index({ "textAnalysis.textQuizId": 1 });
PhilosophyLessonSchema.index({ "practiceExercises.exerciseId": 1 });
PhilosophyLessonSchema.index({ prerequisites: 1 });
PhilosophyLessonSchema.index({ "summary.suggestedNextTopics": 1 });
PhilosophyLessonSchema.index({ "progressTracking.completedBy": 1 });

// Pre-save hook for reference validation
PhilosophyLessonSchema.pre("save", async function (next) {
  try {
    // Validate quiz IDs
    const quizIds = [
      ...this.concepts
        .filter((c) => c.conceptQuizId)
        .map((c) => c.conceptQuizId),
      ...this.textAnalysis.filter((t) => t.textQuizId).map((t) => t.textQuizId),
    ];
    if (quizIds.length > 0) {
      const validQuizzes = await mongoose
        .model("Quiz")
        .countDocuments({ _id: { $in: quizIds } });
      if (validQuizzes !== quizIds.length) {
        throw new Error(
          "Identifiants de quiz invalides dans concepts ou analyse de texte"
        );
      }
    }

    // Validate exercise IDs
    const exerciseIds = this.practiceExercises.map((p) => p.exerciseId);
    if (exerciseIds.length > 0) {
      const validExercises = await mongoose
        .model("Exercise")
        .countDocuments({ _id: { $in: exerciseIds } });
      if (validExercises !== exerciseIds.length) {
        throw new Error(
          "Identifiants d'exercices invalides dans exercices pratiques"
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
PhilosophyLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    (this.concepts?.length || 0) * 15 +
      (this.textAnalysis?.length || 0) * 20 +
      (this.practiceExercises?.length || 0) * 15
  ); // Minutes
});

// Virtual for completion status
PhilosophyLessonSchema.virtual("completionStatus").get(function () {
  if (!this.progressTracking) return "not_started";
  const completion = this.progressTracking.completionRate || 0;
  if (completion >= 100) return "completed";
  if (completion > 0) return "in_progress";
  return "not_started";
});

module.exports = {
  PhilosophyLesson: mongoose
    .model("Lesson")
    .discriminator("philosophy", PhilosophyLessonSchema),
};