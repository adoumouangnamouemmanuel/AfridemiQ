/**
 * Index module for exporting all Mongoose models.
 * @module models/index
 * @description Centralizes exports for all Mongoose models used in the application, grouped by category.
 * @property {mongoose.Model} User - User model for authentication and preferences.
 * @property {mongoose.Model} Achievement - Achievement model for user accomplishments.
 * @property {mongoose.Model} Dashboard - Dashboard model for user overview.
 * @property {mongoose.Model} FeedbackLoop - FeedbackLoop model for user feedback.
 * @property {mongoose.Model} Notification - Notification model for user alerts.
 * @property {mongoose.Model} Onboarding - OnboardingStatus model for user onboarding progress.
 * @property {mongoose.Model} ParentAccess - ParentAccess model for parental oversight.
 * @property {mongoose.Model} PeerTutorProfile - PeerTutorProfile model for tutor qualifications.
 * @property {mongoose.Model} TutoringSession - TutoringSession model for tutoring schedules.
 * @property {mongoose.Model} UserAnalytics - UserAnalytics model for study patterns.
 * @property {mongoose.Model} Assessment - Assessment model for evaluations.
 * @property {mongoose.Model} Challenge - Challenge model for competitive tasks.
 * @property {mongoose.Model} Exam - Exam model for formal tests.
 * @property {mongoose.Model} ExamSchedule - ExamSchedule model for exam timetables.
 * @property {mongoose.Model} Question - Question model for assessment items.
 * @property {mongoose.Model} Quiz - Quiz model for short tests.
 * @property {mongoose.Model} QuizSession - QuizSession model for quiz attempts.
 * @property {mongoose.Model} QuizResult - QuizResult model for quiz outcomes.
 * @property {mongoose.Model} Hint - Hint model for question assistance.
 * @property {mongoose.Model} GamifiedProgress - GamifiedProgress model for user progress tracking.
 * @property {mongoose.Model} LeaderboardEntry - LeaderboardEntry model for rankings.
 * @property {mongoose.Model} Misson - Mission model for user goals.
 * @property {mongoose.Model} TopicProgress - TopicProgress model for topic mastery.
 * @property {mongoose.Model} AdaptiveLearning - AdaptiveLearning model for personalized learning.
 * @property {mongoose.Model} Bookmark - Bookmark model for saved content.
 * @property {mongoose.Model} CourseContent - CourseContent model for course materials.
 * @property {mongoose.Model} Curriculum - Curriculum model for educational structure.
 * @property {mongoose.Model} LearningPath - LearningPath model for study paths.
 * @property {mongoose.Model} Note - Note model for user notes.
 * @property {mongoose.Model} Resource - Resource model for learning resources.
 * @property {mongoose.Model} StudyGroup - StudyGroup model for collaborative study.
 * @property {mongoose.Model} StudyPlan - StudyPlan model for study schedules.
 * @property {mongoose.Model} Subject - Subject model for academic subjects.
 * @property {mongoose.Model} Topic - Topic model for specific topics.
 * @property {mongoose.Model} Lesson - Lesson base model for lesson structure.
 * @property {mongoose.Model} BiologyLesson - BiologyLesson model for biology lessons.
 * @property {mongoose.Model} ChemistryLesson - ChemistryLesson model for chemistry lessons.
 * @property {mongoose.Model} EnglishLesson - EnglishLesson model for English lessons.
 * @property {mongoose.Model} FrenchLesson - FrenchLesson model for French lessons.
 * @property {mongoose.Model} GeographyLesson - GeographyLesson model for geography lessons.
 * @property {mongoose.Model} HistoryLesson - HistoryLesson model for history lessons.
 * @property {mongoose.Model} MathLesson - MathLesson model for math lessons.
 * @property {mongoose.Model} PhilosophyLesson - PhilosophyLesson model for philosophy lessons.
 * @property {mongoose.Model} PhysicsLesson - PhysicsLesson model for physics lessons.
 */

// =============== USER MODELS =============
// User models
const User = require("./user/user.model");

// =============== ASSESSMENT MODELS =============
// Assessment models
// TODO: Implement Exercise model
// const Exercise = require("./assessment/exercise.model");
const Question = require("./assessment/question.model");
const Quiz = require("./assessment/quiz.model");
const QuizSession = require("./assessment/quiz.session.model");

// =============== RESULTS MODELS =============
// Results models
const QuizResult = require("./assessment/quiz.result.model");
// const Hint = require("./results/hint.model");

// =============== PROGRESS MODELS =============

// =============== LEARNING MODELS =============
// Learning models
const Subject = require("./learning/subject.model");
const Topic = require("./learning/topic.model");

// =============== LEARNING/LESSON MODELS =============
// Learning/lesson models

// =============== EXPORTS =============
/**
 * Exports all Mongoose models for use in the application.
 */
module.exports = {
  User,
  // Exercise, // TODO: Uncomment once Exercise model is implemented
  Question,
  Quiz,
  QuizSession,
  QuizResult,
  Subject,
  Topic,
};
