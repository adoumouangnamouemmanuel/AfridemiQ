import { Subject } from "./AfricaExamPrepDataStructure";

const subjects: Subject[] = [
  {
    id: "subject-001",
    name: "Mathematics",
    icon: "https://example.com/icons/math.png",
    color: "#28a745",
    description:
      "Core subject for Bac Series D, focusing on algebra, calculus, and geometry.",
    examIds: ["exam-001"],
    series: ["Bac_D"],
    type: "math",
  },
  {
    id: "subject-002",
    name: "French",
    icon: "https://example.com/icons/french.png",
    color: "#dc3545",
    description:
      "Core subject for Bac Series D, emphasizing language and literature skills.",
    examIds: ["exam-001"],
    series: ["Bac_D"],
    type: "french",
  },
];

export { subjects };