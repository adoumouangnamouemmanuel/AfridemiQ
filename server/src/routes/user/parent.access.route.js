const express = require("express");
const router = express.Router();
const parentAccessController = require("../../controllers/user/parent.access.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createParentAccessSchema,
  updateParentAccessSchema,
  updateNotificationPreferencesSchema,
  verifyParentAccessSchema,
} = require("../../schemas/user/parent.access.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes (no authentication required)
router.post(
  "/verify",
  validateMiddleware(verifyParentAccessSchema),
  parentAccessController.verifyParentAccess
);

router.get("/students", parentAccessController.getParentStudents);
router.get(
  "/student/:userId/progress",
  parentAccessController.getStudentProgress
);

// Authenticated user routes
router.use(authMiddleware);

router.get("/", parentAccessController.getParentAccess);

router.post(
  "/",
  validateMiddleware(createParentAccessSchema),
  parentAccessController.createParentAccess
);

router.put(
  "/",
  validateMiddleware(updateParentAccessSchema),
  parentAccessController.updateParentAccess
);

router.put(
  "/notifications",
  validateMiddleware(updateNotificationPreferencesSchema),
  parentAccessController.updateNotificationPreferences
);

router.delete("/", parentAccessController.deleteParentAccess);

// Admin routes
router.get(
  "/admin/all",
  roleMiddleware(["admin"]),
  parentAccessController.getAllParentAccess
);

router.get(
  "/admin/analytics",
  roleMiddleware(["admin"]),
  parentAccessController.getParentAccessAnalytics
);

module.exports = router;