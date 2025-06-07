const express = require("express");
const router = express.Router();
const tutoringSessionController = require("../../controllers/user/tutoring.session.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createTutoringSessionSchema,
  updateTutoringSessionSchema,
  getTutoringSessionSchema,
} = require("../../schemas/user/tutoring.session.schema");

router.use(apiLimiter);
router.use(authMiddleware);

// Session operations
router.post(
  "/",
  validateMiddleware(createTutoringSessionSchema),
  tutoringSessionController.createSession
);
router.get(
  "/my-sessions",
  validateMiddleware(getTutoringSessionSchema, "query"),
  tutoringSessionController.getMySessions
);
router.get(
  "/",
  validateMiddleware(getTutoringSessionSchema, "query"),
  tutoringSessionController.getSessions
);

// Individual session operations
router.get("/:id", tutoringSessionController.getSessionById);
router.put(
  "/:id",
  validateMiddleware(updateTutoringSessionSchema),
  tutoringSessionController.updateSession
);
router.put("/:id/cancel", tutoringSessionController.cancelSession);

// Admin operations
router.get(
  "/admin/sessions",
  roleMiddleware(["admin"]),
  validateMiddleware(getTutoringSessionSchema, "query"),
  tutoringSessionController.getSessions
);

module.exports = router;