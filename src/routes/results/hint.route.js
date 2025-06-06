const express = require("express");
const hintUsageController = require("../../controllers/results/hint.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
// const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  recordHintUsageSchema,
  updateHintUsageSchema,
  getHintUsageSchema,
  bulkDeleteSchema,
} = require("../../schemas/results/hint.usage.schema");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Hint usage operations
router.post(
  "/",
  validateMiddleware(recordHintUsageSchema),
  hintUsageController.recordHintUsage
);
router.get(
  "/my-usage",
  validateMiddleware(getHintUsageSchema, "query"),
  hintUsageController.getMyHintUsage
);
router.get("/my-analytics", hintUsageController.getMyHintAnalytics);

// Individual hint usage operations
router.get("/:id", hintUsageController.getHintUsageById);
router.put(
  "/:id",
  validateMiddleware(updateHintUsageSchema),
  hintUsageController.updateHintUsage
);
router.delete("/:id", hintUsageController.deleteHintUsage);

// Question-specific operations
router.get(
  "/question/:questionId/stats",
  hintUsageController.getQuestionHintStats
);

// User-specific operations (admin or self)
router.get(
  "/user/:userId",
  validateMiddleware(getHintUsageSchema, "query"),
  hintUsageController.getUserHintUsage
);
router.get("/user/:userId/analytics", hintUsageController.getUserHintAnalytics);

// Admin operations
router.get(
  "/admin/questions-needing-hints",
  hintUsageController.getQuestionsNeedingBetterHints
);
router.get("/admin/summary", hintUsageController.getHintUsageSummary);
router.post(
  "/admin/bulk-delete",
  validateMiddleware(bulkDeleteSchema),
  hintUsageController.bulkDeleteHintUsages
);

module.exports = router;
