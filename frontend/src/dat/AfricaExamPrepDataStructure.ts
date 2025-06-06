
// Africa Exam Prep Data Structure
// Optimized TypeScript schema for an exam preparation platform
// Tailored for Francophone and Anglophone systems with subject-specific content and premium features

// Core User Profile: Combines account data, preferences, settings, and progress
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  country?: string;
  timeZone?: string; // For scheduling across African regions
  preferredLanguage?: string; // e.g., French, English, Arabic
  schoolName?: string;
  gradeLevel?: string; // e.g., Form 3, Terminale
  parentEmail?: string; // For parental oversight
  createdAt: string;
  lastLogin?: string;
  isPremium: boolean;
  subscription: Subscription;
  preferences: Preferences;
  settings: Settings;
  progress: Progress;
  analyticsId: string; // Reference to UserAnalytics
  notes: string[]; // Note IDs
  hintsUsed: string[]; // HintUsage IDs
  bookmarks: string[]; // Bookmark IDs
  friends: string[]; // User IDs
  tutorId?: string; // Reference to PeerTutorProfile
  socialProfile?: SocialProfile;
  onboardingStatusId?: string; // Reference to OnboardingStatus
  _indexes?: {
    email: string;
    selectedExam: string;
    selectedSeries: string;
    level: number;
    totalXp: number;
  };
}

// Subscription: Enhanced with premium features
interface Subscription {
  type: 'free' | 'premium';
  startDate: string;
  expiresAt: string | null;
  paymentStatus: 'active' | 'pending' | 'failed';
  trialPeriod?: { startDate: string; endDate: string };
  features: string[]; // e.g., ["offlineAccess", "advancedAnalytics", "priorityTutoring"]
  accessLevel: 'basic' | 'premium'; // Restricts content access
}

// Preferences: User-configurable UI/UX settings
interface Preferences {
  notifications: {
    general: boolean;
    dailyReminderTime?: string;
    challengeNotifications: boolean;
    progressUpdates: boolean; // Added for UX
  };
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  preferredContentFormat: 'video' | 'text' | 'audio' | 'mixed';
  enableHints: boolean;
  autoPlayAudio: boolean;
  showStepSolutions: boolean;
  leaderboardVisibility: boolean;
  allowFriendRequests: boolean;
  multilingualSupport: string[]; // e.g., ["French", "English"]
}

// Settings: Learning preferences
interface Settings {
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  motivation?: string; // e.g., "Pass Bac D with distinction"
  preferredStudySessionLength?: number; // in minutes
}

// Progress: Tracks learning and gamification
interface Progress {
  selectedExam?: string; // e.g., BEPC, Baccalauréat, GCE
  selectedSeries?: string; // e.g., Bac A, C, D, E
  selectedLevel?: string; // e.g., Terminale, Form 5
  xp: number;
  level: number;
  streak: {
    current: number;
    longest: number;
    lastStudyDate: string;
  };
  goalDate?: string; // ISO format
  totalQuizzes: number;
  averageScore: number;
  completedTopics: string[];
  weakSubjects: string[];
  badges: string[];
  achievements: string[];
  progressSummary: { completedPercentage: number; remainingTopics: number };
}

// User Analytics: Subject-specific performance insights
interface UserAnalytics {
  id: string;
  userId: string;
  lastUpdated: string;
  dailyStats: DailyStat[];
  subjectStats: SubjectPerformance[];
  learningPatterns: LearningPattern;
  mastery: SubjectMastery[];
  efficiency: LearningEfficiency;
  personalizedRecommendations: PersonalizedRecommendation;
}

interface DailyStat {
  date: string;
  studyTime: number; // in minutes
  questionsAnswered: number;
  correctAnswers: number;
  topicsCovered: string[];
}

interface SubjectPerformance {
  subjectId: string;
  series?: string; // e.g., Bac D, GCE Science
  averageScore: number;
  timeSpent: number; // in minutes
  lastStudied: string;
}

interface LearningPattern {
  preferredStudyTime: string; // e.g., "evening"
  mostProductiveDays: string[]; // e.g., ["Monday", "Wednesday"]
  averageSessionLength: number; // in minutes
}

