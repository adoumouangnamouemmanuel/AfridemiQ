const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const INTERACTIVITY_LEVELS = ["low", "medium", "high"];
const RESOURCE_TYPES = [
  "document",
  "video",
  "audio",
  "interactive",
  "past_exam",
];
const MEDIA_TYPES = ["image", "audio", "video"];
const WRITING_FORMATS = ["essay", "letter", "commentary", "summary"];
const INTERACTIVE_ELEMENT_TYPES = ["geogebra", "desmos", "video", "quiz"];
const USER_ROLES = ["student", "teacher", "admin"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];
const MATH_TOPICS = ["algebra", "geometry", "calculus", "statistics"];
const PHYSICS_TOPICS = [
  "mechanics",
  "electromagnetism",
  "thermodynamics",
  "optics",
];
const CHEMISTRY_TOPICS = [
  "stoichiometry",
  "organic_chemistry",
  "thermodynamics",
  "acids_bases",
];
const BIOLOGY_TOPICS = ["cell_biology", "genetics", "ecology", "physiology"];
const FRENCH_TOPICS = ["grammar", "literature", "text_analysis", "composition"];
const PHILOSOPHY_TOPICS = [
  "ethics",
  "metaphysics",
  "epistemology",
  "political_philosophy",
];
const ENGLISH_TOPICS = [
  "grammar",
  "reading_comprehension",
  "writing_skills",
  "speaking",
];
const HISTORY_TOPICS = [
  "colonialism",
  "independence_movements",
  "world_wars",
  "chadian_history",
];
const GEOGRAPHY_TOPICS = [
  "physical_geography",
  "human_geography",
  "climate_and_environment",
  "chadian_geography",
];
const QUESTION_TYPES = [
  "multiple_choice",
  "short_answer",
  "essay",
  "calculation",
  "diagram_labeling",
  "source_analysis",
  "map_analysis",
  "data_interpretation",
  "fill_in_the_blank",
  "text_sequencing",
];

// Shared Feedback Subschema
const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 0, max: 10, required: true },
  comments: String,
  createdAt: { type: Date, default: Date.now },
});

// User Schema
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return v ? /^\+?[1-9]\d{1,14}$/.test(v) : true;
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      unique: true,
      sparse: true,
    },
    isPhoneVerified: { type: Boolean, default: false },
    phoneVerificationCode: String,
    phoneVerificationExpires: Date,
    avatar: String,
    country: { type: String, required: true }, // Required for consistency with Country model
    timeZone: String,
    preferredLanguage: String,
    schoolName: String,
    gradeLevel: String,
    parentEmail: String,
    role: { type: String, enum: USER_ROLES, default: "student" },
    createdAt: { type: Date, default: Date.now },
    lastLogin: Date,
    isPremium: { type: Boolean, default: false },
    subscription: {
      type: {
        type: String,
        enum: ["free", "premium"],
        required: true,
        default: "free",
      },
      startDate: { type: Date, required: true, default: Date.now },
      expiresAt: Date,
      paymentStatus: {
        type: String,
        enum: ["active", "pending", "failed"],
        required: true,
        default: "active",
      },
      trialPeriod: {
        startDate: Date,
        endDate: Date,
      },
      features: [String],
      accessLevel: {
        type: String,
        enum: ["basic", "premium"],
        required: true,
        default: "basic",
      },
    },
    preferences: {
      notifications: {
        general: { type: Boolean, default: true },
        dailyReminderTime: String,
        challengeNotifications: { type: Boolean, default: false },
        progressUpdates: { type: Boolean, default: true },
      },
      darkMode: { type: Boolean, default: false },
      fontSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      preferredContentFormat: {
        type: String,
        enum: ["video", "text", "audio", "mixed"],
        default: "text",
      },
      enableHints: { type: Boolean, default: true },
      autoPlayAudio: { type: Boolean, default: false },
      showStepSolutions: { type: Boolean, default: true },
      leaderboardVisibility: { type: Boolean, default: true },
      allowFriendRequests: { type: Boolean, default: true },
      multilingualSupport: [String],
    },
    settings: {
      learningStyle: {
        type: String,
        enum: ["visual", "auditory", "kinesthetic", "mixed"],
        default: "mixed",
      },
      motivation: String,
      preferredStudySessionLength: Number,
    },
    progress: {
      selectedExam: String,
      selectedSeries: String,
      selectedLevel: String,
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      streak: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastStudyDate: Date,
      },
      goalDate: Date,
      totalQuizzes: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      completedTopics: [String],
      weakSubjects: [String],
      badges: [String],
      achievements: [String],
      progressSummary: {
        completedPercentage: Number,
        remainingTopics: Number,
      },
    },
    analyticsId: { type: Schema.Types.ObjectId, ref: "UserAnalytics", default: null },
    notes: [{ type: Schema.Types.ObjectId, ref: "Note", default: [] }],
    hintsUsed: [{ type: Schema.Types.ObjectId, ref: "HintUsage", default: [] }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Bookmark", default: [] }],
    friends: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    tutorId: { type: Schema.Types.ObjectId, ref: "PeerTutorProfile", default: null },
    socialProfile: {
      bio: String,
      publicAchievements: [String],
      visibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public",
      },
      socialLinks: [{ platform: String, url: String }],
    },
    onboardingStatusId: {
      type: Schema.Types.ObjectId,
      ref: "OnboardingStatus",
    },
  },
  { timestamps: true }
);

// Virtual for fullName
UserSchema.virtual("fullName").get(function () {
  return this.name;
});

// Other schemas remain largely unchanged but updated for consistency
const UserAnalyticsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lastUpdated: { type: Date, default: Date.now },
    dailyStats: [
      {
        date: Date,
        studyTime: Number,
        questionsAnswered: Number,
        correctAnswers: Number,
        topicsCovered: [String],
      },
    ],
    subjectStats: [
      {
        subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
        series: String,
        averageScore: Number,
        timeSpent: Number,
        lastStudied: Date,
      },
    ],
    learningPatterns: {
      preferredStudyTime: String,
      mostProductiveDays: [String],
      averageSessionLength: Number,
    },
    mastery: [
      {
        subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
        series: String,
        masteryLevel: Number,
        lastAssessmentDate: Date,
        improvementRate: Number,
      },
    ],
    efficiency: {
      averageResponseTime: Number,
      accuracyRate: Number,
      timeSpentPerTopic: Number,
    },
    personalizedRecommendations: {
      weakTopics: [String],
      suggestedStudyPath: [String],
      nextMilestone: String,
    },
  },
  { timestamps: true }
);

const AchievementSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    earnedDate: Date,
    progress: { type: Number, default: 0 },
    target: { type: Number, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
    series: String,
  },
  { timestamps: true }
);

const ExamSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    duration: { type: String, required: true },
    country: { type: String, required: true },
    levels: [String],
    series: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
        description: String,
      },
    ],
    curriculumId: {
      type: Schema.Types.ObjectId,
      ref: "Curriculum",
      required: true,
    },
    examFormat: {
      type: String,
      enum: ["paper", "computer", "hybrid"],
      required: true,
      default: "paper",
    },
    accessibilityOptions: [String],
    importantDates: [{ type: String, date: Date }],
    registrationRequirements: {
      minimumAge: Number,
      requiredDocuments: [String],
      fees: { amount: Number, currency: String },
    },
    examCenters: [
      {
        id: String,
        name: String,
        location: String,
        capacity: Number,
      },
    ],
    pastPapers: [
      {
        year: Number,
        url: String,
        solutions: String,
        series: String,
      },
    ],
    statistics: [
      {
        passRate: Number,
        averageScore: Number,
        totalCandidates: Number,
        series: String,
      },
    ],
  },
  { timestamps: true }
);

const SubjectSchema = new Schema(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    description: { type: String, required: true },
    examIds: [{ type: Schema.Types.ObjectId, ref: "Exam" }],
    series: [String],
  },
  { timestamps: true, indexes: [{ key: { name: 1, series: 1 } }] }
);

const TopicSchema = new Schema(
  {
    name: { type: String, required: true },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    series: String,
    description: { type: String, required: true },
    difficulty: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    estimatedTime: { type: Number, required: true },
    estimatedCompletionDate: Date,
    relatedTopics: [String],
    hasPractice: { type: Boolean, default: false },
    hasNote: { type: Boolean, default: false },
    hasStudyMaterial: { type: Boolean, default: false },
    prerequisites: [String],
    learningObjectives: [String],
    estimatedTimeToMaster: { type: Number, required: true },
    resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
    assessmentCriteria: {
      minimumScore: Number,
      requiredPracticeQuestions: Number,
      masteryThreshold: Number,
    },
  },
  { timestamps: true }
);

const TopicProgressSchema = new Schema(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    series: String,
    masteryLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "mastered"],
      required: true,
    },
    timeSpent: { type: Number, default: 0 },
    lastStudied: Date,
    practiceSessions: [
      {
        date: Date,
        score: Number,
        timeSpent: Number,
      },
    ],
    weakAreas: [String],
    strongAreas: [String],
  },
  { timestamps: true }
);

const CourseContentSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: String,
    title: { type: String, required: true },
    description: { type: String, required: true },
    level: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    modules: [
      {
        id: String,
        title: String,
        description: String,
        order: Number,
        series: String,
        lessons: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
        exerciseIds: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
        assessment: {
          id: String,
          type: { type: String, enum: ["quiz", "exam", "project"] },
          title: String,
          description: String,
          questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
          passingScore: Number,
          timeLimit: Number,
          attempts: Number,
          feedback: {
            immediate: Boolean,
            detailed: Boolean,
            solutions: Boolean,
          },
          premiumOnly: Boolean,
        },
        progressTracking: {
          completedLessons: Number,
          totalLessons: Number,
        },
      },
    ],
    prerequisites: [String],
    estimatedDuration: Number,
    progressTracking: {
      completedLessons: Number,
      totalLessons: Number,
    },
    accessibilityOptions: {
      languages: [String],
      formats: [String],
      accommodations: [String],
    },
    premiumOnly: { type: Boolean, default: false },
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: Date,
      updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      tags: [String],
    },
  },
  { timestamps: true }
);

// Index for lesson queries
CourseContentSchema.index({ "modules.lessons": 1, series: 1 });

// Lesson Base Schema
const LessonBaseSchema = new Schema(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    title: { type: String, required: true },
    series: String,
    overview: String,
    objectives: [String],
    keyPoints: [String],
    duration: { type: Number, required: true },
    resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
    exerciseIds: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
    interactivityLevel: {
      type: String,
      enum: INTERACTIVITY_LEVELS,
      required: true,
    },
    offlineAvailable: { type: Boolean, default: false },
    premiumOnly: { type: Boolean, default: false },
    feedback: [FeedbackSchema],
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  },
  {
    timestamps: true,
    discriminatorKey: "subjectType",
  }
);

// Pre-save hook for resource and exercise validation
LessonBaseSchema.pre("save", async function (next) {
  if (this.resourceIds.length > 0) {
    const validResources = await mongoose
      .model("Resource")
      .countDocuments({ _id: { $in: this.resourceIds } });
    if (validResources !== this.resourceIds.length) {
      return next(new Error("Invalid Resource IDs"));
    }
  }
  if (this.exerciseIds.length > 0) {
    const validExercises = await mongoose
      .model("Exercise")
      .countDocuments({ _id: { $in: this.exerciseIds } });
    if (validExercises !== this.exerciseIds.length) {
      return next(new Error("Invalid Exercise IDs"));
    }
  }
  next();
});

// Virtual for completion status
LessonBaseSchema.virtual("completionStatus").get(function () {
  // Placeholder: Implement based on user progress
  return "not_started";
});

// French Lesson Schema (Enhanced)
const FrenchLessonSchema = new Schema(
  {
    introduction: {
      text: { type: String, required: true },
      videoUrl: {
        type: String,
        match:
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      transcript: String,
      accessibility: {
        hasSubtitles: Boolean,
        hasAudioDescription: Boolean,
      },
    },
    literaryAnalysis: [
      {
        text: { type: String, required: true },
        author: { type: String, required: true },
        title: { type: String, required: true },
        themes: [String],
        questions: [
          {
            question: String,
            type: { type: String, enum: QUESTION_TYPES },
          },
        ],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        context: String, // Historical/literary context
        analysisQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    grammar: [
      {
        rule: { type: String, required: true },
        explanation: String,
        examples: [String],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        grammarExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      },
    ],
    vocabulary: [
      {
        word: { type: String, required: true },
        definition: { type: String, required: true },
        partOfSpeech: String,
        examples: [String],
        pronunciation: String,
        synonyms: [String],
        vocabularyQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    writingSkills: [
      {
        format: { type: String, enum: WRITING_FORMATS, required: true },
        guidelines: [String],
        prompts: [
          {
            prompt: String,
            instructions: String,
          },
        ],
        modelAnswer: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        writingExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      },
    ],
    oralSkills: [
      {
        topic: { type: String, required: true },
        instructions: String,
        sampleDialogue: String,
        pronunciationGuide: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        oralExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      },
    ],
    workedExamples: [
      {
        type: {
          type: String,
          enum: WRITING_FORMATS.concat(["text_analysis", "grammar_correction"]),
        },
        problem: { type: String, required: true },
        solution: String,
        annotations: [String],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    practiceExercises: [
      {
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        description: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    interactiveElements: [
      {
        elementType: {
          type: String,
          enum: INTERACTIVE_ELEMENT_TYPES,
          required: true,
        },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          required: true,
        },
        instructions: String,
        offlineAvailable: { type: Boolean, default: false },
      },
    ],
    summary: {
      keyTakeaways: [String],
      suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    learningObjectives: [String],
    gamification: {
      badges: [String],
      points: { type: Number, default: 0 },
    },
    progressTracking: {
      completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      completionRate: { type: Number, default: 0 },
    },
    accessibilityOptions: {
      hasBraille: Boolean,
      hasSignLanguage: Boolean,
      languages: [String],
    },
  },
  { timestamps: true }
);

// Indexes for performance
FrenchLessonSchema.index({ "literaryAnalysis.analysisQuizId": 1 });
FrenchLessonSchema.index({ "grammar.grammarExerciseId": 1 });
FrenchLessonSchema.index({ "vocabulary.vocabularyQuizId": 1 });
FrenchLessonSchema.index({ "writingSkills.writingExerciseId": 1 });
FrenchLessonSchema.index({ "oralSkills.oralExerciseId": 1 });
FrenchLessonSchema.index({ "practiceExercises.exerciseId": 1 });

// Pre-save hook for reference validation
FrenchLessonSchema.pre("save", async function (next) {
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
      return next(
        new Error("Invalid Quiz IDs in literaryAnalysis or vocabulary")
      );
    }
  }
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
      return next(
        new Error(
          "Invalid Exercise IDs in grammar, writingSkills, oralSkills, or practiceExercises"
        )
      );
    }
  }
  if (this.prerequisites.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.prerequisites } });
    if (validTopics !== this.prerequisites.length) {
      return next(new Error("Invalid Topic IDs in prerequisites"));
    }
  }
  if (this.summary.suggestedNextTopics.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.summary.suggestedNextTopics } });
    if (validTopics !== this.summary.suggestedNextTopics.length) {
      return next(new Error("Invalid Topic IDs in suggestedNextTopics"));
    }
  }
  next();
});

// Virtual for estimated time
FrenchLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    this.literaryAnalysis.length * 15 +
      this.grammar.length * 10 +
      this.vocabulary.length * 5 +
      this.writingSkills.length * 20 +
      this.oralSkills.length * 15 +
      this.practiceExercises.length * 10
  ); // Example calculation in minutes
});

// Virtual for completion status
FrenchLessonSchema.virtual("completionStatus").get(function () {
  // Placeholder: Implement based on user progress
  return "not_started";
});

// Math Lesson Schema (Enhanced)
const MathLessonSchema = new Schema(
  {
    introduction: {
      text: { type: String, required: true },
      videoUrl: {
        type: String,
        match:
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      transcript: String,
      accessibility: {
        hasSubtitles: Boolean,
        hasAudioDescription: Boolean,
      },
    },
    concepts: [
      {
        name: { type: String, required: true },
        definition: { type: String, required: true },
        explanation: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        examples: [
          {
            expression: { type: String, required: true },
            explanation: String,
            steps: [String],
          },
        ],
        formulas: [
          {
            formula: { type: String, required: true },
            useCase: String,
            derivationSteps: [String],
          },
        ],
        visualAid: {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: {
            type: String,
            match:
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          },
          altText: String,
        },
        conceptQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    theorems: [
      {
        title: { type: String, required: true },
        statement: { type: String, required: true },
        proof: [String],
        diagram: {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: {
            type: String,
            match:
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          },
          altText: String,
        },
        applications: [String],
      },
    ],
    workedExamples: [
      {
        problem: { type: String, required: true },
        solutionSteps: [String],
        answer: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    practiceExercises: [
      {
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        description: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    interactiveElements: [
      {
        elementType: {
          type: String,
          enum: INTERACTIVE_ELEMENT_TYPES,
          required: true,
        },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          required: true,
        },
        instructions: String,
        offlineAvailable: { type: Boolean, default: false },
      },
    ],
    summary: {
      keyTakeaways: [String],
      suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    learningObjectives: [String],
    gamification: {
      badges: [String],
      points: { type: Number, default: 0 },
    },
    progressTracking: {
      completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      completionRate: { type: Number, default: 0 },
    },
    accessibilityOptions: {
      hasBraille: Boolean,
      hasSignLanguage: Boolean,
      languages: [String],
    },
  },
  { timestamps: true }
);

// Indexes for performance
MathLessonSchema.index({ "concepts.conceptQuizId": 1 });
MathLessonSchema.index({ "practiceExercises.exerciseId": 1 });

// Pre-save hook for reference validation
MathLessonSchema.pre("save", async function (next) {
  if (this.concepts.some((c) => c.conceptQuizId)) {
    const quizIds = this.concepts
      .filter((c) => c.conceptQuizId)
      .map((c) => c.conceptQuizId);
    const validQuizzes = await mongoose
      .model("Quiz")
      .countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error("Invalid Quiz IDs in concepts"));
    }
  }
  if (this.practiceExercises.length > 0) {
    const exerciseIds = this.practiceExercises.map((e) => e.exerciseId);
    const validExercises = await mongoose
      .model("Exercise")
      .countDocuments({ _id: { $in: exerciseIds } });
    if (validExercises !== exerciseIds.length) {
      return next(new Error("Invalid Exercise IDs in practiceExercises"));
    }
  }
  if (this.prerequisites.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.prerequisites } });
    if (validTopics !== this.prerequisites.length) {
      return next(new Error("Invalid Topic IDs in prerequisites"));
    }
  }
  if (this.summary.suggestedNextTopics.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.summary.suggestedNextTopics } });
    if (validTopics !== this.summary.suggestedNextTopics.length) {
      return next(new Error("Invalid Topic IDs in suggestedNextTopics"));
    }
  }
  next();
});

