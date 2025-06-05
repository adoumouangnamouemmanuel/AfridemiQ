const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const userRoutes = require("./src/routes/user/user.route");
const errorMiddleware = require("./src/middlewares/error.middleware");
const dotenv = require("dotenv");

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
      `Error: Missing required environment variables: ${missingEnvVars.join(
        ", "
      )}`
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
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/users", userRoutes);

// 404 handler
app.use((req, res, next) => {
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
    console.log("Shutting down gracefully...");
    mongoose.connection
      .close(false)
      .then(() => {
        console.log("MongoDB connection closed");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error during shutdown:", err);
        process.exit(1);
      });
  }

  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app; // Export for testing