interface SubjectMastery {
  subjectId: string;
  series?: string;
  masteryLevel: number; // 0–100
  lastAssessmentDate: string;
  improvementRate: number;
}

interface LearningEfficiency {
  averageResponseTime: number; // in seconds
  accuracyRate: number; // 0–100
  timeSpentPerTopic: number; // in minutes
}

interface PersonalizedRecommendation {
  weakTopics: string[];
  suggestedStudyPath: string[]; // Topic IDs
  nextMilestone: string; // e.g., "Master Organic Chemistry"
}

// Social Profile: Community engagement
interface SocialProfile {
  userId: string;
  bio: string;
  publicAchievements: string[];
  visibility: 'public' | 'friends' | 'private';
  socialLinks: { platform: string; url: string }[];
}

// Achievement: Gamification rewards
interface Achievement {
  id: string;
  name: string; // e.g., "Math Master"
  description: string;
  icon: string;
  color: string;
  earnedDate?: string;
  progress: number; // 0–100
  target: number;
  subjectId?: string; // For subject-specific achievements
  series?: string; // e.g., Bac C
}

// Exam: Supports series-based exams
interface Exam {
  id: string;
  name: string; // e.g., "Baccalauréat", "GCE O-Level"
  description: string;
  icon: string;
  color: string;
  duration: string; // e.g., "3 hours"
  country: string;
  levels: string[]; // e.g., ["Terminale", "Form 5"]
  series: {
    id: string; // e.g., "Bac_A", "GCE_Science"
    name: string; // e.g., "Bac A", "Science Stream"
    subjects: string[]; // Subject IDs
    description: string;
  }[];
  curriculumId: string;
  examFormat: 'paper' | 'computer' | 'hybrid';
  accessibilityOptions: string[]; // e.g., ["extra time", "braille"]
  importantDates: { type: string; date: string }[];
  registrationRequirements: {
    minimumAge: number;
    requiredDocuments: string[];
    fees: { amount: number; currency: string };
  };
  examCenters: { id: string; name: string; location: string; capacity: number }[];
  pastPapers: { year: number; url: string; solutions: string; series?: string }[];
  statistics: { passRate: number; averageScore: number; totalCandidates: number; series?: string };
}

// Subject: Specific to academic disciplines
interface Subject {
  id: string;
  name: string; // e.g., "French", "Physics", "History"
  icon: string;
  color: string;
  description: string;
  examIds: string[];
  series?: string[]; // e.g., ["Bac A", "Bac D"]
  type: 'french' | 'english' | 'math' | 'physics' | 'chemistry' | 'biology' | 'history' | 'geography' | 'philosophy';
}

// Topic: Granular learning units
interface Topic {
  id: string;
  name: string; // e.g., "Organic Chemistry", "Literary Analysis"
  subjectId: string;
  series?: string; // e.g., "Bac D"
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: number; // in minutes
  estimatedCompletionDate?: string;
  relatedTopics: string[];
  hasPractice: boolean;
  hasNote: boolean;
  hasStudyMaterial: boolean;
  prerequisites: string[]; // Topic IDs
  learningObjectives: string[];
  estimatedTimeToMaster: number; // in minutes
  resourceIds: string[];
  assessmentCriteria: {
    minimumScore: number;
    requiredPracticeQuestions: number;
    masteryThreshold: number;
  };
}

// Topic Progress: Tracks user progress
interface TopicProgress {
  id: string;
  topicId: string;
  userId: string;
  series?: string;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'mastered';
  timeSpent: number; // in minutes
  lastStudied: string;
  practiceSessions: { date: string; score: number; timeSpent: number }[];
  weakAreas: string[];
  strongAreas: string[];
}

// Course Content: Subject-specific curriculum
interface CourseContent {
  id: string;
  subjectId: string;
  series?: string; // e.g., "Bac D", "GCE Arts"
  title: string; // e.g., "Complete Bac D Chemistry"
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  modules: Module[];
  prerequisites: string[]; // Topic or Course IDs
  estimatedDuration: number; // in hours
  progressTracking: { completedLessons: number; totalLessons: number };
  accessibilityOptions: { languages: string[]; formats: string[]; accommodations: string[] };
  premiumOnly: boolean; // Restricts access to premium users
  metadata: CourseMetadata;
}