// Virtual for estimated time
MathLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    this.concepts.length * 10 + this.practiceExercises.length * 5
  ); // Example calculation
});

// Physics Lesson Schema (New)
const PhysicsLessonSchema = new Schema(
  {
    introduction: {
      text: { type: String, required: true },
      videoUrl: {
        type: String,
        match:
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      transcript: String,
      accessibility: {
        hasSubtitles: Boolean,
        hasAudioDescription: Boolean,
      },
    },
    concepts: [
      {
        name: { type: String, required: true },
        topic: { type: String, enum: PHYSICS_TOPICS, required: true },
        description: { type: String, required: true },
        laws: [
          {
            name: String,
            formula: String,
            explanation: String,
          },
        ],
        examples: [
          {
            problem: String,
            solutionSteps: [String],
            answer: String,
          },
        ],
        visualAid: {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: {
            type: String,
            match:
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          },
          altText: String,
        },
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        conceptQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    experiments: [
      {
        title: { type: String, required: true },
        objective: String,
        materials: [String],
        procedure: [String],
        expectedResults: String,
        safetyNotes: [String],
        diagram: {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: {
            type: String,
            match:
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          },
          altText: String,
        },
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        experimentExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      },
    ],
    workedExamples: [
      {
        problem: { type: String, required: true },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        solutionSteps: [String],
        answer: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    practiceExercises: [
      {
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        description: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    interactiveElements: [
      {
        elementType: {
          type: String,
          enum: INTERACTIVE_ELEMENT_TYPES,
          required: true,
        },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          required: true,
        },
        instructions: String,
        offlineAvailable: { type: Boolean, default: false },
      },
    ],
    summary: {
      keyTakeaways: [String],
      suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    learningObjectives: [String],
    gamification: {
      badges: [String],
      points: { type: Number, default: 0 },
    },
    progressTracking: {
      completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      completionRate: { type: Number, default: 0 },
    },
    accessibilityOptions: {
      hasBraille: Boolean,
      hasSignLanguage: Boolean,
      languages: [String],
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
PhysicsLessonSchema.index({ "concepts.conceptQuizId": 1 });
PhysicsLessonSchema.index({ "experiments.experimentExerciseId": 1 });
PhysicsLessonSchema.index({ "practiceExercises.exerciseId": 1 });

// Pre-save hook for reference validation
PhysicsLessonSchema.pre("save", async function (next) {
  const quizIds = this.concepts
    .filter((c) => c.conceptQuizId)
    .map((c) => c.conceptQuizId);
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose
      .model("Quiz")
      .countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error("Invalid Quiz IDs in concepts"));
    }
  }
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
      return next(
        new Error("Invalid Exercise IDs in experiments or practiceExercises")
      );
    }
  }
  if (this.prerequisites.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.prerequisites } });
    if (validTopics !== this.prerequisites.length) {
      return next(new Error("Invalid Topic IDs in prerequisites"));
    }
  }
  if (this.summary.suggestedNextTopics.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.summary.suggestedNextTopics } });
    if (validTopics !== this.summary.suggestedNextTopics.length) {
      return next(new Error("Invalid Topic IDs in suggestedNextTopics"));
    }
  }
  next();
});

// Virtual for estimated time
PhysicsLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    this.concepts.length * 15 +
      this.experiments.length * 20 +
      this.practiceExercises.length * 10
  ); // Example calculation in minutes
});

// Virtual for completion status
PhysicsLessonSchema.virtual("completionStatus").get(function () {
  // Placeholder: Implement based on user progress
  return "not_started";
});

