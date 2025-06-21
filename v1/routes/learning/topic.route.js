const express = require("express");
const topicController = require("../../controllers/learning/topic.controller");
const validateMiddleware = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const utf8Middleware = require("../../middlewares/utf8.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");

const {
  createTopicSchema,
  updateTopicSchema,
  getTopicsQuerySchema,
} = require("../../schemas/learning/topic.schema");

const router = express.Router();

// Apply UTF-8 middleware to all routes
router.use(utf8Middleware);

// Apply rate limiting
router.use(apiLimiter);

// =============== PUBLIC ROUTES ===============

// Get all topics with filtering and pagination
router.get(
  "/",
  validateMiddleware(getTopicsQuerySchema, "query"),
  topicController.getTopics
);

// Get topic by ID
router.get("/:id", topicController.getTopicById);

// Get topics by subject
router.get("/subject/:subjectId", topicController.getTopicsBySubject);

// Get topics by difficulty
router.get("/difficulty/:difficulty", topicController.getTopicsByDifficulty);

// Get popular topics
router.get("/popular/list", topicController.getPopularTopics);

// Search topics
router.get("/search/query", topicController.searchTopics);

// =============== PROTECTED ROUTES (Admin Only) ===============

// Create new topic
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(createTopicSchema, "body"),
  topicController.createTopic
);

// Update topic
router.put(
  "/:id",
  roleMiddleware(["admin"]),
  validateMiddleware(updateTopicSchema),
  topicController.updateTopic
);

// Delete topic (soft delete)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  topicController.deleteTopic
);

module.exports = router;
