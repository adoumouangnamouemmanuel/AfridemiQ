import { Lesson } from "./AfricaExamPrepDataStructure";

const lessons: Lesson[] = [
  {
    id: "lesson-001",
    title: "Introduction to Limits",
    series: "Bac_D",
    content: {
      type: "math",
      overview: "Learn the concept of limits in calculus.",
      objectives: [
        "Understand limit definitions",
        "Solve basic limit problems",
      ],
      keyPoints: ["Limit notation", "One-sided limits"],
      data: {
        math: {
          concepts: {
            name: "Limit",
            definition: "Value a function approaches as input nears a point",
            examples: ["lim(x→2) x² = 4"],
            formulas: ["lim(x→a) f(x) = L"],
          },
          interactiveElements: [
            {
              type: "graph",
              url: "https://example.com/graphs/limit",
              instructions: "Plot f(x)=x²",
            },
          ],
        },
      },
    },
    duration: 60,
    resourceIds: ["resource-001"],
    exerciseIds: ["exercise-001"],
    interactivityLevel: "medium",
    offlineAvailable: true,
    premiumOnly: false,
  },
  {
    id: "lesson-002",
    title: "Writing a Dissertation",
    series: "Bac_D",
    content: {
      type: "french",
      overview: "Learn to write structured dissertations.",
      objectives: ["Structure an essay", "Analyze literary texts"],
      keyPoints: ["Introduction, body, conclusion", "Thesis statement"],
      data: {
        french: {
          literaryAnalysis: {
            text: "Excerpt from Candide",
            author: "Voltaire",
            themes: ["Optimism", "Satire"],
            questions: ["Analyze Voltaire’s use of irony"],
          },
          writingSkills: {
            type: "essay",
            prompts: ["Discuss optimism in Candide"],
            guidelines: ["Clear thesis", "Textual evidence"],
          },
        },
      },
    },
    duration: 90,
    resourceIds: ["resource-002"],
    exerciseIds: ["exercise-002"],
    interactivityLevel: "low",
    offlineAvailable: true,
    premiumOnly: false,
  },
];

export { lessons };