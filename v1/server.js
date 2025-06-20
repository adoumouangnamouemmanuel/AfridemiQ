const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");

// user routes
const userRoutes = require("./src/routes/user/user.route");
// Learning routes
const subjectRoutes = require("./src/routes/learning/subject.route");
const topicRoutes = require("./src/routes/learning/topic.route");
// assessment routes
const examRoutes = require("./src/routes/assessment/exam.route");
const assessmentRoutes = require("./src/routes/assessment/assessment.route");
const quizRoutes = require("./src/routes/assessment/quiz.route");
const challengeRoutes = require("./src/routes/assessment/challenge.route");
const examScheduleRoutes = require("./src/routes/assessment/exam.schedule.route");
const questionRoutes = require("./src/routes/assessment/question.route");
const exerciseRoutes = require("./src/routes/assessment/exercise.route");

// Results routes
const quizResultRoutes = require("./src/routes/assessment/quiz.result.route");

const errorMiddleware = require("./src/middlewares/error.middleware");
const dotenv = require("dotenv");

// Import all models to register them with Mongoose
require("./src/models");

// Load environment variables
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: "__tests__/.env.test" });
} else {
  dotenv.config();
}

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  origin: process.env.ALLOWED_ORIGIN || "*", // Allow all origins by default, can be overridden
  contentSecurityPolicy: false, // Disable CSP for simplicity, can be configured later
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resource sharing
  referrerPolicy: { policy: "no-referrer" }, // Set referrer policy
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Connect to MongoDB only if not in test environment (tests handle their own connection)
if (process.env.NODE_ENV !== "test") {
  // Validate required environment variables
  const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.error(
      `Variables d'environnement manquantes: ${missingEnvVars.join(", ")}`
    );
    process.exit(1);
  }

  // MongoDB connection options
  const mongoOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  // Connect to MongoDB
  mongoose
    .connect(process.env.MONGO_URI, mongoOptions)
    .then(() => {
      console.info("Connecté à MongoDB");
    })
    .catch((err) => {
      console.error("Erreur de connexion MongoDB:", err);
      process.exit(1);
    });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    models: mongoose.modelNames(), // Show registered models
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/curricula", curriculumRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/user-analytics", userAnalyticsRoutes);
app.use("/api/user-progress", userProgressRoutes);
app.use("/api/course-contents", courseContentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/adaptive-learning", adaptiveLearningRoutes);
app.use("/api/learning-paths", learningPathRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use("/api/study-groups", studyGroupRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/onboarding-status", onboardingStatusRoutes);
app.use("/api/feedback-loop", feedbackLoopRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/peer-tutor-profiles", peerTutorProfileRoutes);
app.use("/api/tutoring-sessions", tutoringSessionRoutes);
app.use("/api/progress/gamified", gamifiedProgressRoutes);
app.use("/api/progress/leaderboard", leaderboardEntryRoutes);
app.use("/api/progress/missions", missionRoutes);
app.use("/api/progress/topic", topicProgressRoutes);
app.use("/api/parent-access", parentAccessRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/hints", userHintRoutes);
app.use("/api/quiz-results", quizResultRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/exam-schedules", examScheduleRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exercises", exerciseRoutes);

// Learning lesson routes
app.use("/api/lessons", lessonRoutes);
app.use("/api/biology-lessons", biologyLessonRoutes);
app.use("/api/lessons/math", mathLessonRoutes);
app.use("/api/english-lessons", englishLessonRoutes);
app.use("/api/french-lessons", frenchLessonRoutes);
app.use("/api/chemistry-lessons", chemistryLessonRoutes);
app.use("/api/physics-lessons", physicsLessonRoutes);
app.use("/api/geography-lessons", geographyLessonRoutes);
app.use("/api/history-lessons", historyLessonRoutes);
app.use("/api/philosophy-lessons", philosophyLessonRoutes);

// 404 handler
app.use((req, res, next) => {
  console.warn(`404 - Route non trouvée: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  res.status(404).json({
    message: "Route non trouvée",
    status: "error",
    code: "NOT_FOUND",
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Start server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  // Graceful shutdown
  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);

  function gracefulShutdown() {
    console.info("Arrêt en cours...");
    mongoose.connection
      .close(false)
      .then(() => {
        console.info("Connexion MongoDB fermée");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Erreur lors de l'arrêt:", err);
        process.exit(1);
      });
  }

  // Start server
  HOST = '0.0.0.0';
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, HOST, () => {
    console.info(`Serveur en cours d'exécution sur le port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV || "development",
      logLevel: process.env.LOG_LEVEL || "info",
    });
  });
}

module.exports = app; // Export for testing
