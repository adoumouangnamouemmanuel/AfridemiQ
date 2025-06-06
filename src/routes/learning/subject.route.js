const express = require("express");
const router = express.Router();
const subjectController = require("../../controllers/learning/subject.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createSubjectSchema,
  updateSubjectSchema,
  getSubjectsSchema,
  addExamToSubjectSchema,
  rateSubjectSchema,
} = require("../../schemas/learning/subject.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// Debug route - get all subjects without any filters
router.get("/debug/all", subjectController.getAllSubjectsRaw);

// Public routes
router.get(
  "/",
  validateMiddleware(getSubjectsSchema),
  subjectController.getSubjects
);
router.get("/:id", subjectController.getSubjectById);
router.get("/series/:series", subjectController.getSubjectsBySeries);

// Protected routes (require authentication)
router.use(authMiddleware);

// Student routes (authenticated users)
router.post(
  "/:id/rate",
  validateMiddleware(rateSubjectSchema),
  subjectController.rateSubject
);

// Teacher and Admin routes
router.post(
  "/",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(createSubjectSchema),
  subjectController.createSubject
);

router.put(
  "/:id",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(updateSubjectSchema),
  subjectController.updateSubject
);

router.delete(
  "/:id",
  roleMiddleware(["teacher", "admin"]),
  subjectController.deleteSubject
);

router.post(
  "/:id/exams",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(addExamToSubjectSchema),
  subjectController.addExamToSubject
);

router.delete(
  "/:id/exams/:examId",
  roleMiddleware(["teacher", "admin"]),
  subjectController.removeExamFromSubject
);

module.exports = router;
