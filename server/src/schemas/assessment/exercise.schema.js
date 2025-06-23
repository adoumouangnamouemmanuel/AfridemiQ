const Joi = require("joi");

// Constants for validation
const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];
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

const SUBJECT_TYPES = [
  "math",
  "physics",
  "chemistry",
  "biology",
  "french",
  "philosophy",
  "english",
  "history",
  "geography",
];

// Common schemas
const objectIdSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message("Invalid ObjectId format");

const attachmentSchema = Joi.object({
  type: Joi.string().valid("image", "audio", "video", "document").required(),
  url: Joi.string().uri().required(),
  description: Joi.string().optional(),
  size: Joi.number().positive().optional(),
  filename: Joi.string().optional(),
});

const feedbackItemSchema = Joi.object({
  userId: objectIdSchema.required(),
  rating: Joi.number().min(0).max(5).required(),
  comments: Joi.string().optional(),
});

const gamificationSchema = Joi.object({
  badges: Joi.array().items(Joi.string()).optional(),
  pointsAwarded: Joi.number().min(0).default(0),
  achievements: Joi.array().items(Joi.string()).optional(),
  streakBonus: Joi.number().min(0).default(0),
});

const accessibilitySchema = Joi.object({
  hasAudioVersion: Joi.boolean().default(false),
  hasBrailleVersion: Joi.boolean().default(false),
  hasSignLanguageVideo: Joi.boolean().default(false),
  screenReaderFriendly: Joi.boolean().default(true),
});

const metadataSchema = Joi.object({
  createdBy: objectIdSchema.optional(),
  updatedBy: objectIdSchema.optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  version: Joi.number().positive().default(1),
  status: Joi.string().valid("draft", "published", "archived").default("draft"),
  accessibility: accessibilitySchema.optional(),
});

const settingsSchema = Joi.object({
  allowHints: Joi.boolean().default(true),
  showSolution: Joi.boolean().default(true),
  randomizeQuestions: Joi.boolean().default(false),
  allowRetake: Joi.boolean().default(true),
  maxAttempts: Joi.number().positive().default(3),
});

// Subject-specific content schemas
const mathContentSchema = Joi.object({
  problems: Joi.array()
    .items(
      Joi.object({
        statement: Joi.string().required(),
        questionType: Joi.string()
          .valid(...QUESTION_TYPES)
          .required(),
        variables: Joi.array().items(Joi.string()).optional(),
        constraints: Joi.array().items(Joi.string()).optional(),
        difficulty: Joi.string()
          .valid(...DIFFICULTY_LEVELS)
          .optional(),
        points: Joi.number().positive().default(1),
      })
    )
    .required(),
  formulas: Joi.array().items(Joi.string()).optional(),
  calculatorAllowed: Joi.boolean().default(false),
  graphingRequired: Joi.boolean().default(false),
  theorems: Joi.array().items(Joi.string()).optional(),
});

const mathSolutionSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        answer: Joi.any().required(),
        problemIndex: Joi.number().required(),
        explanation: Joi.string().optional(),
        alternativeAnswers: Joi.array().items(Joi.any()).optional(),
      })
    )
    .required(),
  explanation: Joi.string().optional(),
  workingSteps: Joi.array().items(Joi.string()).optional(),
  formulasUsed: Joi.array().items(Joi.string()).optional(),
  commonMistakes: Joi.array().items(Joi.string()).optional(),
});

const physicsContentSchema = Joi.object({
  problems: Joi.array()
    .items(
      Joi.object({
        statement: Joi.string().required(),
        questionType: Joi.string()
          .valid(...QUESTION_TYPES)
          .required(),
        variables: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              value: Joi.string().required(),
              unit: Joi.string().required(),
            })
          )
          .optional(),
        constants: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              value: Joi.string().required(),
              unit: Joi.string().required(),
            })
          )
          .optional(),
        difficulty: Joi.string()
          .valid(...DIFFICULTY_LEVELS)
          .optional(),
        points: Joi.number().positive().default(1),
      })
    )
    .required(),
  diagrams: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        altText: Joi.string().required(),
        caption: Joi.string().optional(),
        type: Joi.string()
          .valid("circuit", "force", "wave", "field")
          .optional(),
      })
    )
    .optional(),
  formulas: Joi.array().items(Joi.string()).optional(),
  experiments: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        procedure: Joi.array().items(Joi.string()).required(),
        materials: Joi.array().items(Joi.string()).required(),
        safetyNotes: Joi.array().items(Joi.string()).optional(),
      })
    )
    .optional(),
});

const physicsSolutionSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        answer: Joi.any().required(),
        problemIndex: Joi.number().required(),
        unit: Joi.string().optional(),
        explanation: Joi.string().optional(),
      })
    )
    .required(),
  explanation: Joi.string().optional(),
  calculations: Joi.array().items(Joi.string()).optional(),
  physicalInterpretation: Joi.string().optional(),
});

const chemistryContentSchema = Joi.object({
  problems: Joi.array()
    .items(
      Joi.object({
        statement: Joi.string().required(),
        questionType: Joi.string()
          .valid(...QUESTION_TYPES)
          .required(),
        reaction: Joi.string().optional(),
        compounds: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              formula: Joi.string().required(),
              molarity: Joi.number().optional(),
            })
          )
          .optional(),
        difficulty: Joi.string()
          .valid(...DIFFICULTY_LEVELS)
          .optional(),
        points: Joi.number().positive().default(1),
      })
    )
    .required(),
  labSetup: Joi.object({
    materials: Joi.array().items(Joi.string()).optional(),
    procedure: Joi.array().items(Joi.string()).optional(),
    safetyPrecautions: Joi.array().items(Joi.string()).optional(),
    equipment: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  periodicTableRequired: Joi.boolean().default(false),
});

const chemistrySolutionSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        answer: Joi.any().required(),
        problemIndex: Joi.number().required(),
        unit: Joi.string().optional(),
        explanation: Joi.string().optional(),
      })
    )
    .required(),
  explanation: Joi.string().optional(),
  balancedEquation: Joi.string().optional(),
  calculations: Joi.array().items(Joi.string()).optional(),
  mechanisms: Joi.array().items(Joi.string()).optional(),
});

const biologyContentSchema = Joi.object({
  problems: Joi.array()
    .items(
      Joi.object({
        statement: Joi.string().required(),
        questionType: Joi.string()
          .valid(...QUESTION_TYPES)
          .required(),
        diagram: Joi.object({
          url: Joi.string().uri().required(),
          altText: Joi.string().required(),
          labels: Joi.array().items(Joi.string()).optional(),
        }).optional(),
        difficulty: Joi.string()
          .valid(...DIFFICULTY_LEVELS)
          .optional(),
        points: Joi.number().positive().default(1),
      })
    )
    .required(),
  caseStudy: Joi.object({
    context: Joi.string().optional(),
    data: Joi.array()
      .items(
        Joi.object({
          variable: Joi.string().required(),
          value: Joi.string().required(),
          unit: Joi.string().optional(),
        })
      )
      .optional(),
    scenario: Joi.string().optional(),
  }).optional(),
  specimens: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required(),
        characteristics: Joi.array().items(Joi.string()).optional(),
        habitat: Joi.string().optional(),
      })
    )
    .optional(),
});

const biologySolutionSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        answer: Joi.any().required(),
        problemIndex: Joi.number().required(),
        explanation: Joi.string().optional(),
      })
    )
    .required(),
  explanation: Joi.string().optional(),
  annotations: Joi.array().items(Joi.string()).optional(),
  biologicalProcesses: Joi.array().items(Joi.string()).optional(),
});

const frenchContentSchema = Joi.object({
  textAnalysis: Joi.object({
    text: Joi.string().required(),
    author: Joi.string().optional(),
    genre: Joi.string().optional(),
    period: Joi.string().optional(),
    questions: Joi.array()
      .items(
        Joi.object({
          question: Joi.string().required(),
          questionType: Joi.string()
            .valid(...QUESTION_TYPES)
            .required(),
          difficulty: Joi.string()
            .valid(...DIFFICULTY_LEVELS)
            .optional(),
          points: Joi.number().positive().default(1),
        })
      )
      .required(),
  }).optional(),
  grammarExercises: Joi.array()
    .items(
      Joi.object({
        statement: Joi.string().required(),
        questionType: Joi.string()
          .valid(...QUESTION_TYPES)
          .required(),
        grammarRule: Joi.string().optional(),
        difficulty: Joi.string()
          .valid(...DIFFICULTY_LEVELS)
          .optional(),
        points: Joi.number().positive().default(1),
      })
    )
    .optional(),
  vocabulary: Joi.object({
    words: Joi.array()
      .items(
        Joi.object({
          word: Joi.string().required(),
          definition: Joi.string().required(),
          example: Joi.string().optional(),
        })
      )
      .optional(),
    context: Joi.string().optional(),
  }).optional(),
});

const frenchSolutionSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        answer: Joi.any().required(),
        problemIndex: Joi.number().required(),
        explanation: Joi.string().optional(),
      })
    )
    .required(),
  modelAnswer: Joi.string().optional(),
  guidelines: Joi.array().items(Joi.string()).optional(),
  grammarExplanations: Joi.array().items(Joi.string()).optional(),
});

const philosophyContentSchema = Joi.object({
  questions: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().required(),
        questionType: Joi.string()
          .valid(...QUESTION_TYPES)
          .required(),
        textExcerpt: Joi.string().optional(),
        philosopher: Joi.string().optional(),
        work: Joi.string().optional(),
        difficulty: Joi.string()
          .valid(...DIFFICULTY_LEVELS)
          .optional(),
        points: Joi.number().positive().default(1),
      })
    )
    .required(),
  argumentAnalysis: Joi.object({
    premise: Joi.string().optional(),
    conclusion: Joi.string().optional(),
    logicalStructure: Joi.string().optional(),
    fallacies: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  concepts: Joi.array()
    .items(
      Joi.object({
        term: Joi.string().required(),
        definition: Joi.string().required(),
        philosopher: Joi.string().optional(),
        context: Joi.string().optional(),
      })
    )
    .optional(),
});

const philosophySolutionSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        answer: Joi.any().required(),
        problemIndex: Joi.number().required(),
        explanation: Joi.string().optional(),
      })
    )
    .required(),
  explanation: Joi.string().optional(),
  critique: Joi.string().optional(),
  philosophicalFramework: Joi.string().optional(),
});

const englishContentSchema = Joi.object({
  readingComprehension: Joi.object({
    text: Joi.string().required(),
    author: Joi.string().optional(),
    genre: Joi.string().optional(),
    wordCount: Joi.number().positive().optional(),
    questions: Joi.array()
      .items(
        Joi.object({
          question: Joi.string().required(),
          questionType: Joi.string()
            .valid(...QUESTION_TYPES)
            .required(),
          difficulty: Joi.string()
            .valid(...DIFFICULTY_LEVELS)
            .optional(),
          points: Joi.number().positive().default(1),
        })
      )
      .required(),
  }).optional(),
  grammarExercises: Joi.array()
    .items(
      Joi.object({
        statement: Joi.string().required(),
        questionType: Joi.string()
          .valid(...QUESTION_TYPES)
          .required(),
        grammarRule: Joi.string().optional(),
        difficulty: Joi.string()
          .valid(...DIFFICULTY_LEVELS)
          .optional(),
        points: Joi.number().positive().default(1),
      })
    )
    .optional(),
  writingPrompt: Joi.object({
    prompt: Joi.string().required(),
    instructions: Joi.string().required(),
    wordLimit: Joi.number().positive().optional(),
    format: Joi.string().optional(),
  }).optional(),
  vocabulary: Joi.object({
    words: Joi.array()
      .items(
        Joi.object({
          word: Joi.string().required(),
          definition: Joi.string().required(),
          example: Joi.string().optional(),
          level: Joi.string().optional(),
        })
      )
      .optional(),
  }).optional(),
});

const englishSolutionSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        answer: Joi.any().required(),
        problemIndex: Joi.number().required(),
        explanation: Joi.string().optional(),
      })
    )
    .required(),
  modelAnswer: Joi.string().optional(),
  guidelines: Joi.array().items(Joi.string()).optional(),
  rubric: Joi.object({
    criteria: Joi.array().items(Joi.string()).optional(),
    scoring: Joi.string().optional(),
  }).optional(),
});

