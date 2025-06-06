const { StatusCodes } = require("http-status-codes");
const examService = require("../../services/assessment/exam/exam.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("ExamController");

// Créer un nouvel examen
const createExam = async (req, res) => {
  try {
    const exam = await examService.createExam(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Examen créé avec succès",
      data: exam,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur createExam", error);
    throw error;
  }
};

// Obtenir tous les examens
const getExams = async (req, res) => {
  try {
    const result = await examService.getExams(req.query);
    res.status(StatusCodes.OK).json({
      message: "Examens récupérés avec succès",
      data: result.exams,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur getExams", error, {
      query: req.query,
    });
    throw error;
  }
};

// Obtenir un examen par ID
const getExamById = async (req, res) => {
  try {
    const exam = await examService.getExamById(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Examen récupéré avec succès",
      data: exam,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur getExamById", error, {
      examId: req.params.id,
    });
    throw error;
  }
};

// Mettre à jour un examen
const updateExam = async (req, res) => {
  try {
    const exam = await examService.updateExam(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      message: "Examen mis à jour avec succès",
      data: exam,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur updateExam", error, {
      examId: req.params.id,
    });
    throw error;
  }
};

// Supprimer un examen
const deleteExam = async (req, res) => {
  try {
    const result = await examService.deleteExam(req.params.id);
    res.status(StatusCodes.OK).json({
      message: result.message,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur deleteExam", error, {
      examId: req.params.id,
    });
    throw error;
  }
};

// Ajouter une série à un examen
const addSeriesToExam = async (req, res) => {
  try {
    const exam = await examService.addSeriesToExam(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      message: "Série ajoutée à l'examen avec succès",
      data: exam,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur addSeriesToExam", error, {
      examId: req.params.id,
    });
    throw error;
  }
};

// Supprimer une série d'un examen
const removeSeriesFromExam = async (req, res) => {
  try {
    const exam = await examService.removeSeriesFromExam(
      req.params.id,
      req.params.seriesId
    );
    res.status(StatusCodes.OK).json({
      message: "Série supprimée de l'examen avec succès",
      data: exam,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur removeSeriesFromExam", error, {
      examId: req.params.id,
      seriesId: req.params.seriesId,
    });
    throw error;
  }
};

// Ajouter un centre d'examen
const addCenterToExam = async (req, res) => {
  try {
    const exam = await examService.addCenterToExam(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      message: "Centre ajouté à l'examen avec succès",
      data: exam,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur addCenterToExam", error, {
      examId: req.params.id,
    });
    throw error;
  }
};

// Ajouter des statistiques à un examen
const addStatisticsToExam = async (req, res) => {
  try {
    const exam = await examService.addStatisticsToExam(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      message: "Statistiques ajoutées à l'examen avec succès",
      data: exam,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur addStatisticsToExam", error, {
      examId: req.params.id,
    });
    throw error;
  }
};

// Noter un examen
const rateExam = async (req, res) => {
  try {
    const { rating } = req.body;
    const exam = await examService.rateExam(req.params.id, rating);
    res.status(StatusCodes.OK).json({
      message: "Note ajoutée avec succès",
      data: exam,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur rateExam", error, {
      examId: req.params.id,
    });
    throw error;
  }
};

// Incrémenter la popularité
const incrementPopularity = async (req, res) => {
  try {
    const { amount = 1 } = req.body;
    const exam = await examService.incrementPopularity(req.params.id, amount);
    res.status(StatusCodes.OK).json({
      message: "Popularité mise à jour avec succès",
      data: exam,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur incrementPopularity", error, {
      examId: req.params.id,
    });
    throw error;
  }
};

// Obtenir les examens par pays
const getExamsByCountry = async (req, res) => {
  try {
    const exams = await examService.getExamsByCountry(req.params.country);
    res.status(StatusCodes.OK).json({
      message: "Examens récupérés par pays avec succès",
      data: exams,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur getExamsByCountry", error, {
      country: req.params.country,
    });
    throw error;
  }
};

// Obtenir les examens par niveau
const getExamsByLevel = async (req, res) => {
  try {
    const exams = await examService.getExamsByLevel(req.params.level);
    res.status(StatusCodes.OK).json({
      message: "Examens récupérés par niveau avec succès",
      data: exams,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur getExamsByLevel", error, {
      level: req.params.level,
    });
    throw error;
  }
};

// Obtenir les examens à venir
const getUpcomingExams = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const exams = await examService.getUpcomingExams(Number.parseInt(days));
    res.status(StatusCodes.OK).json({
      message: "Examens à venir récupérés avec succès",
      data: exams,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur getUpcomingExams", error, {
      query: req.query,
    });
    throw error;
  }
};

// Obtenir les statistiques des examens
const getExamStats = async (req, res) => {
  try {
    const stats = await examService.getExamStats();
    res.status(StatusCodes.OK).json({
      message: "Statistiques des examens récupérées avec succès",
      data: stats,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur getExamStats", error);
    throw error;
  }
};

// Rechercher des examens
const searchExams = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    const exams = await examService.searchExams(q, Number.parseInt(limit));
    res.status(StatusCodes.OK).json({
      message: "Recherche d'examens effectuée avec succès",
      data: exams,
    });
  } catch (error) {
    logger.error("Erreur dans le contrôleur searchExams", error, {
      query: req.query,
    });
    throw error;
  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  addSeriesToExam,
  removeSeriesFromExam,
  addCenterToExam,
  addStatisticsToExam,
  rateExam,
  incrementPopularity,
  getExamsByCountry,
  getExamsByLevel,
  getUpcomingExams,
  getExamStats,
  searchExams,
};