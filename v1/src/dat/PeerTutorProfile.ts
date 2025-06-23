
import { PeerTutorProfile } from './AfricaExamPrepDataStructure';

const peerTutorProfile: PeerTutorProfile = {
  userId: 'user-002',
  subjects: ['subject-001'],
  series: ['Bac_D'],
  topics: ['topic-001'],
  availability: [
    { day: 'Monday', startTime: '18:00', endTime: '20:00' },
    { day: 'Wednesday', startTime: '18:00', endTime: '20:00' },
  ],
  bio: 'Experienced Math tutor for Bac D students.',
  rating: 4.8,
  reviews: [
    {
      reviewerId: 'user-003',
      rating: 5,
      comment: 'Great tutor!',
      createdAt: '2025-05-01T00:00:00Z',
    },
  ],
  isAvailable: true,
  premiumOnly: true,
};

export { peerTutorProfile };