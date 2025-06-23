const express = require("express");
const router = express.Router();
const studyPlanController = require("../../controllers/learning/study.plan.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createStudyPlanSchema,
  updateStudyPlanSchema,
  getStudyPlanSchema,
} = require("../../schemas/learning/study.plan.schema");

router.use(apiLimiter);
router.use(authMiddleware);

router.get("/:id", studyPlanController.getStudyPlanById);

router.get(
  "/user/:userId",
  validateMiddleware(getStudyPlanSchema),
  studyPlanController.getStudyPlanByUserId
);

router.get(
  "/",
  roleMiddleware(["admin"]),
  validateMiddleware(getStudyPlanSchema),
  studyPlanController.getStudyPlans
);

router.post(
  "/",
  validateMiddleware(createStudyPlanSchema),
  studyPlanController.createStudyPlan
);

router.put(
  "/:id",
  validateMiddleware(updateStudyPlanSchema),
  studyPlanController.updateStudyPlan
);

router.delete("/:id", studyPlanController.deleteStudyPlan);

module.exports = router;