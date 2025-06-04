const mongoose = require('mongoose');
const { Schema } = mongoose;

// Shared constants
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];
const RESOURCE_TYPES = ['document', 'video', 'audio', 'interactive', 'past_exam'];

// Shared Feedback Subschema
const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 0, max: 10, required: true },
  comments: String,
  createdAt: { type: Date, default: Date.now },
});





const ExerciseSchema = new Schema({
  type: { type: String, enum: ['practice', 'quiz', 'assignment', 'exam'], required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  series: String,
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: DIFFICULTY_LEVELS, required: true },
  timeLimit: Number,
  points: { type: Number, required: true },
  content: {
    instructions: String,
    attachments: [{ type: String, url: String, description: String }],
    subjectSpecific: {
      math: {
        problems: [{ statement: String, variables: [String], constraints: [String] }],
        formulas: [String],
        calculatorAllowed: Boolean,
      },
      french: {
        textAnalysis: { text: String, questions: [String] },
        grammarExercises: [String],
      },
      // Add other subjects as needed
    },
  },
  solution: {
    answer: Schema.Types.Mixed,
    explanation: String,
    steps: [String],
    subjectSpecific: {
      math: {
        workingSteps: [String],
        formulas: [String],
      },
      french: {
        modelAnswer: String,
        guidelines: [String],
      },
    },
  },
  metadata: {
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date,
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastModified: Date,
    version: Number,
    tags: [String],
    difficultyMetrics: { successRate: Number, averageTimeToComplete: Number, skipRate: Number },
    accessibility: {
      hasAudioVersion: Boolean,
      hasBrailleVersion: Boolean,
      hasSignLanguageVideo: Boolean,
    },
  },
  premiumOnly: { type: Boolean, default: false },
}, { timestamps: true });

const ResourceSchema = new Schema({
  type: { type: String, enum: RESOURCE_TYPES, required: true },
  title: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  series: String,
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
  url: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: String, required: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
  thumbnail: String,
  offlineAvailable: { type: Boolean, default: false },
  premiumOnly: { type: Boolean, default: false },
  metadata: {
    fileSize: Number,
    duration: Number,
    format: String,
    language: String,
    tags: [String],
    difficulty: { type: String, enum: DIFFICULTY_LEVELS },
    prerequisites: [String],
    lastUpdated: Date,
    version: String,
    contributors: [String],
    license: String,
  },
  accessibility: {
    hasTranscript: Boolean,
    hasSubtitles: Boolean,
    hasAudioDescription: Boolean,
  },
  analytics: {
    views: Number,
    downloads: Number,
    averageRating: Number,
    userFeedback: [FeedbackSchema],
  },
}, { timestamps: true });

const StudyGroupSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  challengeIds: [{ type: Schema.Types.ObjectId, ref: 'Challenge' }],
  createdAt: { type: Date, default: Date.now },
  features: {
    chatEnabled: Boolean,
    fileSharing: Boolean,
    liveSessions: Boolean,
    progressTracking: Boolean,
  },
  roles: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'moderator', 'member'] },
    permissions: [String],
  }],
  activities: [{
    type: { type: String, enum: ['quiz', 'discussion', 'resource_share'] },
    content: Schema.Types.Mixed,
    createdAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  }],
  studySchedule: {
    sessions: [{
      day: String,
      time: String,
      topic: String,
      duration: Number,
    }],
  },
  resourceIds: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
  groupProgressSummary: {
    completedTopics: Number,
    averageScore: Number,
  },
}, { timestamps: true });

const PeerTutorProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  subjects: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
  series: [String],
  topics: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  availability: [{
    day: String,
    startTime: String,
    endTime: String,
  }],
  bio: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: [FeedbackSchema],
  isAvailable: { type: Boolean, default: true },
  premiumOnly: { type: Boolean, default: false },
}, { timestamps: true });

const TutoringSessionSchema = new Schema({
  tutorId: { type: Schema.Types.ObjectId, ref: 'PeerTutorProfile', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  series: String,
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], required: true },
  feedback: String,
  sessionRecording: {
    url: String,
    duration: Number,
  },
  premiumOnly: { type: Boolean, default: false },
}, { timestamps: true });

const ChallengeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  series: String,
  questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  timeLimit: { type: Number, required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  endsAt: Date,
  premiumOnly: { type: Boolean, default: false },
}, { timestamps: true });

const LeaderboardEntrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  nationalRank: { type: Number, required: true },
  regionalRank: { type: Number, required: true },
  globalRank: { type: Number, required: true },
  badgeCount: { type: Number, required: true },
  streak: { type: Number, required: true },
  topPerformance: { type: Boolean, default: false },
  mostImproved: Boolean,
  longestStreak: Number,
  history: [{
    date: Date,
    rank: Number,
  }],
  series: String,
}, { timestamps: true });

const MissionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['daily', 'weekly', 'custom'], required: true },
  progress: { type: Number, default: 0 },
  target: { type: Number, required: true },
  reward: { type: String, required: true },
  icon: { type: String, required: true },
  completed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
  series: String,
}, { timestamps: true });

const NoteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  series: String,
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { timestamps: true });

const ExamScheduleSchema = new Schema({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  series: String,
  level: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  duration: { type: Number, required: true },
  location: String,
  onlineLink: String,
  notes: String,
}, { timestamps: true });

const CountrySchema = new Schema({
  name: { type: String, required: true, unique: true },
  flagUrl: { type: String, required: true },
  supportedExams: [{ type: Schema.Types.ObjectId, ref: 'Exam' }],
  languages: [String],
}, { timestamps: true });

const AdaptiveLearningSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currentLevel: { type: String, enum: DIFFICULTY_LEVELS, required: true },
  series: String,
  adjustmentRules: [{
    metric: { type: String, enum: ['score', 'timeSpent', 'accuracy'] },
    threshold: Number,
    action: { type: String, enum: ['increaseDifficulty', 'decreaseDifficulty', 'suggestResource'] },
    resourceId: { type: Schema.Types.ObjectId, ref: 'Resource' },
  }],
  recommendedContent: [{
    contentType: { type: String, enum: ['topic', 'quiz', 'resource'] },
    id: String,
  }],
}, { timestamps: true });


// Models
module.exports = {
  Exercise: mongoose.model('Exercise', ExerciseSchema),
  Resource: mongoose.model('Resource', ResourceSchema),
  StudyGroup: mongoose.model('StudyGroup', StudyGroupSchema),
  PeerTutorProfile: mongoose.model('PeerTutorProfile', PeerTutorProfileSchema),
  TutoringSession: mongoose.model('TutoringSession', TutoringSessionSchema),
  Challenge: mongoose.model('Challenge', ChallengeSchema),
  LeaderboardEntry: mongoose.model('LeaderboardEntry', LeaderboardEntrySchema),
  Mission: mongoose.model('Mission', MissionSchema),
  Note: mongoose.model('Note', NoteSchema),
  ExamSchedule: mongoose.model('ExamSchedule', ExamScheduleSchema),
  Country: mongoose.model('Country', CountrySchema),
  AdaptiveLearning: mongoose.model('AdaptiveLearning', AdaptiveLearningSchema),
};