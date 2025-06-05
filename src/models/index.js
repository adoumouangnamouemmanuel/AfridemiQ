// Load and export all models

// User models
const User = require("./user/user.model");
const Achievement = require("./user/achievement.model");
const Dashboard = require("./user/dashboard.model");
const FeedbackLoop = require("./user/feedback.loop.model");
const Notification = require("./user/notification.model");
const Onboarding = require("./user/onboarding.status.model");
const ParentAccess = require("./user/parent.access.model");
const PeerTutorProfile = require("./user/peer.tutor.profile.model");
const TutoringSession = require("./user/tutoring.session.model");
const UserAnalytics = require("./user/user.analytics.model");

// Assessment models
const Assessment = require("./assessment/assessment.model");
const Challenge = require("./assessment/challenge.model");
const Exam = require("./assessment/exam.model");
const ExamSchedule = require("./assessment/exam.schedule.model");
// need to add Exercise model
const Question = require("./assessment/question.model");
const Quiz = require("./assessment/quiz.model");
const QuizSession = require("./assessment/quiz.session.model");

// results models
const QuizResult = require("./results/quiz.result.model");
const Hint = require("./results/hint.model");

// progress models
const GamifiedProgress = require("./progress/gamified.progress.model");
const LeaderboardEntry = require("./progress/leaderboard.entry.model");
const Misson = require("./progress/mission.model");
const TopicProgress = require("./progress/topic.progress.model");

// learning models
const AdaptiveLearning = require("./learning/adaptive.learning.model");
const Bookmark = require("./learning/bookmark.model");
const CourseContent = require("./learning/course.content.model");
const Curriculum = require("./learning/curriculum.model");
const LearningPath = require("./learning/learning.path.model");
const Note = require("./learning/note.model");
const Resource = require("./learning/resource.model");
const StudyGroup = require("./learning/study.group.model");
const StudyPlan = require("./learning/study.plan.model");
const Subject = require("./learning/subject.model");
const Topic = require("./learning/topic.model");

// learning/lesson models
const Lesson = require("./learning/lesson/lesson.base.model");
const BiologyLesson = require("./learning/lesson/lesson.biology.model");
const ChemistryLesson = require("./learning/lesson/lesson.chemistry.model");
const EnglishLesson = require("./learning/lesson/lesson.english.model");
const FrenchLesson = require("./learning/lesson/lesson.french.model");
const GeographyLesson = require("./learning/lesson/lesson.geography.model");
const HistoryLesson = require("./learning/lesson/lesson.history.model");
const MathLesson = require("./learning/lesson/lesson.math.model");
const PhilosophyLesson = require("./learning/lesson/lesson.philosophy.model");
const PhysicsLesson = require("./learning/lesson/lesson.physics.model");

// Export all models
module.exports = {
  User,
  Achievement,
  Dashboard,
  FeedbackLoop,
  Notification,
  Onboarding,
  ParentAccess,
  PeerTutorProfile,
  TutoringSession,
  UserAnalytics,
  Assessment,
  Challenge,
  Exam,
  ExamSchedule,
  Question,
  Quiz,
  QuizSession,
  QuizResult,
  Hint,
  GamifiedProgress,
  LeaderboardEntry,
  Misson,
  TopicProgress,
  AdaptiveLearning,
  Bookmark,
  CourseContent,
  Curriculum,
  LearningPath,
  Note,
  Resource,
  StudyGroup,
  StudyPlan,
  Subject,
  Topic,
  Lesson,
  BiologyLesson,
  ChemistryLesson,
  EnglishLesson,
  FrenchLesson,
  GeographyLesson,
  HistoryLesson,
  MathLesson,
  PhilosophyLesson,
  PhysicsLesson,
};