interface CourseMetadata {
  createdBy: string;
  createdAt: string;
  tags: string[];
}

// Module: Groups lessons by topic
interface Module {
  id: string;
  title: string; // e.g., "Mechanics"
  description: string;
  order: number;
  series?: string;
  lessons: Lesson[];
  exerciseIds: string[];
  assessment: Assessment;
  progressTracking: { completedLessons: number; totalLessons: number };
}

// Lesson: Highly subject-specific content
interface Lesson {
  id: string;
  title: string; // e.g., "Newton’s Laws", "French Grammar"
  series?: string;
  content: {
    type: 'french' | 'english' | 'math' | 'physics' | 'chemistry' | 'biology' | 'history' | 'geography' | 'philosophy';
    overview: string;
    objectives: string[];
    keyPoints: string[];
    data: {
      french?: {
        literaryAnalysis?: { text: string; author: string; themes: string[]; questions: string[] };
        grammar?: { rules: string[]; examples: string[]; exercises: string[] };
        vocabulary?: { word: string; definition: string; examples: string[]; pronunciation?: string }[];
        writingSkills?: { type: 'essay' | 'letter'; prompts: string[]; guidelines: string[] };
      };
      english?: {
        readingComprehension?: { text: string; questions: string[]; vocabulary: string[] };
        grammar?: { rules: string[]; examples: string[]; exercises: string[] };
        vocabulary?: { word: string; definition: string; examples: string[]; pronunciation?: string }[];
        writingSkills?: { type: 'essay' | 'report'; prompts: string[]; guidelines: string[] };
      };
      math?: {
        concepts?: { name: string; definition: string; examples: string[]; formulas: string[] };
        proofs?: { statement: string; steps: string[] };
        interactiveElements?: { type: 'calculator' | 'graph'; url: string; instructions: string }[];
      };
      physics?: {
        concepts?: { name: string; definition: string; examples: string[]; formulas: string[] };
        experiments?: { title: string; materials: string[]; procedure: string[]; safetyNotes: string[] };
        simulations?: { title: string; url: string; instructions: string }[];
      };
      chemistry?: {
        concepts?: { name: string; definition: string; examples: string[]; reactions?: string[] };
        experiments?: { title: string; materials: string[]; procedure: string[]; safetyNotes: string[] };
        simulations?: { title: string; url: string; instructions: string }[];
      };
      biology?: {
        concepts?: { name: string; definition: string; examples: string[]; diagrams?: string[] };
        experiments?: { title: string; materials: string[]; procedure: string[]; observations: string[] };
        simulations?: { title: string; url: string; instructions: string }[];
      };
      history?: {
        events?: { date: string; description: string; significance: string; relatedEvents: string[] };
        timelines?: { period: string; events: string[] };
        primarySources?: { title: string; url: string; analysis: string };
      };
      geography?: {
        features?: { name: string; description: string; location: string; significance: string };
        maps?: { title: string; url: string; annotations: string[] };
        caseStudies?: { title: string; description: string; questions: string[] };
      };
      philosophy?: {
        concepts?: { name: string; definition: string; philosophers: string[]; examples: string[] };
        texts?: { title: string; author: string; excerpt: string; questions: string[] };
        debates?: { topic: string; arguments: string[]; perspectives: string[] };
      };
    };
  };
  duration: number; // in minutes
  resourceIds: string[];
  exerciseIds: string[];
  interactivityLevel: 'low' | 'medium' | 'high';
  offlineAvailable: boolean;
  premiumOnly: boolean; // Restricts access
}

// Assessment: Evaluates module completion
interface Assessment {
  id: string;
  type: 'quiz' | 'exam' | 'project';
  title: string;
  description: string;
  questionIds: string[];
  passingScore: number;
  timeLimit?: number; // in minutes
  attempts: number;
  feedback: {
    immediate: boolean;
    detailed: boolean;
    solutions: boolean;
  };
  premiumOnly: boolean;
}

