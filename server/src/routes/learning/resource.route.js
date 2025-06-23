const express = require("express");
const router = express.Router();
const resourceController = require("../../controllers/learning/resource.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createResourceSchema,
  updateResourceSchema,
  addFeedbackSchema,
  bulkCreateResourcesSchema,
} = require("../../schemas/learning/resource.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get("/", resourceController.getAllResources);
router.get("/search", resourceController.searchResources);
router.get("/statistics", resourceController.getResourceStatistics);
router.get("/formats", resourceController.getResourceFormats);
router.get("/subject/:subjectId", resourceController.getResourcesBySubject);
router.get("/topic/:topicId", resourceController.getResourcesByTopic);
router.get("/exam/:examId", resourceController.getResourcesByExam);
router.get("/:id", resourceController.getResourceById);

// User routes (authentication required)
router.post(
  "/:id/feedback",
  authMiddleware,
  validateMiddleware(addFeedbackSchema),
  resourceController.addFeedback
);
router.put("/:id/view", authMiddleware, resourceController.trackView);
router.put("/:id/download", authMiddleware, resourceController.trackDownload);

// Admin routes (authentication + admin role required)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(createResourceSchema),
  resourceController.createResource
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(updateResourceSchema),
  resourceController.updateResource
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  resourceController.deleteResource
);

router.post(
  "/bulk/create",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(bulkCreateResourcesSchema),
  resourceController.bulkCreateResources
);

router.get(
  "/admin/analytics",
  authMiddleware,
  roleMiddleware(["admin"]),
  resourceController.getAdminAnalytics
);

module.exports = router;