import { Exercise } from "./AfricaExamPrepDataStructure";

const exercises: Exercise[] = [
  {
    id: "exercise-001",
    type: "practice",
    subjectId: "subject-001",
    series: "Bac_D",
    topicId: "topic-001",
    title: "Limits Practice",
    description: "Solve problems on limits of functions.",
    difficulty: "intermediate",
    timeLimit: 30,
    points: 50,
    content: {
      instructions: "Evaluate the given limits.",
      subjectSpecific: {
        type: "math",
        data: {
          math: {
            problems: {
                statement: "Find lim(x→2) (x²-4)/(x-2)",
                variables: ["x"],
                constraints: ["x ≠ 2"],
            },
            formulas: ["lim(x→a) (x²-a²)/(x-a) = 2a"],
            calculatorAllowed: true,
          },
        },
      },
    },
    solution: {
      answer: "4",
      explanation: "Simplify (x²-4)/(x-2) to x+2, then evaluate at x=2.",
      steps: [
        "Factor numerator: x²-4 = (x-2)(x+2)",
        "Cancel (x-2)",
        "Evaluate lim(x→2) (x+2) = 4",
      ],
      subjectSpecific: {
        type: "math",
        data: {
          math: {
            workingSteps: ["Factor", "Simplify", "Evaluate"],
            formulas: ["lim(x→a) (x²-a²)/(x-a) = 2a"],
          },
        },
      },
    },
    metadata: {
      createdBy: "admin-001",
      createdAt: "2025-01-01T00:00:00Z",
      lastModified: "2025-01-01T00:00:00Z",
      version: 1,
      tags: ["limits", "calculus"],
      difficultyMetrics: {
        successRate: 70,
        averageTimeToComplete: 300,
        skipRate: 10,
      },
      accessibility: {
        hasAudioVersion: true,
        hasBrailleVersion: false,
        hasSignLanguageVideo: false,
      },
    },
    premiumOnly: false,
  },
  {
    id: "exercise-002",
    type: "assignment",
    subjectId: "subject-002",
    series: "Bac_D",
    topicId: "topic-002",
    title: "Dissertation Practice",
    description: "Write a dissertation on a literary theme.",
    difficulty: "advanced",
    timeLimit: 120,
    points: 100,
    content: {
      instructions: "Write a dissertation analyzing optimism in Candide.",
      subjectSpecific: {
        type: "french",
        data: {
          french: {
            writingTask: {
              type: "essay",
              prompt: "Discuss optimism in Candide",
              guidelines: ["Clear thesis", "Use textual evidence"],
            },
          },
        },
      },
    },
    solution: {
      answer: "Sample essay",
      explanation:
        "A strong dissertation includes a thesis, evidence, and conclusion.",
      subjectSpecific: {
        type: "french",
        data: {
          french: {
            sampleResponse:
              "Optimism in Candide is satirized through Pangloss’s philosophy...",
            grammarNotes: ["Use subjunctive for hypothetical statements"],
            vocabularyUsage: ["ironie", "optimisme"],
          },
        },
      },
    },
    metadata: {
      createdBy: "admin-001",
      createdAt: "2025-01-01T00:00:00Z",
      lastModified: "2025-01-01T00:00:00Z",
      version: 1,
      tags: ["dissertation", "literature"],
      difficultyMetrics: {
        successRate: 60,
        averageTimeToComplete: 3600,
        skipRate: 15,
      },
      accessibility: {
        hasAudioVersion: true,
        hasBrailleVersion: false,
        hasSignLanguageVideo: false,
      },
    },
    premiumOnly: false,
  },
];

export { exercises };