// Question: Core assessment unit
interface Question {
  id: string;
  topicId: string;
  subjectId: string;
  series?: string;
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  steps?: string[];
  tags: string[];
  relatedQuestions: string[];
  difficultyMetrics: {
    successRate: number;
    averageTimeToAnswer: number; // in seconds
    skipRate: number;
  };
  content: {
    media?: { type: 'image' | 'audio' | 'video'; url: string; altText?: string }[];
    accessibility: {
      hasAudioVersion: boolean;
      hasBrailleVersion: boolean;
      hasSignLanguageVideo: boolean;
    };
  };
  premiumOnly: boolean;
}

// Quiz: Structured question sets
interface Quiz {
  id: string;
  title: string;
  subjectId: string;
  series?: string;
  topicIds: string[];
  questionIds: string[];
  totalQuestions: number;
  totalPoints: number;
  createdAt: string;
  createdBy: string;
  level: string;
  timeLimit: number; // in minutes
  retakePolicy: { maxAttempts: number; cooldownMinutes: number };
  resultIds: string[];
  offlineAvailable: boolean;
  premiumOnly: boolean;
}

// Quiz Session: Tracks active quiz attempts
interface QuizSession {
  id: string;
  userId: string;
  quizId: string;
  startTime: string;
  lastActive: string;
  answers: {
    questionId: string;
    selectedAnswer?: string | number;
    timeSpent: number; // in seconds
  }[];
  status: 'in_progress' | 'completed' | 'abandoned';
  deviceInfo: {
    platform: string;
    version: string;
    lastSync: string;
  };
}

// Quiz Result: Stores quiz outcomes
interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  questionIds: string[];
  correctCount: number;
  score: number;
  timeTaken: number; // in seconds
  completedAt: string;
  hintUsages: string[];
  questionFeedback: { questionId: string; comment: string; reportedAt: string }[];
  feedback?: PerformanceFeedback;
}

// Performance Feedback: Motivational feedback
interface PerformanceFeedback {
  title: string;
  subtitle: string;
  color: string;
  emoji: string;
  message: string;
}

// Hint Usage: Tracks hint interactions
interface HintUsage {
  id: string;
  questionId: string;
  userId: string;
  usedAt: string;
  stepsViewed: number[];
}

// Bookmark: Saves questions for later
interface Bookmark {
  id: string;
  userId: string;
  questionId: string;
  createdAt: string;
}

