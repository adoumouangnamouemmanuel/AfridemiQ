
import { TutoringSession } from './AfricaExamPrepDataStructure';

const tutoringSession: TutoringSession = {
  id: 'session-001',
  tutorId: 'user-002',
  studentId: 'user-001',
  subjectId: 'subject-001',
  series: 'Bac_D',
  topicId: 'topic-001',
  scheduledAt: '2025-06-10T18:00:00Z',
  duration: 60,
  status: 'scheduled',
  feedback: "",
  sessionRecording: {
    url: "https://example.com/recording/session-001",
    duration: 3600 // duration in seconds, adjust as needed
  },
  premiumOnly: true,
};

export { tutoringSession };