// Chemistry Lesson Schema (New)
const ChemistryLessonSchema = new Schema(
  {
    introduction: {
      text: { type: String, required: true },
      videoUrl: {
        type: String,
        match:
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      transcript: String,
      accessibility: {
        hasSubtitles: Boolean,
        hasAudioDescription: Boolean,
      },
    },
    concepts: [
      {
        name: { type: String, required: true },
        topic: { type: String, enum: CHEMISTRY_TOPICS, required: true },
        description: { type: String, required: true },
        keyEquations: [
          {
            equation: String,
            explanation: String,
          },
        ],
        examples: [
          {
            problem: String,
            solutionSteps: [String],
            answer: String,
          },
        ],
        visualAid: {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: {
            type: String,
            match:
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          },
          altText: String,
        },
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        conceptQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    experiments: [
      {
        title: { type: String, required: true },
        objective: String,
        materials: [String],
        procedure: [String],
        expectedResults: String,
        safetyNotes: [String],
        dataTableTemplate: [
          {
            variable: String,
            unit: String,
            values: [Number],
          },
        ],
        diagram: {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: {
            type: String,
            match:
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          },
          altText: String,
        },
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        experimentExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      },
    ],
    reactionAnalysis: [
      {
        reaction: { type: String, required: true },
        type: {
          type: String,
          enum: [
            "synthesis",
            "decomposition",
            "redox",
            "acid_base",
            "precipitation",
          ],
        },
        balancedEquation: String,
        explanation: String,
        applications: [String],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        reactionQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    workedExamples: [
      {
        problem: { type: String, required: true },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        solutionSteps: [String],
        answer: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    practiceExercises: [
      {
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        description: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    interactiveElements: [
      {
        elementType: {
          type: String,
          enum: INTERACTIVE_ELEMENT_TYPES,
          required: true,
        },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          required: true,
        },
        instructions: String,
        offlineAvailable: { type: Boolean, default: false },
      },
    ],
    summary: {
      keyTakeaways: [String],
      suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    learningObjectives: [String],
    gamification: {
      badges: [String],
      points: { type: Number, default: 0 },
    },
    progressTracking: {
      completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      completionRate: { type: Number, default: 0 },
    },
    accessibilityOptions: {
      hasBraille: Boolean,
      hasSignLanguage: Boolean,
      languages: [String],
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
ChemistryLessonSchema.index({ "concepts.conceptQuizId": 1 });
ChemistryLessonSchema.index({ "experiments.experimentExerciseId": 1 });
ChemistryLessonSchema.index({ "reactionAnalysis.reactionQuizId": 1 });
ChemistryLessonSchema.index({ "practiceExercises.exerciseId": 1 });

// Pre-save hook for reference validation
ChemistryLessonSchema.pre("save", async function (next) {
  const quizIds = [
    ...this.concepts.filter((c) => c.conceptQuizId).map((c) => c.conceptQuizId),
    ...this.reactionAnalysis
      .filter((r) => r.reactionQuizId)
      .map((r) => r.reactionQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose
      .model("Quiz")
      .countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(
        new Error("Invalid Quiz IDs in concepts or reactionAnalysis")
      );
    }
  }
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
      return next(
        new Error("Invalid Exercise IDs in experiments or practiceExercises")
      );
    }
  }
  if (this.prerequisites.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.prerequisites } });
    if (validTopics !== this.prerequisites.length) {
      return next(new Error("Invalid Topic IDs in prerequisites"));
    }
  }
  if (this.summary.suggestedNextTopics.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.summary.suggestedNextTopics } });
    if (validTopics !== this.summary.suggestedNextTopics.length) {
      return next(new Error("Invalid Topic IDs in suggestedNextTopics"));
    }
  }
  next();
});

// Virtual for estimated time
ChemistryLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    this.concepts.length * 15 +
      this.experiments.length * 20 +
      this.reactionAnalysis.length * 10 +
      this.practiceExercises.length * 10
  ); // Example calculation in minutes
});

// Virtual for completion status
ChemistryLessonSchema.virtual("completionStatus").get(function () {
  // Placeholder: Implement based on user progress
  return "not_started";
});

// Biology Lesson Schema (New)
const BiologyLessonSchema = new Schema(
  {
    introduction: {
      text: { type: String, required: true },
      videoUrl: {
        type: String,
        match:
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      transcript: String,
      accessibility: {
        hasSubtitles: Boolean,
        hasAudioDescription: Boolean,
      },
    },
    concepts: [
      {
        name: { type: String, required: true },
        topic: { type: String, enum: BIOLOGY_TOPICS, required: true },
        description: { type: String, required: true },
        keyProcesses: [
          {
            name: String,
            explanation: String,
          },
        ],
        examples: [
          {
            scenario: String,
            explanation: String,
          },
        ],
        visualAid: {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: {
            type: String,
            match:
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          },
          altText: String,
        },
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        conceptQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    experiments: [
      {
        title: { type: String, required: true },
        objective: String,
        materials: [String],
        procedure: [String],
        expectedResults: String,
        safetyNotes: [String],
        dataTableTemplate: [
          {
            variable: String,
            unit: String,
            values: [Number],
          },
        ],
        diagram: {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: {
            type: String,
            match:
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          },
          altText: String,
        },
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        experimentExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      },
    ],
    caseStudies: [
      {
        title: { type: String, required: true },
        context: String,
        questions: [
          {
            question: String,
            type: { type: String, enum: QUESTION_TYPES },
          },
        ],
        keyFindings: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        caseStudyQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    workedExamples: [
      {
        problem: { type: String, required: true },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        solution: String,
        annotations: [String],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    practiceExercises: [
      {
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        description: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    interactiveElements: [
      {
        elementType: {
          type: String,
          enum: INTERACTIVE_ELEMENT_TYPES,
          required: true,
        },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          required: true,
        },
        instructions: String,
        offlineAvailable: { type: Boolean, default: false },
      },
    ],
    summary: {
      keyTakeaways: [String],
      suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    learningObjectives: [String],
    gamification: {
      badges: [String],
      points: { type: Number, default: 0 },
    },
    progressTracking: {
      completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      completionRate: { type: Number, default: 0 },
    },
    accessibilityOptions: {
      hasBraille: Boolean,
      hasSignLanguage: Boolean,
      languages: [String],
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
BiologyLessonSchema.index({ "concepts.conceptQuizId": 1 });
BiologyLessonSchema.index({ "experiments.experimentExerciseId": 1 });
BiologyLessonSchema.index({ "caseStudies.caseStudyQuizId": 1 });
BiologyLessonSchema.index({ "practiceExercises.exerciseId": 1 });

// Pre-save hook for reference validation
BiologyLessonSchema.pre("save", async function (next) {
  const quizIds = [
    ...this.concepts.filter((c) => c.conceptQuizId).map((c) => c.conceptQuizId),
    ...this.caseStudies
      .filter((c) => c.caseStudyQuizId)
      .map((c) => c.caseStudyQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose
      .model("Quiz")
      .countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error("Invalid Quiz IDs in concepts or caseStudies"));
    }
  }
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
      return next(
        new Error("Invalid Exercise IDs in experiments or practiceExercises")
      );
    }
  }
  if (this.prerequisites.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.prerequisites } });
    if (validTopics !== this.prerequisites.length) {
      return next(new Error("Invalid Topic IDs in prerequisites"));
    }
  }
  if (this.summary.suggestedNextTopics.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.summary.suggestedNextTopics } });
    if (validTopics !== this.summary.suggestedNextTopics.length) {
      return next(new Error("Invalid Topic IDs in suggestedNextTopics"));
    }
  }
  next();
});

// Virtual for estimated time
BiologyLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    this.concepts.length * 15 +
      this.experiments.length * 20 +
      this.caseStudies.length * 15 +
      this.practiceExercises.length * 10
  ); // Example calculation in minutes
});

// Virtual for completion status
BiologyLessonSchema.virtual("completionStatus").get(function () {
  // Placeholder: Implement based on user progress
  return "not_started";
});

// Philosophy Lesson Schema (New)
const PhilosophyLessonSchema = new Schema(
  {
    introduction: {
      text: { type: String, required: true },
      videoUrl: {
        type: String,
        match:
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      transcript: String,
      accessibility: {
        hasSubtitles: Boolean,
        hasAudioDescription: Boolean,
      },
    },
    concepts: [
      {
        name: { type: String, required: true },
        topic: { type: String, enum: PHILOSOPHY_TOPICS, required: true },
        description: { type: String, required: true },
        keyThinkers: [
          {
            name: String,
            contribution: String,
          },
        ],
        arguments: [
          {
            premise: String,
            conclusion: String,
            critique: String,
          },
        ],
        visualAid: {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: {
            type: String,
            match:
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          },
          altText: String,
        },
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        conceptQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    textAnalysis: [
      {
        title: { type: String, required: true },
        author: { type: String, required: true },
        excerpt: String,
        context: String,
        questions: [
          {
            question: String,
            type: { type: String, enum: QUESTION_TYPES },
          },
        ],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        textQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    workedExamples: [
      {
        problem: { type: String, required: true },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        solution: String,
        annotations: [String],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    practiceExercises: [
      {
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        description: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    interactiveElements: [
      {
        elementType: {
          type: String,
          enum: INTERACTIVE_ELEMENT_TYPES,
          required: true,
        },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          required: true,
        },
        instructions: String,
        offlineAvailable: { type: Boolean, default: false },
      },
    ],
    summary: {
      keyTakeaways: [String],
      suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    learningObjectives: [String],
    gamification: {
      badges: [String],
      points: { type: Number, default: 0 },
    },
    progressTracking: {
      completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      completionRate: { type: Number, default: 0 },
    },
    accessibilityOptions: {
      hasBraille: Boolean,
      hasSignLanguage: Boolean,
      languages: [String],
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
PhilosophyLessonSchema.index({ "concepts.conceptQuizId": 1 });
PhilosophyLessonSchema.index({ "textAnalysis.textQuizId": 1 });
PhilosophyLessonSchema.index({ "practiceExercises.exerciseId": 1 });

// Pre-save hook for reference validation
PhilosophyLessonSchema.pre("save", async function (next) {
  const quizIds = [
    ...this.concepts.filter((c) => c.conceptQuizId).map((c) => c.conceptQuizId),
    ...this.textAnalysis.filter((t) => t.textQuizId).map((t) => t.textQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose
      .model("Quiz")
      .countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error("Invalid Quiz IDs in concepts or textAnalysis"));
    }
  }
  const exerciseIds = this.practiceExercises.map((p) => p.exerciseId);
  if (exerciseIds.length > 0) {
    const validExercises = await mongoose
      .model("Exercise")
      .countDocuments({ _id: { $in: exerciseIds } });
    if (validExercises !== exerciseIds.length) {
      return next(new Error("Invalid Exercise IDs in practiceExercises"));
    }
  }
  if (this.prerequisites.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.prerequisites } });
    if (validTopics !== this.prerequisites.length) {
      return next(new Error("Invalid Topic IDs in prerequisites"));
    }
  }
  if (this.summary.suggestedNextTopics.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.summary.suggestedNextTopics } });
    if (validTopics !== this.summary.suggestedNextTopics.length) {
      return next(new Error("Invalid Topic IDs in suggestedNextTopics"));
    }
  }
  next();
});

// Virtual for estimated time
PhilosophyLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    this.concepts.length * 15 +
      this.textAnalysis.length * 20 +
      this.practiceExercises.length * 15
  ); // Example calculation in minutes
});

// Virtual for completion status
PhilosophyLessonSchema.virtual("completionStatus").get(function () {
  // Placeholder: Implement based on user progress
  return "not_started";
});

// English Lesson Schema (New)
const EnglishLessonSchema = new Schema(
  {
    introduction: {
      text: { type: String, required: true },
      videoUrl: {
        type: String,
        match:
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      transcript: String,
      accessibility: {
        hasSubtitles: Boolean,
        hasAudioDescription: Boolean,
      },
    },
    grammar: [
      {
        rule: { type: String, required: true },
        topic: { type: String, enum: ENGLISH_TOPICS, default: "grammar" },
        explanation: { type: String, required: true },
        examples: [String],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        grammarExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      },
    ],
    vocabulary: [
      {
        word: { type: String, required: true },
        topic: { type: String, enum: ENGLISH_TOPICS, default: "vocabulary" },
        definition: { type: String, required: true },
        partOfSpeech: String,
        examples: [String],
        pronunciation: String,
        synonyms: [String],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        vocabularyQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    readingComprehension: [
      {
        title: { type: String, required: true },
        text: { type: String, required: true },
        topic: {
          type: String,
          enum: ENGLISH_TOPICS,
          default: "reading_comprehension",
        },
        questions: [
          {
            question: String,
            type: { type: String, enum: QUESTION_TYPES },
          },
        ],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        comprehensionQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    writingSkills: [
      {
        format: { type: String, enum: WRITING_FORMATS, required: true },
        topic: {
          type: String,
          enum: ENGLISH_TOPICS,
          default: "writing_skills",
        },
        guidelines: [String],
        prompts: [
          {
            prompt: String,
            instructions: String,
          },
        ],
        modelAnswer: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        writingExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      },
    ],
    listeningComprehension: [
      {
        title: { type: String, required: true },
        audioUrl: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        },
        topic: {
          type: String,
          enum: ENGLISH_TOPICS,
          default: "listening_comprehension",
        },
        transcript: String,
        questions: [
          {
            question: String,
            type: { type: String, enum: QUESTION_TYPES },
          },
        ],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        listeningQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    speakingSkills: [
      {
        topic: {
          type: String,
          required: true,
          enum: ENGLISH_TOPICS,
          default: "speaking_skills",
        },
        instructions: String,
        sampleDialogue: String,
        pronunciationGuide: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        speakingExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      },
    ],
    workedExamples: [
      {
        problem: { type: String, required: true },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        solution: String,
        annotations: [String],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    practiceExercises: [
      {
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        description: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    interactiveElements: [
      {
        elementType: {
          type: String,
          enum: INTERACTIVE_ELEMENT_TYPES,
          required: true,
        },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          required: true,
        },
        instructions: String,
        offlineAvailable: { type: Boolean, default: false },
      },
    ],
    summary: {
      keyTakeaways: [String],
      suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    learningObjectives: [String],
    gamification: {
      badges: [String],
      points: { type: Number, default: 0 },
    },
    progressTracking: {
      completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      completionRate: { type: Number, default: 0 },
    },
    accessibilityOptions: {
      hasBraille: Boolean,
      hasSignLanguage: Boolean,
      languages: [String],
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
EnglishLessonSchema.index({ "grammar.grammarExerciseId": 1 });
EnglishLessonSchema.index({ "vocabulary.vocabularyQuizId": 1 });
EnglishLessonSchema.index({ "readingComprehension.comprehensionQuizId": 1 });
EnglishLessonSchema.index({ "writingSkills.writingExerciseId": 1 });
EnglishLessonSchema.index({ "listeningComprehension.listeningQuizId": 1 });
EnglishLessonSchema.index({ "speakingSkills.speakingExerciseId": 1 });
EnglishLessonSchema.index({ "practiceExercises.exerciseId": 1 });

// Pre-save hook for reference validation
EnglishLessonSchema.pre("save", async function (next) {
  const quizIds = [
    ...this.vocabulary
      .filter((v) => v.vocabularyQuizId)
      .map((v) => v.vocabularyQuizId),
    ...this.readingComprehension
      .filter((r) => r.comprehensionQuizId)
      .map((r) => r.comprehensionQuizId),
    ...this.listeningComprehension
      .filter((l) => l.listeningQuizId)
      .map((l) => l.listeningQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose
      .model("Quiz")
      .countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(
        new Error(
          "Invalid Quiz IDs in vocabulary, readingComprehension, or listeningComprehension"
        )
      );
    }
  }
  const exerciseIds = [
    ...this.grammar
      .filter((g) => g.grammarExerciseId)
      .map((g) => g.grammarExerciseId),
    ...this.writingSkills
      .filter((w) => w.writingExerciseId)
      .map((w) => w.writingExerciseId),
    ...this.speakingSkills
      .filter((s) => s.speakingExerciseId)
      .map((s) => s.speakingExerciseId),
    ...this.practiceExercises.map((p) => p.exerciseId),
  ];
  if (exerciseIds.length > 0) {
    const validExercises = await mongoose
      .model("Exercise")
      .countDocuments({ _id: { $in: exerciseIds } });
    if (validExercises !== exerciseIds.length) {
      return next(
        new Error(
          "Invalid Exercise IDs in grammar, writingSkills, speakingSkills, or practiceExercises"
        )
      );
    }
  }
  if (this.prerequisites.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.prerequisites } });
    if (validTopics !== this.prerequisites.length) {
      return next(new Error("Invalid Topic IDs in prerequisites"));
    }
  }
  if (this.summary.suggestedNextTopics.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.summary.suggestedNextTopics } });
    if (validTopics !== this.summary.suggestedNextTopics.length) {
      return next(new Error("Invalid Topic IDs in suggestedNextTopics"));
    }
  }
  next();
});

// Virtual for estimated time
EnglishLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    this.grammar.length * 10 +
      this.vocabulary.length * 5 +
      this.readingComprehension.length * 15 +
      this.writingSkills.length * 20 +
      this.listeningComprehension.length * 15 +
      this.speakingSkills.length * 15 +
      this.practiceExercises.length * 10
  ); // Example calculation in minutes
});

// Virtual for completion status
EnglishLessonSchema.virtual("completionStatus").get(function () {
  // Placeholder: Implement based on user progress
  return "not_started";
});

// History Lesson Schema (New)
const HistoryLessonSchema = new Schema(
  {
    introduction: {
      text: { type: String, required: true },
      videoUrl: {
        type: String,
        match:
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      transcript: String,
      accessibility: {
        hasSubtitles: Boolean,
        hasAudioDescription: Boolean,
      },
    },
    concepts: [
      {
        name: { type: String, required: true },
        topic: { type: String, enum: HISTORY_TOPICS, required: true },
        description: { type: String, required: true },
        keyEvents: [
          {
            event: String,
            date: String,
            significance: String,
          },
        ],
        keyFigures: [
          {
            name: String,
            role: String,
          },
        ],
        visualAid: {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: {
            type: String,
            match:
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          },
          altText: String,
        },
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        conceptQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    sourceAnalysis: [
      {
        title: { type: String, required: true },
        sourceType: {
          type: String,
          enum: ["primary", "secondary"],
          required: true,
        },
        excerpt: String,
        author: String,
        date: String,
        context: String,
        questions: [
          {
            question: String,
            type: { type: String, enum: QUESTION_TYPES },
          },
        ],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        sourceQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    timeline: [
      {
        period: { type: String, required: true },
        startDate: String,
        endDate: String,
        events: [
          {
            event: String,
            date: String,
            description: String,
          },
        ],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        timelineExerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
      },
    ],
    workedExamples: [
      {
        problem: { type: String, required: true },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        solution: String,
        annotations: [String],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    practiceExercises: [
      {
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        description: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    interactiveElements: [
      {
        elementType: {
          type: String,
          enum: INTERACTIVE_ELEMENT_TYPES,
          required: true,
        },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9()@:%._\+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          required: true,
        },
        instructions: String,
        offlineAvailable: { type: Boolean, default: false },
      },
    ],
    summary: {
      keyTakeaways: [String],
      suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    learningObjectives: [String],
    gamification: {
      badges: [String],
      points: { type: Number, default: 0 },
    },
    progressTracking: {
      completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      completionRate: { type: Number, default: 0 },
    },
    accessibilityOptions: {
      hasBraille: Boolean,
      hasSignLanguage: Boolean,
      languages: [String],
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
HistoryLessonSchema.index({ "concepts.conceptQuizId": 1 });
HistoryLessonSchema.index({ "sourceAnalysis.sourceQuizId": 1 });
HistoryLessonSchema.index({ "timeline.timelineExerciseId": 1 });
HistoryLessonSchema.index({ "practiceExercises.exerciseId": 1 });

// Pre-save hook for reference validation
HistoryLessonSchema.pre("save", async function (next) {
  const quizIds = [
    ...this.concepts.filter((c) => c.conceptQuizId).map((c) => c.conceptQuizId),
    ...this.sourceAnalysis
      .filter((s) => s.sourceQuizId)
      .map((s) => s.sourceQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose
      .model("Quiz")
      .countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(new Error("Invalid Quiz IDs in concepts or sourceAnalysis"));
    }
  }
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
      return next(
        new Error("Invalid Exercise IDs in timeline or practiceExercises")
      );
    }
  }
  if (this.prerequisites.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.prerequisites } });
    if (validTopics !== this.prerequisites.length) {
      return next(new Error("Invalid Topic IDs in prerequisites"));
    }
  }
  if (this.summary.suggestedNextTopics.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.summary.suggestedNextTopics } });
    if (validTopics !== this.summary.suggestedNextTopics.length) {
      return next(new Error("Invalid Topic IDs in suggestedNextTopics"));
    }
  }
  next();
});

// Virtual for estimated time
HistoryLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    this.concepts.length * 15 +
      this.sourceAnalysis.length * 20 +
      this.timeline.length * 10 +
      this.practiceExercises.length * 15
  ); // Example calculation in minutes
});

// Virtual for completion status
HistoryLessonSchema.virtual("completionStatus").get(function () {
  // Placeholder: Implement based on user progress
  return "not_started";
});

// Geography Lesson Schema (New)
const GeographyLessonSchema = new Schema(
  {
    introduction: {
      text: { type: String, required: true },
      videoUrl: {
        type: String,
        match:
          /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      },
      transcript: String,
      accessibility: {
        hasSubtitles: Boolean,
        hasAudioDescription: Boolean,
      },
    },
    concepts: [
      {
        name: { type: String, required: true },
        topic: { type: String, enum: GEOGRAPHY_TOPICS, required: true },
        description: { type: String, required: true },
        keyFeatures: [
          {
            feature: String,
            explanation: String,
          },
        ],
        examples: [
          {
            example: String,
            explanation: String,
          },
        ],
        visualAid: {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: {
            type: String,
            match:
              /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          },
          altText: String,
        },
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        conceptQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    mapAnalysis: [
      {
        title: { type: String, required: true },
        mapType: {
          type: String,
          enum: ["physical", "political", "thematic"],
          required: true,
        },
        mapUrl: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        },
        description: String,
        questions: [
          {
            question: String,
            type: { type: String, enum: QUESTION_TYPES },
          },
        ],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        mapQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    caseStudies: [
      {
        title: { type: String, required: true },
        region: String,
        context: String,
        data: [
          {
            variable: String,
            value: String,
            unit: String,
          },
        ],
        questions: [
          {
            question: String,
            type: { type: String, enum: QUESTION_TYPES },
          },
        ],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
        caseStudyQuizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
      },
    ],
    workedExamples: [
      {
        problem: { type: String, required: true },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        solution: String,
        annotations: [String],
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    practiceExercises: [
      {
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        type: { type: String, enum: EXERCISE_TYPES, required: true },
        description: String,
        difficultyLevel: {
          type: String,
          enum: DIFFICULTY_LEVELS,
          required: true,
        },
      },
    ],
    interactiveElements: [
      {
        elementType: {
          type: String,
          enum: INTERACTIVE_ELEMENT_TYPES,
          required: true,
        },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
          required: true,
        },
        instructions: String,
        offlineAvailable: { type: Boolean, default: false },
      },
    ],
    summary: {
      keyTakeaways: [String],
      suggestedNextTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    learningObjectives: [String],
    gamification: {
      badges: [String],
      points: { type: Number, default: 0 },
    },
    progressTracking: {
      completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
      completionRate: { type: Number, default: 0 },
    },
    accessibilityOptions: {
      hasBraille: Boolean,
      hasSignLanguage: Boolean,
      languages: [String],
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for performance
GeographyLessonSchema.index({ "concepts.conceptQuizId": 1 });
GeographyLessonSchema.index({ "mapAnalysis.mapQuizId": 1 });
GeographyLessonSchema.index({ "caseStudies.caseStudyQuizId": 1 });
GeographyLessonSchema.index({ "practiceExercises.exerciseId": 1 });

// Pre-save hook for reference validation
GeographyLessonSchema.pre("save", async function (next) {
  const quizIds = [
    ...this.concepts.filter((c) => c.conceptQuizId).map((c) => c.conceptQuizId),
    ...this.mapAnalysis.filter((m) => m.mapQuizId).map((m) => m.mapQuizId),
    ...this.caseStudies
      .filter((c) => c.caseStudyQuizId)
      .map((c) => c.caseStudyQuizId),
  ];
  if (quizIds.length > 0) {
    const validQuizzes = await mongoose
      .model("Quiz")
      .countDocuments({ _id: { $in: quizIds } });
    if (validQuizzes !== quizIds.length) {
      return next(
        new Error("Invalid Quiz IDs in concepts, mapAnalysis, or caseStudies")
      );
    }
  }
  const exerciseIds = this.practiceExercises.map((p) => p.exerciseId);
  if (exerciseIds.length > 0) {
    const validExercises = await mongoose
      .model("Exercise")
      .countDocuments({ _id: { $in: exerciseIds } });
    if (validExercises !== exerciseIds.length) {
      return next(new Error("Invalid Exercise IDs in practiceExercises"));
    }
  }
  if (this.prerequisites.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.prerequisites } });
    if (validTopics !== this.prerequisites.length) {
      return next(new Error("Invalid Topic IDs in prerequisites"));
    }
  }
  if (this.summary.suggestedNextTopics.length > 0) {
    const validTopics = await mongoose
      .model("Topic")
      .countDocuments({ _id: { $in: this.summary.suggestedNextTopics } });
    if (validTopics !== this.summary.suggestedNextTopics.length) {
      return next(new Error("Invalid Topic IDs in suggestedNextTopics"));
    }
  }
  next();
});

// Virtual for estimated time
GeographyLessonSchema.virtual("estimatedTime").get(function () {
  return (
    this.duration ||
    this.concepts.length * 15 +
      this.mapAnalysis.length * 20 +
      this.caseStudies.length * 20 +
      this.practiceExercises.length * 15
  ); // Example calculation in minutes
});

// Virtual for completion status
GeographyLessonSchema.virtual("completionStatus").get(function () {
  // Placeholder: Implement based on user progress
  return "not_started";
});

// Assessment Schema
const AssessmentSchema = new Schema(
  {
    type: { type: String, enum: ["quiz", "exam", "project"], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    passingScore: { type: Number, required: true },
    timeLimit: Number,
    attempts: { type: Number, required: true },
    feedback: {
      immediate: Boolean,
      detailed: Boolean,
      solutions: Boolean,
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const QuestionSchema = new Schema(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    series: String,
    question: { type: String, required: true },
    type: { type: String, enum: QUESTION_TYPES, required: true },
    options: [String],
    correctAnswer: { type: Schema.Types.Mixed, required: true },
    explanation: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    points: { type: Number, required: true },
    steps: [String],
    tags: [String],
    relatedQuestions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    difficultyMetrics: {
      successRate: Number,
      averageTimeToAnswer: Number,
      skipRate: Number,
    },
    content: {
      media: [
        {
          mediaType: { type: String, enum: MEDIA_TYPES },
          url: { type: String, match: /^https?:\/\/.+/ },
          altText: String,
        },
      ],
      accessibility: {
        hasAudioVersion: Boolean,
        hasBrailleVersion: Boolean,
        hasSignLanguageVideo: Boolean,
      },
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const QuizSchema = new Schema(
  {
    title: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: String,
    topicIds: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    totalQuestions: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: String, required: true },
    timeLimit: { type: Number, required: true },
    retakePolicy: {
      maxAttempts: Number,
      cooldownMinutes: Number,
    },
    resultIds: [{ type: Schema.Types.ObjectId, ref: "QuizResult" }],
    offlineAvailable: { type: Boolean, default: false },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const QuizSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    startTime: { type: Date, default: Date.now },
    lastActive: Date,
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: "Question" },
        selectedAnswer: Schema.Types.Mixed,
        timeSpent: Number,
      },
    ],
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      required: true,
    },
    deviceInfo: {
      platform: String,
      version: String,
      lastSync: Date,
    },
  },
  { timestamps: true }
);

const QuizResultSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    correctCount: { type: Number, required: true },
    score: { type: Number, required: true },
    timeTaken: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
    hintUsages: [{ type: Schema.Types.ObjectId, ref: "HintUsage" }],
    questionFeedback: [FeedbackSchema],
    feedback: {
      title: String,
      subtitle: String,
      color: String,
      emoji: String,
      message: String,
    },
  },
  { timestamps: true }
);

// Index for quiz result queries
QuizResultSchema.index({ userId: 1, quizId: 1 });

const HintUsageSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    usedAt: { type: Date, default: Date.now },
    stepsViewed: [Number],
  },
  { timestamps: true }
);

const BookmarkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Base Exercise Schema
const ExerciseBaseSchema = new Schema(
  {
    type: { type: String, enum: EXERCISE_TYPES, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: { type: String, default: "D" },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    timeLimit: { type: Number, min: 0 }, // In minutes
    points: { type: Number, required: true, min: 0 },
    instructions: { type: String, required: true },
    attachments: [
      {
        type: { type: String, enum: ["image", "audio", "video", "document"] },
        url: {
          type: String,
          match:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        },
        description: String,
      },
    ],
    feedback: [FeedbackSchema],
    gamification: {
      badges: [String],
      pointsAwarded: { type: Number, default: 0 },
    },
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now },
      updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      lastModified: { type: Date, default: Date.now },
      tags: [String],
      accessibility: {
        hasAudioVersion: Boolean,
        hasBrailleVersion: Boolean,
        hasSignLanguageVideo: Boolean,
      },
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true, discriminatorKey: "exerciseSubject" }
);

// Math Exercise Schema
const MathExerciseSchema = new Schema({
  topic: { type: String, enum: MATH_TOPICS, required: true },
  content: {
    problems: [
      {
        statement: { type: String, required: true },
        questionType: { type: String, enum: QUESTION_TYPES, required: true },
        variables: [String],
        constraints: [String],
      },
    ],
    formulas: [String],
    calculatorAllowed: { type: Boolean, default: false },
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    workingSteps: [String],
    formulasUsed: [String],
  },
});

// Physics Exercise Schema
const PhysicsExerciseSchema = new Schema({
  topic: { type: String, enum: PHYSICS_TOPICS, required: true },
  content: {
    problems: [
      {
        statement: { type: String, required: true },
        questionType: { type: String, enum: QUESTION_TYPES, required: true },
        variables: [{ name: String, value: String, unit: String }],
      },
    ],
    diagrams: [
      {
        url: String,
        altText: String,
      },
    ],
    formulas: [String],
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    calculations: [String],
  },
});

// Chemistry Exercise Schema
const ChemistryExerciseSchema = new Schema({
  topic: { type: String, enum: CHEMISTRY_TOPICS, required: true },
  content: {
    problems: [
      {
        statement: { type: String, required: true },
        questionType: { type: String, enum: QUESTION_TYPES, required: true },
        reaction: String,
      },
    ],
    labSetup: {
      materials: [String],
      procedure: [String],
    },
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    balancedEquation: String,
  },
});

// Biology Exercise Schema
const BiologyExerciseSchema = new Schema({
  topic: { type: String, enum: BIOLOGY_TOPICS, required: true },
  content: {
    problems: [
      {
        statement: { type: String, required: true },
        questionType: { type: String, enum: QUESTION_TYPES, required: true },
        diagram: { url: String, altText: String },
      },
    ],
    caseStudy: {
      context: String,
      data: [{ variable: String, value: String }],
    },
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    annotations: [String],
  },
});

// French Exercise Schema
const FrenchExerciseSchema = new Schema({
  topic: { type: String, enum: FRENCH_TOPICS, required: true },
  content: {
    textAnalysis: {
      text: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
        },
      ],
    },
    grammarExercises: [
      {
        statement: String,
        questionType: { type: String, enum: QUESTION_TYPES },
      },
    ],
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    modelAnswer: String,
    guidelines: [String],
  },
});

// Philosophy Exercise Schema
const PhilosophyExerciseSchema = new Schema({
  topic: { type: String, enum: PHILOSOPHY_TOPICS, required: true },
  content: {
    questions: [
      {
        question: String,
        questionType: { type: String, enum: QUESTION_TYPES },
        textExcerpt: String,
      },
    ],
    argumentAnalysis: {
      premise: String,
      conclusion: String,
    },
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    critique: String,
  },
});

// English Exercise Schema
const EnglishExerciseSchema = new Schema({
  topic: { type: String, enum: ENGLISH_TOPICS, required: true },
  content: {
    readingComprehension: {
      text: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
        },
      ],
    },
    grammarExercises: [
      {
        statement: String,
        questionType: { type: String, enum: QUESTION_TYPES },
      },
    ],
    writingPrompt: {
      prompt: String,
      instructions: String,
    },
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    modelAnswer: String,
    guidelines: [String],
  },
});

// History Exercise Schema
const HistoryExerciseSchema = new Schema({
  topic: { type: String, enum: HISTORY_TOPICS, required: true },
  content: {
    sourceAnalysis: {
      sourceType: { type: String, enum: ["primary", "secondary"] },
      excerpt: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
        },
      ],
    },
    timelineQuestions: [
      {
        question: String,
        questionType: { type: String, enum: QUESTION_TYPES },
      },
    ],
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    annotations: [String],
  },
});

// Geography Exercise Schema
const GeographyExerciseSchema = new Schema({
  topic: { type: String, enum: GEOGRAPHY_TOPICS, required: true },
  content: {
    mapAnalysis: {
      mapUrl: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
        },
      ],
    },
    caseStudy: {
      region: String,
      questions: [
        {
          question: String,
          questionType: { type: String, enum: QUESTION_TYPES },
        },
      ],
    },
  },
  solution: {
    answers: [{ answer: Schema.Types.Mixed, problemIndex: Number }],
    explanation: String,
    annotations: [String],
  },
});

// Indexes for performance
ExerciseBaseSchema.index({ subjectId: 1, topicId: 1 });
ExerciseBaseSchema.index({ difficulty: 1 });
ExerciseBaseSchema.index({ "metadata.createdBy": 1 });

const ResourceSchema = new Schema(
  {
    type: { type: String, enum: RESOURCE_TYPES, required: true },
    title: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: String,
    topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
    url: { type: String, required: true },
    description: { type: String, required: true },
    level: { type: String, required: true },
    examId: { type: Schema.Types.ObjectId, ref: "Exam" },
    thumbnail: String,
    offlineAvailable: { type: Boolean, default: false },
    premiumOnly: { type: Boolean, default: false },
    metadata: {
      fileSize: Number,
      duration: Number,
      format: String,
      language: String,
      tags: [String],
      difficulty: { type: String, enum: DIFFICULTY_LEVELS },
      prerequisites: [String],
      lastUpdated: Date,
      version: String,
      contributors: [String],
      license: String,
    },
    accessibility: {
      hasTranscript: Boolean,
      hasSubtitles: Boolean,
      hasAudioDescription: Boolean,
    },
    analytics: {
      views: Number,
      downloads: Number,
      averageRating: Number,
      userFeedback: [FeedbackSchema],
    },
  },
  { timestamps: true }
);

const StudyGroupSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    memberIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    challengeIds: [{ type: Schema.Types.ObjectId, ref: "Challenge" }],
    createdAt: { type: Date, default: Date.now },
    features: {
      chatEnabled: Boolean,
      fileSharing: Boolean,
      liveSessions: Boolean,
      progressTracking: Boolean,
    },
    roles: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["admin", "moderator", "member"] },
        permissions: [String],
      },
    ],
    activities: [
      {
        type: { type: String, enum: ["quiz", "discussion", "resource_share"] },
        content: Schema.Types.Mixed,
        createdAt: Date,
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    studySchedule: {
      sessions: [
        {
          day: String,
          time: String,
          topic: String,
          duration: Number,
        },
      ],
    },
    resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
    groupProgressSummary: {
      completedTopics: Number,
      averageScore: Number,
    },
  },
  { timestamps: true }
);

const PeerTutorProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
    series: [String],
    topics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    bio: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviews: [FeedbackSchema],
    isAvailable: { type: Boolean, default: true },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TutoringSessionSchema = new Schema(
  {
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: "PeerTutorProfile",
      required: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: String,
    topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      required: true,
    },
    feedback: String,
    sessionRecording: {
      url: String,
      duration: Number,
    },
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChallengeSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    series: String,
    questionIds: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    timeLimit: { type: Number, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
    endsAt: Date,
    premiumOnly: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const LeaderboardEntrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nationalRank: { type: Number, required: true },
    regionalRank: { type: Number, required: true },
    globalRank: { type: Number, required: true },
    badgeCount: { type: Number, required: true },
    streak: { type: Number, required: true },
    topPerformance: { type: Boolean, default: false },
    mostImproved: Boolean,
    longestStreak: Number,
    history: [
      {
        date: Date,
        rank: Number,
      },
    ],
    series: String,
  },
  { timestamps: true }
);

const MissionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["daily", "weekly", "custom"], required: true },
    progress: { type: Number, default: 0 },
    target: { type: Number, required: true },
    reward: { type: String, required: true },
    icon: { type: String, required: true },
    completed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
    series: String,
  },
  { timestamps: true }
);

const NoteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
    series: String,
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  },
  { timestamps: true }
);

