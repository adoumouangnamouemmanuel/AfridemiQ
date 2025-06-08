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

// Public routes - ORDER MATTERS! More specific routes must come before generic ones
// Series route must come before /:id to avoid being caught as an ID
router.get(
  "/series/:series",
  validateMiddleware(getSubjectsSchema),
  subjectController.getSubjectsBySeries
);

// Main listing route
router.get(
  "/",
  validateMiddleware(getSubjectsSchema),
  subjectController.getSubjects
);

// ID route should come last as it's the most generic pattern
router.get("/:id", subjectController.getSubjectById);

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
