const express = require("express");
const router = express.Router();
const learningPathController = require("../../controllers/learning/learning.path.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createLearningPathSchema,
  updateLearningPathSchema,
  getLearningPathSchema,
} = require("../../schemas/learning/learning.path.schema");

router.use(apiLimiter);
router.use(authMiddleware);

router.get("/:id", learningPathController.getLearningPathById);

router.get(
  "/",
  validateMiddleware(getLearningPathSchema),
  learningPathController.getLearningPaths
);

router.post(
  "/",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(createLearningPathSchema),
  learningPathController.createLearningPath
);

router.put(
  "/:id",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(updateLearningPathSchema),
  learningPathController.updateLearningPath
);

router.delete(
  "/:id",
  roleMiddleware(["admin"]),
  learningPathController.deleteLearningPath
);

module.exports = router;