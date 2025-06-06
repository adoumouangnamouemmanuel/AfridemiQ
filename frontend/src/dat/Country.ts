import { Country } from "./AfricaExamPrepDataStructure";

const countries: Country[] = [
  {
    id: "country-001",
    name: "Chad",
    flagUrl: "https://example.com/flags/chad.png",
    supportedExams: ["exam-001"],
    languages: ["French", "Arabic"],
  },
  {
    id: "country-002",
    name: "Cameroon",
    flagUrl: "https://example.com/flags/cameroon.png",
    supportedExams: ["exam-001"],
    languages: ["French", "English"],
  },
  {
    id: "country-003",
    name: "Central African Republic",
    flagUrl: "https://example.com/flags/car.png",
    supportedExams: ["exam-001"],
    languages: ["French", "Sango"],
  },
  {
    id: "country-004",
    name: "Republic of the Congo",
    flagUrl: "https://example.com/flags/congo.png",
    supportedExams: ["exam-001"],
    languages: ["French"],
  },
  {
    id: "country-005",
    name: "Equatorial Guinea",
    flagUrl: "https://example.com/flags/equatorial_guinea.png",
    supportedExams: ["exam-001"],
    languages: ["French", "Spanish"],
  },
  {
    id: "country-006",
    name: "Gabon",
    flagUrl: "https://example.com/flags/gabon.png",
    supportedExams: ["exam-001"],
    languages: ["French"],
  },
];

export { countries };