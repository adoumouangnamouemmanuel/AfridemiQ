import { ExamSchedule } from "./AfricaExamPrepDataStructure";

const examSchedules: ExamSchedule[] = [
  {
    id: "schedule-001",
    examId: "exam-001",
    subjectId: "subject-001",
    series: "Bac_D",
    level: "Terminale",
    date: "2025-07-15T00:00:00Z",
    time: "08:00",
    duration: 180,
    location: "Ndjamena Exam Center",
    notes: "Bring calculator and ID.",
  },
  {
    id: "schedule-002",
    examId: "exam-001",
    subjectId: "subject-002",
    series: "Bac_D",
    level: "Terminale",
    date: "2025-07-16T00:00:00Z",
    time: "08:00",
    duration: 240,
    location: "Ndjamena Exam Center",
    notes: "Bring pens and lined paper.",
  },
];

export { examSchedules };