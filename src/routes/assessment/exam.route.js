const express = require("express");
const examController = require("../../controllers/assessment/exam.controller");
const { validateRequest } = require("../../middlewares/validation.middleware");
const {
  authenticateToken,
  requireAdmin,
} = require("../../middlewares/auth.middleware");
const {
  createExamSchema,
  updateExamSchema,
  getExamsSchema,
  addSeriesToExamSchema,
  addCenterToExamSchema,
  addStatisticsToExamSchema,
  rateExamSchema,
} = require("../../schemas/assessment/exam.schema");

const router = express.Router();

// Routes publiques
router.get(
  "/",
  validateRequest(getExamsSchema, "query"),
  examController.getExams
);
router.get("/search", examController.searchExams);
router.get("/stats", examController.getExamStats);
router.get("/upcoming", examController.getUpcomingExams);
router.get("/country/:country", examController.getExamsByCountry);
router.get("/level/:level", examController.getExamsByLevel);
router.get("/:id", examController.getExamById);

// Routes d'interaction utilisateur
router.post(
  "/:id/rate",
  authenticateToken,
  validateRequest(rateExamSchema),
  examController.rateExam
);
router.post(
  "/:id/popularity",
  authenticateToken,
  examController.incrementPopularity
);

// Routes admin seulement
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validateRequest(createExamSchema),
  examController.createExam
);
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateRequest(updateExamSchema),
  examController.updateExam
);
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  examController.deleteExam
);

// Gestion des séries (admin seulement)
router.post(
  "/:id/series",
  authenticateToken,
  requireAdmin,
  validateRequest(addSeriesToExamSchema),
  examController.addSeriesToExam
);
router.delete(
  "/:id/series/:seriesId",
  authenticateToken,
  requireAdmin,
  examController.removeSeriesFromExam
);

// Gestion des centres (admin seulement)
router.post(
  "/:id/centers",
  authenticateToken,
  requireAdmin,
  validateRequest(addCenterToExamSchema),
  examController.addCenterToExam
);

// Gestion des statistiques (admin seulement)
router.post(
  "/:id/statistics",
  authenticateToken,
  requireAdmin,
  validateRequest(addStatisticsToExamSchema),
  examController.addStatisticsToExam
);

module.exports = router;