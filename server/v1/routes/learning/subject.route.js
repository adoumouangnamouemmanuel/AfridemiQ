const express = require("express");
const subjectController = require("../../controllers/learning/subject.controller");
const validateMiddleware = require("../../middlewares/validate.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const utf8Middleware = require("../../middlewares/utf8.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");

const {
  createSubjectSchema,
  updateSubjectSchema,
  getSubjectsQuerySchema,
} = require("../../schemas/learning/subject.schema");

const router = express.Router();

// Apply UTF-8 middleware to all routes
router.use(utf8Middleware);

// Apply rate limiting
router.use(apiLimiter);

// =============== PUBLIC ROUTES ===============

// Get all subjects with filtering and pagination
router.get(
  "/",
  validateMiddleware(getSubjectsQuerySchema, "query"),
  subjectController.getSubjects
);

// Get subject by ID
router.get("/:id", subjectController.getSubjectById);

// Get featured subjects
router.get("/featured/list", subjectController.getFeaturedSubjects);

// Get popular subjects
router.get("/popular/list", subjectController.getPopularSubjects);

// Get subjects by education level and country
router.get(
  "/education/:educationLevel/country/:country",
  subjectController.getSubjectsByEducationAndCountry
);

// Get subjects by exam type
router.get("/exam/:examType", subjectController.getSubjectsByExamType);

// Search subjects
router.get("/search/query", subjectController.searchSubjects);

// =============== PROTECTED ROUTES (Admin Only) ===============

// Create new subject
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(createSubjectSchema, "body"),
  subjectController.createSubject
);

// Update subject
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  validateMiddleware(updateSubjectSchema, "body"),
  subjectController.updateSubject
);

// Delete subject (soft delete)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  subjectController.deleteSubject
);

module.exports = router;
