import { Curriculum } from "./AfricaExamPrepDataStructure";

const curriculum: Curriculum = {
  id: "curriculum-001",
  country: "Chad",
  educationLevel: "Terminale",
  examId: "exam-001",
  series: "Bac_D",
  subjects: [
    {
      subjectId: "subject-001",
      name: "Mathematics",
      description: "Covers algebra, calculus, and geometry.",
      topics: [
        {
          topicId: "topic-001",
          name: "Limits",
          description: "Understanding limits of functions.",
          learningObjectives: ["Define limits", "Apply limit theorems"],
          assessmentCriteria: [
            "Accuracy in problem-solving",
            "Use of formulas",
          ],
          resourceIds: ["resource-001"],
        },
      ],
      assessments: [
        {
          type: "summative",
          weightage: 40,
          criteria: ["Correctness", "Clarity"],
        },
      ],
    },
    {
      subjectId: "subject-002",
      name: "French",
      description: "Covers language and literature skills.",
      topics: [
        {
          topicId: "topic-002",
          name: "Dissertation",
          description: "Writing structured essays.",
          learningObjectives: ["Structure essays", "Analyze texts"],
          assessmentCriteria: ["Thesis clarity", "Evidence use"],
          resourceIds: ["resource-002"],
        },
      ],
      assessments: [
        {
          type: "summative",
          weightage: 30,
          criteria: ["Coherence", "Grammar"],
        },
      ],
    },
  ],
  academicYear: {
    startDate: "2024-09-01T00:00:00Z",
    endDate: "2025-07-31T00:00:00Z",
    terms: [
      {
        term: 1,
        startDate: "2024-09-01T00:00:00Z",
        endDate: "2024-12-15T00:00:00Z",
        holidays: [
          {
            name: "Independence Day",
            startDate: "2024-08-11T00:00:00Z",
            endDate: "2024-08-11T00:00:00Z",
          },
        ],
      },
    ],
  },
};

export { curriculum };