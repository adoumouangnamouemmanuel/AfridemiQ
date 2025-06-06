const express = require("express");
const router = express.Router();
const topicController = require("../../controllers/learning/topic.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createTopicSchema,
  updateTopicSchema,
  bulkCreateTopicsSchema,
  bulkUpdateTopicsSchema,
} = require("../../schemas/learning/topic.schema");

// Apply rate limiting to all routes
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