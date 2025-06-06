const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const userRoutes = require("./src/routes/user/user.route");
const countryRoutes = require("./src/routes/user/country.route");
const subjectRoutes = require("./src/routes/learning/subject.route");
const curriculumRoutes = require("./src/routes/learning/curriculum.route");
const examRoutes = require("./src/routes/assessment/exam.route");
const topicRoutes = require("./src/routes/learning/topic.route");
const courseContentRoutes = require("./src/routes/learning/course.content.route");
const resourceRoutes = require("./src/routes/learning/resource.route");
const userAnalyticsRoutes = require("./src/routes/user/user.analytics.route");
const achievementRoutes = require("./src/routes/user/achievement.route");
const dashboardRoutes = require("./src/routes/user/dashboard.route");
const onboardingStatusRoutes = require("./src/routes/user/onboarding.status.route");
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
app.use(helmet());
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
      // Log registered models
      const modelNames = mongoose.modelNames();
      console.info(`Modèles enregistrés: ${modelNames.join(", ")}`);
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
app.use("/api/topics", topicRoutes);
app.use("/api/user-analytics", userAnalyticsRoutes);
app.use("/api/course-contents", courseContentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/onboarding-status", onboardingStatusRoutes);

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
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.info(`Serveur en cours d'exécution sur le port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV || "development",
      logLevel: process.env.LOG_LEVEL || "info",
    });
  });
}

module.exports = app; // Export for testing