// Exercise: Subject-specific practice activities
interface Exercise {
  id: string;
  type: 'practice' | 'quiz' | 'assignment' | 'exam';
  subjectId: string;
  series?: string;
  topicId: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number; // in minutes
  points: number;
  content: {
    instructions: string;
    attachments?: { type: 'image' | 'audio' | 'video' | 'document'; url: string; description?: string }[];
    subjectSpecific: {
      type: 'french' | 'english' | 'math' | 'physics' | 'chemistry' | 'biology' | 'history' | 'geography' | 'philosophy';
      data: {
        french?: {
          textAnalysis?: { text: string; questions: string[]; themes: string[] };
          grammarExercise?: { rules: string[]; tasks: string[] };
          writingTask?: { type: 'essay' | 'letter'; prompt: string; guidelines: string[] };
        };
        english?: {
          readingComprehension?: { text: string; questions: string[]; vocabulary: string[] };
          grammarExercise?: { rules: string[]; tasks: string[] };
          writingTask?: { type: 'essay' | 'report'; prompt: string; guidelines: string[] };
        };
        math?: {
          problems?: { statement: string; variables: string[]; constraints: string[] };
          formulas?: string[];
          diagrams?: string[];
          calculatorAllowed: boolean;
        };
        physics?: {
          problems?: { statement: string; variables: string[]; formulas: string[] };
          experiments?: { title: string; materials: string[]; procedure: string[] };
          simulations?: { url: string; instructions: string };
        };
        chemistry?: {
          reactions?: { equation: string; conditions: string; products: string[] };
          experiments?: { title: string; materials: string[]; procedure: string[] };
          simulations?: { url: string; instructions: string };
        };
        biology?: {
          concepts?: { name: string; definition: string; examples: string[] };
          experiments?: { title: string; materials: string[]; procedure: string[] };
          diagrams?: { url: string; description: string };
        };
        history?: {
          analysis?: { event: string; questions: string[]; sources: string[] };
          timelines?: { period: string; events: string[] };
        };
        geography?: {
          caseStudy?: { title: string; description: string; questions: string[] };
          maps?: { url: string; annotations: string[] };
        };
        philosophy?: {
          debate?: { topic: string; arguments: string[]; perspectives: string[] };
          textAnalysis?: { text: string; questions: string[]; philosopher: string };
        };
      };
    };
  };
  solution: {
    answer: string | number | string[] | number[];
    explanation: string;
    steps?: string[];
    subjectSpecific?: {
      type: 'french' | 'english' | 'math' | 'physics' | 'chemistry' | 'biology' | 'history' | 'geography' | 'philosophy';
      data: {
        french?: {
          sampleResponse?: string;
          grammarNotes?: string[];
          vocabularyUsage?: string[];
        };
        english?: {
          sampleResponse?: string;
          grammarNotes?: string[];
          vocabularyUsage?: string[];
        };
        math?: {
          workingSteps: string[];
          formulas: string[];
          alternativeMethods?: string[];
        };
        physics?: {
          calculations: string[];
          formulas: string[];
          diagrams?: string[];
        };
        chemistry?: {
          reactionMechanism?: string[];
          calculations?: string[];
          observations?: string[];
        };
        biology?: {
          explanations: string[];
          diagrams?: string[];
          keyPoints: string[];
        };
        history?: {
          keyPoints: string[];
          sourceAnalysis: string[];
          references: string[];
        };
        geography?: {
          analysis: string[];
          mapAnnotations: string[];
          keyPoints: string[];
        };
        philosophy?: {
          argumentAnalysis: string[];
          keyConcepts: string[];
          references: string[];
        };
      };
    };
  };
  metadata: {
    createdBy: string;
    createdAt: string;
    lastModified: string;
    version: number;
    tags: string[];
    difficultyMetrics: { successRate: number; averageTimeToComplete: number; skipRate: number };
    accessibility: {
      hasAudioVersion: boolean;
      hasBrailleVersion: boolean;
      hasSignLanguageVideo: boolean;
    };
  };
  premiumOnly: boolean;
}

// Resource: Centralized educational materials
interface Resource {
  id: string;
  type: 'document' | 'video' | 'audio' | 'interactive' | 'past_exam';
  title: string;
  subjectId: string;
  series?: string;
  topicId?: string;
  url: string;
  description: string;
  level: string;
  examId?: string;
  thumbnail?: string;
  offlineAvailable: boolean;
  premiumOnly: boolean;
  metadata: {
    fileSize?: number; // in MB
    duration?: number; // in minutes
    format: string;
    language: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    prerequisites?: string[];
    lastUpdated: string;
    version: string;
    contributors: string[];
    license: string;
  };
  accessibility: {
    hasTranscript: boolean;
    hasSubtitles: boolean;
    hasAudioDescription: boolean;
  };
  analytics: {
    views: number;
    downloads: number;
    averageRating: number;
    userFeedback: { userId: string; rating: number; comment: string; date: string }[];
  };
}

// Study Group: Collaborative learning
interface StudyGroup {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  createdBy: string;
  challengeIds: string[];
  createdAt: string;
  features: {
    chatEnabled: boolean;
    fileSharing: boolean;
    liveSessions: boolean;
    progressTracking: boolean;
  };
  roles: { userId: string; role: 'admin' | 'moderator' | 'member'; permissions: string[] }[];
  activities: { type: 'quiz' | 'discussion' | 'resource_share'; content: any; createdAt: string; createdBy: string }[];
  studySchedule: { sessions: { day: string; time: string; topic: string; duration: number }[] };
  resourceIds: string[];
  groupProgressSummary: { completedTopics: number; averageScore: number };
}

