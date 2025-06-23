const express = require("express");
const router = express.Router();
const examController = require("../../controllers/assessment/exam.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createExamSchema,
  updateExamSchema,
  addSeriesToExamSchema,
  addCenterToExamSchema,
  addStatisticsToExamSchema,
  rateExamSchema,
} = require("../../schemas/assessment/exam.schema");

// Appliquer la limitation de débit à toutes les routes
router.use(apiLimiter);

// Routes publiques - L'ORDRE COMPTE ! Les routes plus spécifiques doivent venir avant les génériques
router.get("/search", examController.searchExams);
router.get("/stats", examController.getExamStats);
router.get("/upcoming", examController.getUpcomingExams);
router.get("/country/:country", examController.getExamsByCountry);
router.get("/level/:level", examController.getExamsByLevel);
router.get("/", examController.getExams);
router.get("/:id", examController.getExamById);

// Routes protégées (nécessitent une authentification)
router.use(authMiddleware);

// Routes d'interaction utilisateur
router.post(
  "/:id/rate",
  validateMiddleware(rateExamSchema),
  examController.rateExam
);
router.post("/:id/popularity", examController.incrementPopularity);

// Routes administrateur uniquement
router.post(
  "/",
  roleMiddleware(["admin"]),
  validateMiddleware(createExamSchema),
  examController.createExam
);
router.put(
  "/:id",
  roleMiddleware(["admin"]),
  validateMiddleware(updateExamSchema),
  examController.updateExam
);
router.delete("/:id", roleMiddleware(["admin"]), examController.deleteExam);

// Gestion des séries (admin seulement)
router.post(
  "/:id/series",
  roleMiddleware(["admin"]),
  validateMiddleware(addSeriesToExamSchema),
  examController.addSeriesToExam
);
router.delete(
  "/:id/series/:seriesId",
  roleMiddleware(["admin"]),
  examController.removeSeriesFromExam
);

// Gestion des centres (admin seulement)
router.post(
  "/:id/centers",
  roleMiddleware(["admin"]),
  validateMiddleware(addCenterToExamSchema),
  examController.addCenterToExam
);

// Gestion des statistiques (admin seulement)
router.post(
  "/:id/statistics",
  roleMiddleware(["admin"]),
  validateMiddleware(addStatisticsToExamSchema),
  examController.addStatisticsToExam
);

module.exports = router;