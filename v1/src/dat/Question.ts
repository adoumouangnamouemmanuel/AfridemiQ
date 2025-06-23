import { Question } from "./AfricaExamPrepDataStructure";

const questions: Question[] = [
  {
    id: "question-001",
    topicId: "topic-001",
    subjectId: "subject-001",
    series: "Bac_D",
    question: "What is lim(x→2) (x²-4)/(x-2)?",
    type: "multiple_choice",
    options: ["2", "4", "6", "Undefined"],
    correctAnswer: "4",
    explanation: "Simplify (x²-4)/(x-2) to x+2, then evaluate at x=2.",
    difficulty: "Medium",
    points: 10,
    steps: ["Factor numerator", "Cancel (x-2)", "Evaluate"],
    tags: ["limits", "calculus"],
    relatedQuestions: [],
    difficultyMetrics: {
      successRate: 70,
      averageTimeToAnswer: 30,
      skipRate: 10,
    },
    content: {
      accessibility: {
        hasAudioVersion: true,
        hasBrailleVersion: false,
        hasSignLanguageVideo: false,
      },
    },
    premiumOnly: false,
  },
  {
    id: "question-002",
    topicId: "topic-002",
    subjectId: "subject-002",
    series: "Bac_D",
    question: "What is the main theme in Voltaire’s Candide?",
    type: "essay",
    correctAnswer: "Satire of optimism",
    explanation:
      "Candide critiques Pangloss’s philosophy through irony and events.",
    difficulty: "Hard",
    points: 20,
    tags: ["dissertation", "literature"],
    relatedQuestions: [],
    difficultyMetrics: {
      successRate: 60,
      averageTimeToAnswer: 600,
      skipRate: 15,
    },
    content: {
      accessibility: {
        hasAudioVersion: true,
        hasBrailleVersion: false,
        hasSignLanguageVideo: false,
      },
    },
    premiumOnly: false,
  },
];

export { questions };