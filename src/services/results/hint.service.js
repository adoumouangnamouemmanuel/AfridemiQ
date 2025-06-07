const { HintUsage } = require("../../models/results/hint.model");
const { Question } = require("../../models/assessment/question.model");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const createLogger = require("../../services/logging.service");

const logger = createLogger("HintService");

class HintService {
  async recordHintUsage(hintData) {
    try {
      const question = await Question.findById(hintData.questionId);
      if (!question) {
        logger.warn(
          `Question introuvable pour l'utilisation d'indice: ${hintData.questionId}`
        );
        throw new ApiError(404, "Question introuvable");
      }

      let hintUsage = await HintUsage.findOne({
        userId: hintData.userId,
        questionId: hintData.questionId,
        sessionId: hintData.sessionId,
      });

      if (hintUsage) {
        if (hintData.stepNumber !== undefined) {
          hintUsage.addViewedStep(hintData.stepNumber);
        }
        if (hintData.timeSpentOnHint) {
          hintUsage.timeSpentOnHint += hintData.timeSpentOnHint;
        }
        if (hintData.pointsDeducted) {
          hintUsage.pointsDeducted += hintData.pointsDeducted;
        }
        logger.info(
          `Mise à jour de l'utilisation d'indice pour l'utilisateur ${hintData.userId} et la question ${hintData.questionId}`
        );
      } else {
        hintUsage = new HintUsage({
          ...hintData,
          totalStepsAvailable: question.steps ? question.steps.length : 1,
          stepsViewed:
            hintData.stepNumber !== undefined ? [hintData.stepNumber] : [],
          context: {
            ...hintData.context,
            difficulty: question.difficulty,
          },
        });
        logger.info(
          `Création d'une nouvelle utilisation d'indice pour l'utilisateur ${hintData.userId} et la question ${hintData.questionId}`
        );
      }

      await hintUsage.save();
      await hintUsage.populate([
        { path: "questionId", select: "question difficulty points" },
        { path: "userId", select: "name email" },
        { path: "quizId", select: "title" },
      ]);

      return new ApiResponse(
        201,
        hintUsage,
        "Utilisation d'indice enregistrée avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de l'enregistrement de l'utilisation d'indice pour l'utilisateur ${hintData.userId}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      if (error.name === "ValidationError") {
        throw new ApiError(
          400,
          "Validation échouée",
          Object.values(error.errors).map((e) => e.message)
        );
      }
      throw new ApiError(
        500,
        "Échec de l'enregistrement de l'utilisation d'indice",
        error.message
      );
    }
  }

  async getHintUsageById(id) {
    try {
      const hintUsage = await HintUsage.findById(id)
        .populate([
          { path: "questionId", select: "question difficulty points steps" },
          { path: "userId", select: "name email" },
          { path: "quizId", select: "title" },
        ])
        .lean();
      if (!hintUsage) {
        logger.warn(`Utilisation d'indice introuvable: ${id}`);
        throw new ApiError(404, "Enregistrement d'indice introuvable");
      }
      logger.info(`Récupération de l'utilisation d'indice: ${id}`);
      return new ApiResponse(
        200,
        hintUsage,
        "Utilisation d'indice récupérée avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la récupération de l'utilisation d'indice ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la récupération de l'utilisation d'indice",
        error.message
      );
    }
  }