const historyContentSchema = Joi.object({
  sourceAnalysis: Joi.object({
    sourceType: Joi.string().valid("primary", "secondary").required(),
    excerpt: Joi.string().required(),
    author: Joi.string().optional(),
    date: Joi.string().optional(),
    context: Joi.string().optional(),
    questions: Joi.array()
      .items(
        Joi.object({
          question: Joi.string().required(),
          questionType: Joi.string()
            .valid(...QUESTION_TYPES)
            .required(),
          difficulty: Joi.string()
            .valid(...DIFFICULTY_LEVELS)
            .optional(),
          points: Joi.number().positive().default(1),
        })
      )
      .required(),
  }).optional(),
  timelineQuestions: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().required(),
        questionType: Joi.string()
          .valid(...QUESTION_TYPES)
          .required(),
        period: Joi.string().optional(),
        difficulty: Joi.string()
          .valid(...DIFFICULTY_LEVELS)
          .optional(),
        points: Joi.number().positive().default(1),
      })
    )
    .optional(),
  events: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        date: Joi.string().required(),
        significance: Joi.string().optional(),
        causes: Joi.array().items(Joi.string()).optional(),
        consequences: Joi.array().items(Joi.string()).optional(),
      })
    )
    .optional(),
});

const historySolutionSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        answer: Joi.any().required(),
        problemIndex: Joi.number().required(),
        explanation: Joi.string().optional(),
      })
    )
    .required(),
  explanation: Joi.string().optional(),
  annotations: Joi.array().items(Joi.string()).optional(),
  historicalContext: Joi.string().optional(),
});

const geographyContentSchema = Joi.object({
  mapAnalysis: Joi.object({
    mapUrl: Joi.string().uri().required(),
    mapType: Joi.string()
      .valid("physical", "political", "climate", "economic")
      .optional(),
    scale: Joi.string().optional(),
    region: Joi.string().optional(),
    questions: Joi.array()
      .items(
        Joi.object({
          question: Joi.string().required(),
          questionType: Joi.string()
            .valid(...QUESTION_TYPES)
            .required(),
          difficulty: Joi.string()
            .valid(...DIFFICULTY_LEVELS)
            .optional(),
          points: Joi.number().positive().default(1),
        })
      )
      .required(),
  }).optional(),
  caseStudy: Joi.object({
    region: Joi.string().required(),
    country: Joi.string().optional(),
    population: Joi.number().positive().optional(),
    area: Joi.number().positive().optional(),
    climate: Joi.string().optional(),
    questions: Joi.array()
      .items(
        Joi.object({
          question: Joi.string().required(),
          questionType: Joi.string()
            .valid(...QUESTION_TYPES)
            .required(),
          difficulty: Joi.string()
            .valid(...DIFFICULTY_LEVELS)
            .optional(),
          points: Joi.number().positive().default(1),
        })
      )
      .required(),
  }).optional(),
  fieldwork: Joi.object({
    location: Joi.string().required(),
    methodology: Joi.string().required(),
    dataCollection: Joi.array().items(Joi.string()).optional(),
    analysis: Joi.string().optional(),
  }).optional(),
});

const geographySolutionSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        answer: Joi.any().required(),
        problemIndex: Joi.number().required(),
        explanation: Joi.string().optional(),
      })
    )
    .required(),
  explanation: Joi.string().optional(),
  annotations: Joi.array().items(Joi.string()).optional(),
  geographicalProcesses: Joi.array().items(Joi.string()).optional(),
});

// Base exercise schema
const baseExerciseSchema = Joi.object({
  type: Joi.string()
    .valid(...EXERCISE_TYPES)
    .required(),
  subjectId: objectIdSchema.required(),
  series: Joi.array().items(Joi.string()).default(["D"]),
  topicId: objectIdSchema.required(),
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .required(),
  timeLimit: Joi.number().min(0).default(15),
  points: Joi.number().min(0).required(),
  instructions: Joi.string().trim().required(),
  attachments: Joi.array().items(attachmentSchema).optional(),
  feedback: Joi.array().items(feedbackItemSchema).optional(),
  gamification: gamificationSchema.optional(),
  metadata: metadataSchema.optional(),
  settings: settingsSchema.optional(),
  premiumOnly: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
});