// Peer Tutor Profile: Tutoring support
interface PeerTutorProfile {
  userId: string;
  subjects: string[];
  series?: string[];
  topics: string[];
  availability: { day: string; startTime: string; endTime: string }[];
  bio: string;
  rating: number;
  reviews: { reviewerId: string; rating: number; comment: string; createdAt: string }[];
  isAvailable: boolean;
  premiumOnly: boolean; // Priority for premium users
}

// Tutoring Session: Scheduled tutoring
interface TutoringSession {
  id: string;
  tutorId: string;
  studentId: string;
  subjectId: string;
  series?: string;
  topicId?: string;
  scheduledAt: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: string;
  sessionRecording?: { url: string; duration: number };
  premiumOnly: boolean;
}

// Challenge: Competitive activities
interface Challenge {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  topicId: string;
  series?: string;
  questionIds: string[];
  timeLimit: number; // in minutes
  participants: string[];
  createdAt: string;
  endsAt?: string;
  premiumOnly: boolean;
}

// Leaderboard Entry: Gamification rankings
interface LeaderboardEntry {
  id: string;
  userId: string;
  nationalRank: number;
  regionalRank: number;
  globalRank: number;
  badgeCount: number;
  streak: number;
  topPerformance: boolean;
  mostImproved?: boolean;
  longestStreak?: number;
  history: { date: string; rank: number }[];
  series?: string;
}

// Mission: Goal-oriented tasks
interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'custom';
  progress: number;
  target: number;
  reward: string;
  icon: string;
  completed: boolean;
  expiresAt: string;
  subjectId?: string;
  series?: string;
}

