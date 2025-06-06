const express = require("express");
const router = express.Router();
const notificationController = require("../../controllers/user/notification.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createNotificationSchema,
  sendBulkNotificationSchema,
} = require("../../schemas/user/notification.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// All routes require authentication
router.use(authMiddleware);

// User routes - specific routes first
router.get("/statistics", notificationController.getUserNotificationStats);
router.put("/read-all", notificationController.markAllAsRead);

// User routes - parameterized routes
router.get("/", notificationController.getUserNotifications);
router.get("/:notificationId", notificationController.getNotificationById);
router.put("/:notificationId/read", notificationController.markAsRead);
router.delete("/:notificationId", notificationController.deleteNotification);

// Admin routes
router.post(
  "/admin/create",
  roleMiddleware(["admin"]),
  validateMiddleware(createNotificationSchema),
  notificationController.createNotification
);

router.post(
  "/admin/bulk",
  roleMiddleware(["admin"]),
  validateMiddleware(sendBulkNotificationSchema),
  notificationController.sendBulkNotification
);

router.get(
  "/admin/analytics",
  roleMiddleware(["admin"]),
  notificationController.getSystemNotificationAnalytics
);

router.delete(
  "/admin/cleanup",
  roleMiddleware(["admin"]),
  notificationController.cleanupExpiredNotifications
);

module.exports = router;