// Subject-specific exercise schemas
const mathExerciseSchema = baseExerciseSchema.keys({
  subjectType: Joi.string().valid("math").required(),
  topic: Joi.string()
    .valid("algebra", "geometry", "calculus", "statistics")
    .required(),
  content: mathContentSchema.required(),
  solution: mathSolutionSchema.required(),
});

const physicsExerciseSchema = baseExerciseSchema.keys({
  subjectType: Joi.string().valid("physics").required(),
  topic: Joi.string()
    .valid("mechanics", "electromagnetism", "thermodynamics", "optics")
    .required(),
  content: physicsContentSchema.required(),
  solution: physicsSolutionSchema.required(),
});

const chemistryExerciseSchema = baseExerciseSchema.keys({
  subjectType: Joi.string().valid("chemistry").required(),
  topic: Joi.string()
    .valid(
      "stoichiometry",
      "organic_chemistry",
      "thermodynamics",
      "acids_bases"
    )
    .required(),
  content: chemistryContentSchema.required(),
  solution: chemistrySolutionSchema.required(),
});

const biologyExerciseSchema = baseExerciseSchema.keys({
  subjectType: Joi.string().valid("biology").required(),
  topic: Joi.string()
    .valid("cell_biology", "genetics", "ecology", "physiology")
    .required(),
  content: biologyContentSchema.required(),
  solution: biologySolutionSchema.required(),
});

const frenchExerciseSchema = baseExerciseSchema.keys({
  subjectType: Joi.string().valid("french").required(),
  topic: Joi.string()
    .valid("grammar", "literature", "text_analysis", "composition")
    .required(),
  content: frenchContentSchema.required(),
  solution: frenchSolutionSchema.required(),
});

const philosophyExerciseSchema = baseExerciseSchema.keys({
  subjectType: Joi.string().valid("philosophy").required(),
  topic: Joi.string()
    .valid("ethics", "metaphysics", "epistemology", "political_philosophy")
    .required(),
  content: philosophyContentSchema.required(),
  solution: philosophySolutionSchema.required(),
});

const englishExerciseSchema = baseExerciseSchema.keys({
  subjectType: Joi.string().valid("english").required(),
  topic: Joi.string()
    .valid("grammar", "reading_comprehension", "writing_skills", "speaking")
    .required(),
  content: englishContentSchema.required(),
  solution: englishSolutionSchema.required(),
});

const historyExerciseSchema = baseExerciseSchema.keys({
  subjectType: Joi.string().valid("history").required(),
  topic: Joi.string()
    .valid(
      "colonialism",
      "independence_movements",
      "world_wars",
      "chadian_history"
    )
    .required(),
  content: historyContentSchema.required(),
  solution: historySolutionSchema.required(),
});

const geographyExerciseSchema = baseExerciseSchema.keys({
  subjectType: Joi.string().valid("geography").required(),
  topic: Joi.string()
    .valid(
      "physical_geography",
      "human_geography",
      "climate_and_environment",
      "chadian_geography"
    )
    .required(),
  content: geographyContentSchema.required(),
  solution: geographySolutionSchema.required(),
});

// Main create exercise schema with conditional validation
const createExerciseSchema = Joi.object({
  body: Joi.alternatives()
    .try(
      mathExerciseSchema,
      physicsExerciseSchema,
      chemistryExerciseSchema,
      biologyExerciseSchema,
      frenchExerciseSchema,
      philosophyExerciseSchema,
      englishExerciseSchema,
      historyExerciseSchema,
      geographyExerciseSchema
    )
    .required(),
});

// Update exercise schema (all fields optional except subjectType for validation)
const updateExerciseSchema = Joi.object({
  body: baseExerciseSchema
    .keys({
      subjectType: Joi.string()
        .valid(...SUBJECT_TYPES)
        .optional(),
      topic: Joi.string().optional(),
      content: Joi.object().optional(),
      solution: Joi.object().optional(),
    })
    .min(1),
});

