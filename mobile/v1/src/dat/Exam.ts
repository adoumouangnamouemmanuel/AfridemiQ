import { Exam } from "./AfricaExamPrepDataStructure";

const exam: Exam = {
  id: "exam-001",
  name: "Baccalauréat",
  description: "National exam for Terminale students in CEMAC countries.",
  icon: "https://example.com/icons/bac.png",
  color: "#007bff",
  duration: "3 hours",
  country: "Chad",
  levels: ["Terminale"],
  series: [
    {
      id: "Bac_D",
      name: "Series D",
      subjects: ["subject-001", "subject-002", "subject-003"],
      description:
        "Science-focused track with emphasis on Math, Physics, and Chemistry.",
    },
  ],
  curriculumId: "curriculum-001",
  examFormat: "paper",
  accessibilityOptions: ["extra time", "large print"],
  importantDates: [
    { type: "registration", date: "2025-03-01T00:00:00Z" },
    { type: "exam", date: "2025-07-15T00:00:00Z" },
  ],
  registrationRequirements: {
    minimumAge: 16,
    requiredDocuments: ["birth certificate", "school transcript"],
    fees: { amount: 50000, currency: "XAF" },
  },
  examCenters: [
    {
      id: "center-001",
      name: "Ndjamena Exam Center",
      location: "Ndjamena, Chad",
      capacity: 200,
    },
  ],
  pastPapers: [
    {
      year: 2024,
      url: "https://example.com/pastpapers/bac_d_2024.pdf",
      solutions: "https://example.com/solutions/bac_d_2024.pdf",
      series: "Bac_D",
    },
  ],
  statistics: {
    passRate: 60,
    averageScore: 12,
    totalCandidates: 10000,
    series: "Bac_D",
  },
};

export { exam };