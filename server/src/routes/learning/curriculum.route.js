const express = require("express");
const router = express.Router();
const curriculumController = require("../../controllers/learning/curriculum.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const utf8Middleware = require("../../middlewares/utf8.middleware"); // Add UTF-8 middleware
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createCurriculumSchema,
  updateCurriculumSchema,
  getCurriculaSchema,
  addSubjectToCurriculumSchema,
} = require("../../schemas/learning/curriculum.schema");

// Apply rate limiting to all routes
router.use(apiLimiter);

// Apply UTF-8 middleware to all routes
router.use(utf8Middleware);

// Public routes - ORDER MATTERS! More specific routes must come before generic ones
router.get("/stats", curriculumController.getCurriculumStats);
router.get("/country/:country", curriculumController.getCurriculaByCountry);
router.get(
  "/",
  validateMiddleware(getCurriculaSchema),
  curriculumController.getCurricula
);
router.get("/:id", curriculumController.getCurriculumById);

// Protected routes (require authentication)
router.use(authMiddleware);

// Teacher and Admin routes
router.post(
  "/",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(createCurriculumSchema),
  curriculumController.createCurriculum
);

router.put(
  "/:id",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(updateCurriculumSchema),
  curriculumController.updateCurriculum
);

router.delete(
  "/:id",
  roleMiddleware(["teacher", "admin"]),
  curriculumController.deleteCurriculum
);

router.post(
  "/:id/subjects",
  roleMiddleware(["teacher", "admin"]),
  validateMiddleware(addSubjectToCurriculumSchema),
  curriculumController.addSubjectToCurriculum
);

router.delete(
  "/:id/subjects/:subjectId",
  roleMiddleware(["teacher", "admin"]),
  curriculumController.removeSubjectFromCurriculum
);

module.exports = router;