// Query schema for filtering exercises
const exerciseQuerySchema = Joi.object({
  subjectId: objectIdSchema.optional(),
  topicId: objectIdSchema.optional(),
  difficulty: Joi.string()
    .valid(...DIFFICULTY_LEVELS)
    .optional(),
  type: Joi.string()
    .valid(...EXERCISE_TYPES)
    .optional(),
  subjectType: Joi.string()
    .valid(...SUBJECT_TYPES)
    .optional(),
  premiumOnly: Joi.boolean().optional(),
  createdBy: objectIdSchema.optional(),
  tags: Joi.string().optional(),
  search: Joi.string().optional(),
  page: Joi.number().positive().default(1),
  limit: Joi.number().positive().max(100).default(10),
  sortBy: Joi.string()
    .valid(
      "createdAt",
      "title",
      "difficulty",
      "points",
      "analytics.averageScore"
    )
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  populate: Joi.string().optional(),
});

// Feedback schema
const feedbackSchema = Joi.object({
  body: Joi.object({
    rating: Joi.number().min(0).max(5).required(),
    comments: Joi.string().optional(),
  }).required(),
});

// Analytics schema
const analyticsSchema = Joi.object({
  body: Joi.object({
    score: Joi.number().min(0).max(100).required(),
    timeSpent: Joi.number().positive().required(),
  }).required(),
});

// Bulk operation schemas
const bulkCreateSchema = Joi.object({
  body: Joi.array()
    .items(
      Joi.alternatives().try(
        mathExerciseSchema.keys({ body: Joi.forbidden() }),
        physicsExerciseSchema.keys({ body: Joi.forbidden() }),
        chemistryExerciseSchema.keys({ body: Joi.forbidden() }),
        biologyExerciseSchema.keys({ body: Joi.forbidden() }),
        frenchExerciseSchema.keys({ body: Joi.forbidden() }),
        philosophyExerciseSchema.keys({ body: Joi.forbidden() }),
        englishExerciseSchema.keys({ body: Joi.forbidden() }),
        historyExerciseSchema.keys({ body: Joi.forbidden() }),
        geographyExerciseSchema.keys({ body: Joi.forbidden() })
      )
    )
    .min(1)
    .max(50)
    .required(),
});

const bulkUpdateSchema = Joi.object({
  body: Joi.object({
    exerciseIds: Joi.array().items(objectIdSchema).min(1).max(100).required(),
    updateData: Joi.object({
      difficulty: Joi.string()
        .valid(...DIFFICULTY_LEVELS)
        .optional(),
      type: Joi.string()
        .valid(...EXERCISE_TYPES)
        .optional(),
      premiumOnly: Joi.boolean().optional(),
      isActive: Joi.boolean().optional(),
      "metadata.status": Joi.string()
        .valid("draft", "published", "archived")
        .optional(),
      "metadata.tags": Joi.array().items(Joi.string()).optional(),
      "settings.allowHints": Joi.boolean().optional(),
      "settings.showSolution": Joi.boolean().optional(),
      "settings.allowRetake": Joi.boolean().optional(),
      "settings.maxAttempts": Joi.number().positive().optional(),
    })
      .min(1)
      .required(),
  }).required(),
});

const bulkDeleteSchema = Joi.object({
  body: Joi.object({
    exerciseIds: Joi.array().items(objectIdSchema).min(1).max(100).required(),
  }).required(),
});

// Advanced search schema
const advancedSearchSchema = Joi.object({
  body: Joi.object({
    keywords: Joi.string().optional(),
    subjects: Joi.array().items(objectIdSchema).optional(),
    topics: Joi.array().items(objectIdSchema).optional(),
    difficulties: Joi.array()
      .items(Joi.string().valid(...DIFFICULTY_LEVELS))
      .optional(),
    types: Joi.array()
      .items(Joi.string().valid(...EXERCISE_TYPES))
      .optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    dateRange: Joi.object({
      start: Joi.date().iso().optional(),
      end: Joi.date().iso().min(Joi.ref("start")).optional(),
    }).optional(),
    ratingRange: Joi.object({
      min: Joi.number().min(0).max(5).optional(),
      max: Joi.number().min(Joi.ref("min")).max(5).optional(),
    }).optional(),
    premiumOnly: Joi.boolean().optional(),
  })
    .min(1)
    .required(),
});

module.exports = {
  createExerciseSchema,
  updateExerciseSchema,
  exerciseQuerySchema,
  feedbackSchema,
  analyticsSchema,
  bulkCreateSchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
  advancedSearchSchema,
};