// Note: User-generated notes
interface Note {
  id: string;
  userId: string;
  topicId: string;
  series?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

// Exam Schedule: Exam logistics
interface ExamSchedule {
  id: string;
  examId: string;
  subjectId: string;
  series?: string;
  level: string;
  date: string; // ISO format
  time: string; // e.g., "14:00"
  duration: number; // in minutes
  location?: string;
  onlineLink?: string;
  notes?: string;
}

// Country: Region-specific data
interface Country {
  id: string;
  name: string;
  flagUrl: string;
  supportedExams: string[];
  languages: string[];
}

// Adaptive Learning: Dynamic content adjustment
interface AdaptiveLearning {
  id: string;
  userId: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  series?: string;
  adjustmentRules: {
    metric: 'score' | 'timeSpent' | 'accuracy';
    threshold: number;
    action: 'increaseDifficulty' | 'decreaseDifficulty' | 'suggestResource';
    resourceId?: string;
  }[];
  recommendedContent: { type: 'topic' | 'quiz' | 'resource'; id: string }[];
}

// Onboarding Status: Guides new users
interface OnboardingStatus {
  id: string;
  userId: string;
  completedSteps: string[]; // e.g., ["selectExam", "selectSeries", "setPreferences"]
  currentStep: string;
  lastUpdated: string;
}

// Dashboard: User progress overview
interface Dashboard {
  id: string;
  userId: string;
  upcomingExams: { examId: string; series?: string; date: string }[];
  recentQuizzes: { quizId: string; score: number; completedAt: string }[];
  recommendedTopics: string[];
  streak: number;
  notifications: string[];
}

// Parent Access: Parental oversight
interface ParentAccess {
  id: string;
  userId: string;
  parentEmail: string;
  accessLevel: 'viewProgress' | 'viewReports' | 'fullAccess';
  notifications: { type: string; frequency: string }[];
}

// Notification: User alerts
interface Notification {
  id: string;
  userId: string;
  type: 'reminder' | 'achievement' | 'study_group' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionUrl?: string;
  expiresAt?: string;
  metadata?: {
    relatedEntityId?: string;
    relatedEntityType?: string;
  };
}

// Study Plan: Personalized learning schedule
interface StudyPlan {
  id: string;
  userId: string;
  targetExam: string;
  targetSeries?: string;
  startDate: string;
  endDate: string;
  dailyGoals: {
    day: string;
    topics: { topicId: string; duration: number; priority: 'high' | 'medium' | 'low' }[];
    exercises: { exerciseId: string; count: number; type: string }[];
    breaks: { startTime: string; endTime: string; duration: number }[];
  }[];
  weeklyReview: {
    day: string;
    topics: string[];
    assessmentType: string;
  };
  progressTracking: {
    completedTopics: string[];
    weakAreas: string[];
    strongAreas: string[];
    adjustmentNeeded: boolean;
  };
  reminders: {
    type: 'study' | 'review' | 'assessment';
    time: string;
    message: string;
    repeat: 'daily' | 'weekly' | 'monthly';
  }[];
}

// Curriculum: Country and series-specific syllabus
interface Curriculum {
  id: string;
  country: string;
  educationLevel: string;
  examId: string;
  series?: string;
  subjects: {
    subjectId: string;
    name: string;
    description: string;
    topics: {
      topicId: string;
      name: string;
      description: string;
      learningObjectives: string[];
      assessmentCriteria: string[];
      resourceIds: string[];
    }[];
    assessments: {
      type: 'formative' | 'summative';
      weightage: number;
      criteria: string[];
    }[];
  }[];
  academicYear: {
    startDate: string;
    endDate: string;
    terms: {
      term: number;
      startDate: string;
      endDate: string;
      holidays: { name: string; startDate: string; endDate: string }[];
    }[];
  };
}

// Feedback Loop: Collects user input on content
interface FeedbackLoop {
  id: string;
  userId: string;
  type: 'question' | 'exercise' | 'lesson' | 'platform';
  contentId: string;
  content: string;
  rating: number; // 1–5
  status: 'pending' | 'reviewed' | 'resolved';
  response?: {
    adminId: string;
    message: string;
    date: string;
  };
  attachments?: string[];
}

// Gamified Progress: Subject-specific milestones
interface GamifiedProgress {
  id: string;
  userId: string;
  subjectId: string;
  series?: string;
  milestones: {
    id: string;
    description: string; // e.g., "Complete 50 Math problems"
    targetValue: number;
    currentValue: number;
    achieved: boolean;
    achievedDate?: string;
    reward: { type: 'badge' | 'points' | 'feature'; value: string };
  }[];
}

// Learning Path: Series-specific study plans
interface LearningPath {
  id: string;
  name: string;
  description: string;
  targetExam: string;
  targetSeries?: string;
  duration: number; // in weeks
  levels: {
    level: number;
    name: string;
    description: string;
    modules: string[]; // Module IDs
    prerequisites: string[];
    expectedOutcomes: string[];
  }[];
  milestones: {
    id: string;
    name: string;
    description: string;
    requiredAchievements: string[];
    reward: { type: 'badge' | 'certificate' | 'points'; value: string };
  }[];
  adaptiveLearning: {
    difficultyAdjustment: boolean;
    personalizedPacing: boolean;
    remediationPaths: {
      topicId: string;
      alternativeResources: string[];
      practiceExercises: string[];
    }[];
  };
}

export {
  User,
  Subscription,
  Preferences,
  Settings,
  Progress,
  UserAnalytics,
  DailyStat,
  SubjectPerformance,
  LearningPattern,
  SubjectMastery,
  LearningEfficiency,
  PersonalizedRecommendation,
  SocialProfile,
  Achievement,
  Exam,
  Subject,
  Topic,
  TopicProgress,
  CourseContent,
  CourseMetadata,
  Module,
  Lesson,
  Assessment,
  Question,
  Quiz,
  QuizSession,
  QuizResult,
  PerformanceFeedback,
  HintUsage,
  Bookmark,
  Exercise,
  Resource,
  StudyGroup,
  PeerTutorProfile,
  TutoringSession,
  Challenge,
  LeaderboardEntry,
  Mission,
  Note,
  ExamSchedule,
  Country,
  AdaptiveLearning,
  OnboardingStatus,
  Dashboard,
  ParentAccess,
  Notification,
  StudyPlan,
  Curriculum,
  FeedbackLoop,
  GamifiedProgress,
  LearningPath,
};
