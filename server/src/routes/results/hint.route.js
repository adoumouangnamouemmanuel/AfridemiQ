const express = require("express");
const router = express.Router();
const hintController = require("../../controllers/results/hint.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  recordHintUsageSchema,
  updateHintUsageSchema,
  getHintUsageSchema,
  bulkDeleteSchema,
} = require("../../schemas/results/hint.schema");
const Joi = require("joi");

router.use(apiLimiter);
router.use(authMiddleware);

// Hint usage operations
router.post(
  "/",
  validateMiddleware(recordHintUsageSchema),
  hintController.recordHintUsage
);
router.get(
  "/my-usage",
  validateMiddleware(getHintUsageSchema, "query"),
  hintController.getMyHintUsage
);
router.get("/my-analytics", hintController.getMyHintAnalytics);

// Individual hint usage operations
router.get("/:id", hintController.getHintUsageById);
router.put(
  "/:id",
  validateMiddleware(updateHintUsageSchema),
  hintController.updateHintUsage
);
router.delete("/:id", hintController.deleteHintUsage);
router.post(
  "/:id/steps",
  validateMiddleware(
    Joi.object({ stepNumber: Joi.number().integer().min(0).required() })
  ),
  hintController.addViewedStep
);

// Question-specific operations
router.get("/question/:questionId/stats", hintController.getQuestionHintStats);

// User-specific operations (admin or self)
router.get(
  "/user/:userId",
  validateMiddleware(getHintUsageSchema, "query"),
  hintController.getUserHintUsage
);
router.get("/user/:userId/analytics", hintController.getUserHintAnalytics);

// Admin operations
router.get(
  "/admin/questions-needing-hints",
  roleMiddleware(["admin"]),
  hintController.getQuestionsNeedingBetterHints
);
router.get(
  "/admin/summary",
  roleMiddleware(["admin"]),
  validateMiddleware(
    Joi.object({
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      groupBy: Joi.string().valid("day", "week", "month").default("day"),
    }),
    "query"
  ),
  hintController.getHintUsageSummary
);
router.post(
  "/admin/bulk-delete",
  roleMiddleware(["admin"]),
  validateMiddleware(bulkDeleteSchema),
  hintController.bulkDeleteHintUsages
);

module.exports = router;