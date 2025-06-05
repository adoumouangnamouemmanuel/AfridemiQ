const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user/user.route");
const errorMiddleware = require("./middlewares/error.middleware");
const dotenv = require('dotenv');

const app = express();

// Middleware
app.use(express.json());

// Load .env from parent directory
dotenv.config({ path: '../.env' });

// Debug environment variables
console.log("MONGO_URI:", process.env.MONGO_URI);

// Validate MONGO_URI
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/users", userRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));