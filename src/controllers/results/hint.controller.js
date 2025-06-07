const { StatusCodes } = require("http-status-codes");
const hintService = require("../../services/results/hint.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");
const createLogger = require("../../services/logging.service");
const { HintUsage } = require("../../models/results/hint.model");

const logger = createLogger("HintController");

class HintController {
  recordHintUsage = asyncHandler(async (req, res) => {
    const hintData = {
      ...req.body,
      userId: req.user.id,
      deviceInfo: {
        platform: req.headers["x-platform"] || req.body.platform,
        browser: req.headers["user-agent"],
        screenSize: req.body.screenSize,
      },
    };
    const result = await hintService.recordHintUsage(hintData);
    res.status(result.statusCode).json(result);
  });

  getHintUsageById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await hintService.getHintUsageById(id);
    res.status(result.statusCode).json(result);
  });

  getUserHintUsage = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user.id;
    if (userId !== req.user.id && req.user.role !== "admin") {
      logger.warn(
        `Accès refusé pour l'utilisateur ${req.user.id} tentant d'accéder aux données de ${userId}`
      );
      throw new ApiError(403, "Accès refusé");
    }
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 20,
      questionId: req.query.questionId,
      quizId: req.query.quizId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      hintType: req.query.hintType,
    };
    const result = await hintService.getUserHintUsage(userId, options);
    res.status(result.statusCode).json(result);
  });

  getMyHintUsage = asyncHandler(async (req, res) => {
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 20,
      questionId: req.query.questionId,
      quizId: req.query.quizId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      hintType: req.query.hintType,
    };
    const result = await hintService.getUserHintUsage(req.user.id, options);
    res.status(result.statusCode).json(result);
  });

  getQuestionHintStats = asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const result = await hintService.getQuestionHintStats(questionId);
    res.status(result.statusCode).json(result);
  });

  getUserHintAnalytics = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user.id;
    if (userId !== req.user.id && req.user.role !== "admin") {
      logger.warn(
        `Accès refusé pour l'utilisateur ${req.user.id} tentant d'accéder aux analyses de ${userId}`
      );
      throw new ApiError(403, "Accès refusé");
    }
    const result = await hintService.getUserHintAnalytics(userId);
    res.status(result.statusCode).json(result);
  });

  getMyHintAnalytics = asyncHandler(async (req, res) => {
    const result = await hintService.getUserHintAnalytics(req.user.id);
    res.status(result.statusCode).json(result);
  });

  getQuestionsNeedingBetterHints = asyncHandler(async (req, res) => {
    const result = await hintService.getQuestionsNeedingBetterHints();
    res.status(result.statusCode).json(result);
  });

  updateHintUsage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const hintUsage = await HintUsage.findById(id).select("userId");
    if (!hintUsage) {
      logger.warn(
        `Utilisation d'indice introuvable pour la mise à jour: ${id}`
      );
      throw new ApiError(404, "Enregistrement d'indice introuvable");
    }
    if (
      hintUsage.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn(
        `Utilisateur non autorisé ${req.user.id} pour la mise à jour de l'indice ${id}`
      );
      throw new ApiError(
        403,
        "Non autorisé à mettre à jour cet enregistrement d'indice"
      );
    }
    const result = await hintService.updateHintUsage(id, req.body);
    res.status(result.statusCode).json(result);
  });

  deleteHintUsage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const hintUsage = await HintUsage.findById(id).select("userId");
    if (!hintUsage) {
      logger.warn(
        `Utilisation d'indice introuvable pour la suppression: ${id}`
      );
      throw new ApiError(404, "Enregistrement d'indice introuvable");
    }
    if (
      hintUsage.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn(
        `Utilisateur non autorisé ${req.user.id} pour la suppression de l'indice ${id}`
      );
      throw new ApiError(
        403,
        "Non autorisé à supprimer cet enregistrement d'indice"
      );
    }
    const result = await hintService.deleteHintUsage(id);
    res.status(result.statusCode).json(result);
  });

  addViewedStep = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { stepNumber } = req.body;
    const hintUsage = await HintUsage.findById(id).select("userId");
    if (!hintUsage) {
      logger.warn(
        `Utilisation d'indice introuvable pour l'ajout d'étape: ${id}`
      );
      throw new ApiError(404, "Enregistrement d'indice introuvable");
    }
    if (
      hintUsage.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn(
        `Utilisateur non autorisé ${req.user.id} pour l'ajout d'étape à l'indice ${id}`
      );
      throw new ApiError(
        403,
        "Non autorisé à ajouter une étape à cet enregistrement d'indice"
      );
    }
    const result = await hintService.addViewedStep(id, stepNumber);
    res.status(result.statusCode).json(result);
  });

  getHintUsageSummary = asyncHandler(async (req, res) => {
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      groupBy: req.query.groupBy || "day",
    };
    const result = await hintService.getHintUsageSummary(options);
    res.status(result.statusCode).json(result);
  });

  bulkDeleteHintUsages = asyncHandler(async (req, res) => {
    const { hintUsageIds } = req.body;
    const result = await hintService.bulkDeleteHintUsages(hintUsageIds);
    res.status(result.statusCode).json(result);
  });
}

module.exports = new HintController();