const ExamScheduleSchema = new Schema(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: String,
    level: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: Number, required: true },
    location: String,
    onlineLink: String,
    notes: String,
  },
  { timestamps: true }
);

const CountrySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    flagUrl: { type: String, required: true },
    supportedExams: [{ type: Schema.Types.ObjectId, ref: "Exam" }],
    languages: [String],
  },
  { timestamps: true }
);

const AdaptiveLearningSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    series: String,
    adjustmentRules: [
      {
        metric: { type: String, enum: ["score", "timeSpent", "accuracy"] },
        threshold: Number,
        action: {
          type: String,
          enum: ["increaseDifficulty", "decreaseDifficulty", "suggestResource"],
        },
        resourceId: { type: Schema.Types.ObjectId, ref: "Resource" },
      },
    ],
    recommendedContent: [
      {
        contentType: { type: String, enum: ["topic", "quiz", "resource"] },
        id: String,
      },
    ],
  },
  { timestamps: true }
);

const OnboardingStatusSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    completedSteps: [String],
    currentStep: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const DashboardSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    upcomingExams: [
      {
        examId: { type: Schema.Types.ObjectId, ref: "Exam" },
        series: String,
        date: Date,
      },
    ],
    recentQuizzes: [
      {
        quizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
        score: Number,
        completedAt: Date,
      },
    ],
    recommendedTopics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    streak: { type: Number, default: 0 },
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  },
  { timestamps: true }
);

const ParentAccessSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    parentEmail: { type: String, required: true },
    accessLevel: {
      type: String,
      enum: ["viewProgress", "viewReports", "fullAccess"],
      required: true,
    },
    notifications: [
      {
        type: String,
        frequency: String,
      },
    ],
  },
  { timestamps: true }
);

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["reminder", "achievement", "study_group", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], required: true },
    read: { type: Boolean, default: false },
    actionUrl: String,
    expiresAt: Date,
    metadata: {
      relatedEntityId: String,
      relatedEntityType: String,
    },
  },
  { timestamps: true }
);

const StudyPlanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    targetExam: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    targetSeries: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    dailyGoals: [
      {
        day: String,
        topics: [
          {
            topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
            duration: Number,
            priority: { type: String, enum: ["high", "medium", "low"] },
          },
        ],
        exercises: [
          {
            exerciseId: { type: Schema.Types.ObjectId, ref: "Exercise" },
            count: Number,
            type: String,
          },
        ],
        breaks: [
          {
            startTime: Number,
            endTime: Number,
            duration: Number,
          },
        ],
      },
    ],
    weeklyReview: {
      day: String,
      topics: [String],
      assessmentType: String,
    },
    progressTracking: {
      completedTopics: [String],
      weakAreas: [String],
      strongAreas: [String],
      adjustmentNeeded: Boolean,
    },
    reminders: [
      {
        type: { type: String, enum: ["study", "review", "assessment"] },
        time: String,
        message: String,
        repeat: { type: String, enum: ["daily", "weekly", "monthly"] },
      },
    ],
  },
  { timestamps: true }
);