  async getUserHintUsage(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        questionId,
        quizId,
        startDate,
        endDate,
        hintType,
      } = options;
      const query = { userId };
      if (questionId) query.questionId = questionId;
      if (quizId) query.quizId = quizId;
      if (hintType) query.hintType = hintType;
      if (startDate || endDate) {
        query.usedAt = {};
        if (startDate) query.usedAt.$gte = new Date(startDate);
        if (endDate) query.usedAt.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;
      const [hintUsages, total] = await Promise.all([
        HintUsage.find(query)
          .populate([
            { path: "questionId", select: "question difficulty points" },
            { path: "quizId", select: "title" },
          ])
          .sort({ usedAt: -1 })
          .skip(skip)
          .limit(Number.parseInt(limit))
          .lean(),
        HintUsage.countDocuments(query),
      ]);

      logger.info(
        `Récupération de ${hintUsages.length} utilisations d'indice pour l'utilisateur ${userId}`
      );
      return new ApiResponse(
        200,
        {
          hintUsages,
          pagination: {
            currentPage: Number.parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: Number.parseInt(limit),
          },
        },
        "Historique des utilisations d'indice récupéré avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la récupération de l'historique des utilisations d'indice pour l'utilisateur ${userId}:`,
        error
      );
      throw new ApiError(
        500,
        "Échec de la récupération de l'historique des utilisations d'indice",
        error.message
      );
    }
  }

  async getQuestionHintStats(questionId) {
    try {
      const question = await Question.findById(questionId);
      if (!question) {
        logger.warn(
          `Question introuvable pour les statistiques d'indice: ${questionId}`
        );
        throw new ApiError(404, "Question introuvable");
      }

      const stats = await HintUsage.getQuestionHintStats(questionId);
      const result =
        stats.length > 0
          ? stats[0]
          : {
              totalUsages: 0,
              uniqueUsers: 0,
              averageStepsViewed: 0,
              averageTimeSpent: 0,
              totalPointsDeducted: 0,
            };

      const hintUsages = await HintUsage.find({ questionId }).lean();
      const hintTypeDistribution = hintUsages.reduce((acc, usage) => {
        acc[usage.hintType] = (acc[usage.hintType] || 0) + 1;
        return acc;
      }, {});
      const stepUsageDistribution = hintUsages.reduce((acc, usage) => {
        usage.stepsViewed.forEach((step) => {
          acc[step] = (acc[step] || 0) + 1;
        });
        return acc;
      }, {});

      logger.info(
        `Récupération des statistiques d'indice pour la question ${questionId}`
      );
      return new ApiResponse(
        200,
        {
          ...result,
          hintTypeDistribution,
          stepUsageDistribution,
          question: {
            id: question._id,
            question: question.question,
            difficulty: question.difficulty,
            totalSteps: question.steps ? question.steps.length : 0,
          },
        },
        "Statistiques d'indice de question récupérées avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la récupération des statistiques d'indice pour la question ${questionId}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la récupération des statistiques d'indice de question",
        error.message
      );
    }
  }

  async getUserHintAnalytics(userId) {
    try {
      const hintUsages = await HintUsage.find({ userId })
        .populate("questionId", "difficulty")
        .lean();

      if (hintUsages.length === 0) {
        logger.info(
          `Aucune utilisation d'indice trouvée pour l'utilisateur ${userId}`
        );
        return new ApiResponse(
          200,
          {
            totalHintsUsed: 0,
            averageStepsPerHint: 0,
            totalTimeSpent: 0,
            totalPointsDeducted: 0,
            hintsByDifficulty: {},
            hintsByType: {},
            hintTrends: [],
          },
          "Aucune utilisation d'indice trouvée pour l'utilisateur"
        );
      }

      const analytics = {
        totalHintsUsed: hintUsages.length,
        averageStepsPerHint:
          Math.round(
            (hintUsages.reduce(
              (sum, usage) => sum + usage.stepsViewed.length,
              0
            ) /
              hintUsages.length) *
              100
          ) / 100,
        totalTimeSpent: hintUsages.reduce(
          (sum, usage) => sum + usage.timeSpentOnHint,
          0
        ),
        totalPointsDeducted: hintUsages.reduce(
          (sum, usage) => sum + usage.pointsDeducted,
          0
        ),
        hintsByDifficulty: hintUsages.reduce((acc, usage) => {
          const difficulty = usage.questionId?.difficulty || "Inconnu";
          acc[difficulty] = (acc[difficulty] || 0) + 1;
          return acc;
        }, {}),
        hintsByType: hintUsages.reduce((acc, usage) => {
          acc[usage.hintType] = (acc[usage.hintType] || 0) + 1;
          return acc;
        }, {}),
        hintTrends: this.calculateHintTrends(hintUsages, 6),
      };

      logger.info(
        `Récupération des analyses d'indice pour l'utilisateur ${userId}`
      );
      return new ApiResponse(
        200,
        analytics,
        "Analyses d'indice de l'utilisateur récupérées avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la récupération des analyses d'indice pour l'utilisateur ${userId}:`,
        error
      );
      throw new ApiError(
        500,
        "Échec de la récupération des analyses d'indice de l'utilisateur",
        error.message
      );
    }
  }

  async getQuestionsNeedingBetterHints() {
    try {
      const questions = await HintUsage.findQuestionsNeedingBetterHints();
      const populatedQuestions = await Question.populate(questions, {
        path: "_id",
        select: "question difficulty points steps",
      });

      logger.info(
        `Trouvé ${populatedQuestions.length} questions nécessitant de meilleurs indices`
      );
      return new ApiResponse(
        200,
        populatedQuestions,
        "Questions nécessitant de meilleurs indices récupérées avec succès"
      );
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des questions nécessitant de meilleurs indices:",
        error
      );
      throw new ApiError(
        500,
        "Échec de la récupération des questions nécessitant de meilleurs indices",
        error.message
      );
    }
  }

  async updateHintUsage(id, data) {
    try {
      const hintUsage = await HintUsage.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate([
          { path: "questionId", select: "question difficulty points" },
          { path: "userId", select: "name email" },
          { path: "quizId", select: "title" },
        ])
        .lean();
      if (!hintUsage) {
        logger.warn(
          `Utilisation d'indice introuvable pour la mise à jour: ${id}`
        );
        throw new ApiError(404, "Enregistrement d'indice introuvable");
      }
      logger.info(`Mise à jour de l'utilisation d'indice: ${id}`);
      return new ApiResponse(
        200,
        hintUsage,
        "Utilisation d'indice mise à jour avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la mise à jour de l'utilisation d'indice ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      if (error.name === "ValidationError") {
        throw new ApiError(
          400,
          "Validation échouée",
          Object.values(error.errors).map((e) => e.message)
        );
      }
      throw new ApiError(
        500,
        "Échec de la mise à jour de l'utilisation d'indice",
        error.message
      );
    }
  }

  async deleteHintUsage(id) {
    try {
      const hintUsage = await HintUsage.findByIdAndDelete(id);
      if (!hintUsage) {
        logger.warn(
          `Utilisation d'indice introuvable pour la suppression: ${id}`
        );
        throw new ApiError(404, "Enregistrement d'indice introuvable");
      }
      logger.info(`Suppression de l'utilisation d'indice: ${id}`);
      return new ApiResponse(
        200,
        null,
        "Enregistrement de l'utilisation d'indice supprimé avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la suppression de l'utilisation d'indice ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la suppression de l'enregistrement de l'utilisation d'indice",
        error.message
      );
    }
  }

  async addViewedStep(id, stepNumber) {
    try {
      const hintUsage = await HintUsage.findById(id);
      if (!hintUsage) {
        logger.warn(
          `Utilisation d'indice introuvable pour l'ajout d'étape: ${id}`
        );
        throw new ApiError(404, "Enregistrement d'indice introuvable");
      }
      hintUsage.addViewedStep(stepNumber);
      await hintUsage.save();
      await hintUsage.populate([
        { path: "questionId", select: "question difficulty points" },
        { path: "userId", select: "name email" },
        { path: "quizId", select: "title" },
      ]);
      logger.info(
        `Ajout de l'étape ${stepNumber} à l'utilisation d'indice ${id}`
      );
      return new ApiResponse(200, hintUsage, "Étape ajoutée avec succès");
    } catch (error) {
      logger.error(
        `Erreur lors de l'ajout d'une étape à l'indice ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "Échec de l'ajout de l'étape", error.message);
    }
  }

  async getHintUsageSummary(options = {}) {
    try {
      const { startDate, endDate, groupBy = "day" } = options;
      const matchStage = {};
      if (startDate || endDate) {
        matchStage.usedAt = {};
        if (startDate) matchStage.usedAt.$gte = new Date(startDate);
        if (endDate) matchStage.usedAt.$lte = new Date(endDate);
      }

      const groupFormat = {
        day: { $dateToString: { format: "%Y-%m-%d", date: "$usedAt" } },
        week: { $dateToString: { format: "%Y-W%U", date: "$usedAt" } },
        month: { $dateToString: { format: "%Y-%m", date: "$usedAt" } },
      };

      const summary = await HintUsage.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: groupFormat[groupBy],
            totalHints: { $sum: 1 },
            uniqueUsers: { $addToSet: "$userId" },
            uniqueQuestions: { $addToSet: "$questionId" },
            totalTimeSpent: { $sum: "$timeSpentOnHint" },
            totalPointsDeducted: { $sum: "$pointsDeducted" },
            averageStepsViewed: { $avg: { $size: "$stepsViewed" } },
          },
        },
        {
          $project: {
            _id: 1,
            totalHints: 1,
            uniqueUsers: { $size: "$uniqueUsers" },
            uniqueQuestions: { $size: "$uniqueQuestions" },
            totalTimeSpent: 1,
            totalPointsDeducted: 1,
            averageStepsViewed: { $round: ["$averageStepsViewed", 2] },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      logger.info(
        `Récupération du résumé d'utilisation d'indice avec ${summary.length} enregistrements`
      );
      return new ApiResponse(
        200,
        summary,
        "Résumé de l'utilisation d'indice récupéré avec succès"
      );
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération du résumé d'utilisation d'indice:",
        error
      );
      throw new ApiError(
        500,
        "Échec de la récupération du résumé",
        error.message
      );
    }
  }

  async bulkDeleteHintUsages(hintUsageIds = []) {
    try {
      const result = await HintUsage.deleteMany({
        _id: { $in: hintUsageIds },
      });

      logger.info(
        `Suppression en masse de ${result.deletedCount} utilisations d'indice`
      );
      return new ApiResponse(
        200,
        { deletedCount: result.deletedCount },
        "Suppression en masse terminée avec succès"
      );
    } catch (error) {
      logger.error(
        "Erreur lors de la suppression en masse des utilisations d'indice:",
        error
      );
      throw new ApiError(
        500,
        "Échec de la suppression en masse des utilisations d'indice",
        error.message
      );
    }
  }

  calculateHintTrends(hintUsages, months = 6) {
    const trends = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthUsages = hintUsages.filter(
        (usage) => usage && usage.usedAt >= date && usage.usedAt < nextDate
      );

      trends.push({
        month: date.toISOString().substring(0, 7), // YYYY-MM
        count: monthUsages.length,
        totalTimeSpent: monthUsages.reduce(
          (sum, usage) => sum + usage.timeSpentOnHint,
          0
        ),
        averageStepsViewed:
          monthUsages.length > 0
            ? Math.round(
                (monthUsages.reduce(
                  (sum, usage) => sum + usage.stepsViewed.length,
                  0
                ) /
                  monthUsages.length) *
                  100
              ) / 100
            : 0,
      });
    }

    return trends;
  }
}

module.exports = new HintService();