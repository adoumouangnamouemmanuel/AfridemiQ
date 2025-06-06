const express = require("express");
const router = express.Router();
const feedbackLoopController = require("../../controllers/user/feedback.loop.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createFeedbackLoopSchema,
  addFeedbackSchema,
  respondToFeedbackSchema,
  updateFeedbackStatusSchema,
} = require("../../schemas/user/feedback.loop.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// All routes require authentication
router.use(authMiddleware);

// User routes
router.get("/", feedbackLoopController.getUserFeedbackLoops);
router.get("/:feedbackLoopId", feedbackLoopController.getFeedbackLoopById);

router.post(
  "/",
  validateMiddleware(createFeedbackLoopSchema),
  feedbackLoopController.createFeedbackLoop
);

router.post(
  "/:feedbackLoopId/feedback",
  validateMiddleware(addFeedbackSchema),
  feedbackLoopController.addFeedback
);

router.delete("/:feedbackLoopId", feedbackLoopController.deleteFeedbackLoop);

// Admin routes
router.get(
  "/admin/all",
  roleMiddleware(["admin"]),
  feedbackLoopController.getAllFeedbackLoops
);

router.get(
  "/admin/analytics",
  roleMiddleware(["admin"]),
  feedbackLoopController.getFeedbackAnalytics
);

router.get(
  "/admin/overdue",
  roleMiddleware(["admin"]),
  feedbackLoopController.getOverdueFeedback
);

router.post(
  "/admin/:feedbackLoopId/respond",
  roleMiddleware(["admin"]),
  validateMiddleware(respondToFeedbackSchema),
  feedbackLoopController.respondToFeedback
);

router.put(
  "/admin/:feedbackLoopId/status",
  roleMiddleware(["admin"]),
  validateMiddleware(updateFeedbackStatusSchema),
  feedbackLoopController.updateFeedbackStatus
);

module.exports = router;