// Index for study plan queries
StudyPlanSchema.index({ userId: 1, "dailyGoals.topics.topicId": 1 });

const CurriculumSchema = new Schema(
  {
    country: { type: String, required: true },
    educationLevel: { type: String, required: true },
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    series: [String],
    subjects: [
      {
        subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
        name: String,
        description: String,
        topics: [
          {
            topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
            name: String,
            description: String,
            learningObjectives: [String],
            assessmentCriteria: [String],
            resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
          },
        ],
        assessments: [
          {
            type: { type: String, enum: ["formative", "summative"] },
            weightage: Number,
            criteria: [String],
          },
        ],
      },
    ],
    academicYear: {
      startDate: Date,
      endDate: Date,
      terms: [
        {
          term: Number,
          startDate: Date,
          endDate: Date,
          holidays: [
            {
              name: String,
              startDate: Date,
              endDate: Date,
            },
          ],
        },
      ],
    },
  },
  { timestamps: true }
);

const FeedbackLoopSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["question", "exercise", "lesson", "platform"],
      required: true,
    },
    contentId: { type: Schema.Types.ObjectId, required: true },
    feedback: [FeedbackSchema],
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      required: true,
    },
    response: {
      adminId: { type: Schema.Types.ObjectId, ref: "User" },
      message: String,
      date: Date,
    },
    attachments: [String],
  },
  { timestamps: true }
);

const GamifiedProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    series: [String],
    milestones: [
      {
        id: String,
        description: String,
        targetValue: Number,
        currentValue: Number,
        achieved: Boolean,
        achievedDate: Date,
        reward: {
          type: { type: String, enum: ["badge", "points", "feature"] },
          value: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const LearningPathSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    targetExam: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    targetSeries: String,
    duration: { type: Number, required: true },
    levels: [
      {
        level: Number,
        name: String,
        description: String,
        modules: [String],
        prerequisites: [String],
        expectedOutcomes: [String],
      },
    ],
    milestones: [
      {
        id: String,
        name: String,
        description: String,
        requiredAchievements: [String],
        reward: {
          type: { type: String, enum: ["badge", "certificate", "points"] },
          value: String,
        },
      },
    ],
    adaptiveLearning: {
      difficultyAdjustment: Boolean,
      personalizedPacing: Boolean,
      remediationPaths: [
        {
          topicId: String,
          alternativeResources: [String],
          practiceExercises: [String],
        },
      ],
    },
  },
  { timestamps: true }
);

// Models
module.exports = {
  User: mongoose.model("User", UserSchema),
  UserAnalytics: mongoose.model("UserAnalytics", UserAnalyticsSchema),
  Achievement: mongoose.model("Achievement", AchievementSchema),
  Exam: mongoose.model("Exam", ExamSchema),
  Subject: mongoose.model("Subject", SubjectSchema),
  Topic: mongoose.model("Topic", TopicSchema),
  TopicProgress: mongoose.model("TopicProgress", TopicProgressSchema),
  CourseContent: mongoose.model("CourseContent", CourseContentSchema),
  Lesson: mongoose.model("Lesson", LessonBaseSchema),
  FrenchLesson: mongoose
    .model("Lesson")
    .discriminator("french", FrenchLessonSchema),
  MathLesson: mongoose.model("Lesson").discriminator("math", MathLessonSchema),
  PhysicsLesson: mongoose
    .model("Lesson")
    .discriminator("physics", PhysicsLessonSchema),
  ChemistryLesson: mongoose
    .model("Lesson")
    .discriminator("chemistry", ChemistryLessonSchema),
  BiologyLesson: mongoose
    .model("Lesson")
    .discriminator("biology", BiologyLessonSchema),
  PhilosophyLesson: mongoose
    .model("Lesson")
    .discriminator("philosophy", PhilosophyLessonSchema),
  EnglishLesson: mongoose
    .model("Lesson")
    .discriminator("english", EnglishLessonSchema),
  HistoryLesson: mongoose
    .model("Lesson")
    .discriminator("history", HistoryLessonSchema),
  GeographyLesson: mongoose
    .model("Lesson")
    .discriminator("geography", GeographyLessonSchema),
  Assessment: mongoose.model("Assessment", AssessmentSchema),
  Question: mongoose.model("Question", QuestionSchema),
  Quiz: mongoose.model("Quiz", QuizSchema),
  QuizSession: mongoose.model("QuizSession", QuizSessionSchema),
  QuizResult: mongoose.model("QuizResult", QuizResultSchema),
  Hint: mongoose.model("HintUsage", HintUsageSchema),
  Bookmark: mongoose.model("Bookmark", BookmarkSchema),
  Exercise: mongoose.model("Exercise", ExerciseBaseSchema),
  MathExercise: mongoose
    .model("Exercise")
    .discriminator("mathExercise", MathExerciseSchema),
  PhysicsExercise: mongoose
    .model("Exercise")
    .discriminator("physicsExercise", PhysicsExerciseSchema),
  ChemistryExercise: mongoose
    .model("Exercise")
    .discriminator("chemistryExercise", ChemistryExerciseSchema),
  BiologyExercise: mongoose
    .model("Exercise")
    .discriminator("biologyExercise", BiologyExerciseSchema),
  FrenchExercise: mongoose
    .model("Exercise")
    .discriminator("frenchExercise", FrenchExerciseSchema),
  PhilosophyExercise: mongoose
    .model("Exercise")
    .discriminator("philosophyExercise", PhilosophyExerciseSchema),
  EnglishExercise: mongoose
    .model("Exercise")
    .discriminator("englishExercise", EnglishExerciseSchema),
  HistoryExercise: mongoose
    .model("Exercise")
    .discriminator("historyExercise", HistoryExerciseSchema),
  GeographyExercise: mongoose
    .model("Exercise")
    .discriminator("geographyExercise", GeographyExerciseSchema),
  Resource: mongoose.model("Resource", ResourceSchema),
  StudyGroup: mongoose.model("StudyGroup", StudyGroupSchema),
  PeerTutorProfile: mongoose.model("PeerTutorProfile", PeerTutorProfileSchema),
  TutoringSession: mongoose.model("TutoringSession", TutoringSessionSchema),
  Challenge: mongoose.model("Challenge", ChallengeSchema),
  LeaderboardEntry: mongoose.model("LeaderboardEntry", LeaderboardEntrySchema),
  Mission: mongoose.model("Mission", MissionSchema),
  Note: mongoose.model("Note", NoteSchema),
  ExamSchedule: mongoose.model("ExamSchedule", ExamScheduleSchema),
  Country: mongoose.model("Country", CountrySchema),
  AdaptiveLearning: mongoose.model("AdaptiveLearning", AdaptiveLearningSchema),
  OnboardingStatus: mongoose.model("OnboardingStatus", OnboardingStatusSchema),
  Dashboard: mongoose.model("Dashboard", DashboardSchema),
  ParentAccess: mongoose.model("ParentAccess", ParentAccessSchema),
  Notification: mongoose.model("Notification", NotificationSchema),
  StudyPlan: mongoose.model("StudyPlan", StudyPlanSchema),
  Curriculum: mongoose.model("Curriculum", CurriculumSchema),
  FeedbackLoop: mongoose.model("FeedbackLoop", FeedbackLoopSchema),
  GamifiedProgress: mongoose.model("GamifiedProgress", GamifiedProgressSchema),
  LearningPath: mongoose.model("LearningPath", LearningPathSchema),
};
