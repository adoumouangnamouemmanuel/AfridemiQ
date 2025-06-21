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

// Public routes
router.get("/", topicController.getAllTopics);
router.get("/search", topicController.searchTopics);
router.get("/statistics", topicController.getTopicStatistics);
router.get("/difficulty-levels", topicController.getDifficultyLevels);
router.get("/subject/:subjectId", topicController.getTopicsBySubject);
router.get("/difficulty/:difficulty", topicController.getTopicsByDifficulty);
router.get("/series/:series", topicController.getTopicsBySeries);
router.get("/:id", topicController.getTopicById);

// Protected routes (require authentication)
router.use(authMiddleware);

// Admin-only routes
router.post(
  "/",
  roleMiddleware(["admin"]),
  validateMiddleware(createTopicSchema),
  topicController.createTopic
);

router.put(
  "/:id",
  roleMiddleware(["admin"]),
  validateMiddleware(updateTopicSchema),
  topicController.updateTopic
);

router.delete("/:id", roleMiddleware(["admin"]), topicController.deleteTopic);

router.post(
  "/bulk/create",
  roleMiddleware(["admin"]),
  validateMiddleware(bulkCreateTopicsSchema),
  topicController.bulkCreateTopics
);

router.put(
  "/bulk/update",
  roleMiddleware(["admin"]),
  validateMiddleware(bulkUpdateTopicsSchema),
  topicController.bulkUpdateTopics
);

module.exports = router;
