const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");

// user routes
const userRoutes = require("./routes/user/user.route");
// Learning routes
const subjectRoutes = require("./routes/learning/subject.route");
const topicRoutes = require("./routes/learning/topic.route");
const resourceRoutes = require("./routes/learning/resource.route");
// assessment routes
// const quizRoutes = require("./routes/assessment/quiz.route");
// const questionRoutes = require("./routes/assessment/question.route");

// Results routes
// const quizResultRoutes = require("./routes/assessment/quiz.result.route");

const errorMiddleware = require("./middlewares/error.middleware");
const dotenv = require("dotenv");

// Import all models to register them with Mongoose
require("./models");

// Load environment variables
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: "__tests__/.env.test" });
} else {
  dotenv.config();
}

// Create Express app
const app = express();

// Security middleware
app.use(
  helmet({
    origin: process.env.ALLOWED_ORIGIN || "*", // Allow all origins by default, can be overridden
    contentSecurityPolicy: false, // Disable CSP for simplicity, can be configured later
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resource sharing
    referrerPolicy: { policy: "no-referrer" }, // Set referrer policy
  })
);
app.use(cors());
app.use(compression());

// ✅ ADD THIS UTF-8 MIDDLEWARE HERE - BEFORE express.json()
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});
// ✅ UPDATE THESE LINES TO INCLUDE UTF-8 CHARSET
app.use(
  express.json({
    limit: "1mb",
    charset: "utf-8",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
    charset: "utf-8",
  })
);

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
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/resources", resourceRoutes);

// app.use("/api/quizzes", quizRoutes);
// app.use("/api/quiz-results", quizResultRoutes);
// app.use("/api/questions", questionRoutes);

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
  HOST = "0.0.0.0";
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
