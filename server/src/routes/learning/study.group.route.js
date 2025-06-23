const express = require("express");
const router = express.Router();
const studyGroupController = require("../../controllers/learning/study.group.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createStudyGroupSchema,
  updateStudyGroupSchema,
  getStudyGroupSchema,
} = require("../../schemas/learning/study.group.schema");

router.use(apiLimiter);
router.use(authMiddleware);

router.get("/:id", studyGroupController.getStudyGroupById);

router.get(
  "/",
  validateMiddleware(getStudyGroupSchema),
  studyGroupController.getStudyGroups
);

router.post(
  "/",
  validateMiddleware(createStudyGroupSchema),
  studyGroupController.createStudyGroup
);

router.put(
  "/:id",
  validateMiddleware(updateStudyGroupSchema),
  studyGroupController.updateStudyGroup
);

router.delete(
  "/:id",
  roleMiddleware(["admin"]),
  studyGroupController.deleteStudyGroup
);

module.exports = router;