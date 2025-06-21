const quizService = require("../../services/assessment/quiz/quiz.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("QuizController");

// =============== CREATE QUIZ ===============
const createQuiz = async (req, res) => {
  logger.info("===================createQuiz=======================");

  try {
    const quiz = await quizService.createQuiz(req.body);

    logger.info("++++++✅ CREATE QUIZ: Quiz created successfully ++++++");
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Quiz créé avec succès",
      data: { quiz },
    });
  } catch (error) {
    logger.error("❌ CREATE QUIZ ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la création du quiz",
    });
  }
};

// =============== GET ALL QUIZZES ===============
const getQuizzes = async (req, res) => {
  logger.info("===================getQuizzes=======================");

  try {
    const result = await quizService.getQuizzes(req.query);

    logger.info("++++++✅ GET QUIZZES: Quizzes retrieved successfully ++++++");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Quizzes récupérés avec succès",
      data: result,
    });
  } catch (error) {
    logger.error("❌ GET QUIZZES ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des quizzes",
    });
  }
};

// =============== GET QUIZ BY ID ===============
const getQuizById = async (req, res) => {
  logger.info("===================getQuizById=======================");

  try {
    const quiz = await quizService.getQuizById(req.params.id);

    logger.info("++++++✅ GET QUIZ BY ID: Quiz retrieved successfully ++++++");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Quiz récupéré avec succès",
      data: { quiz },
    });
  } catch (error) {
    logger.error("❌ GET QUIZ BY ID ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération du quiz",
    });
  }
};

// =============== UPDATE QUIZ ===============
const updateQuiz = async (req, res) => {
  logger.info("===================updateQuiz=======================");

  try {
    const quiz = await quizService.updateQuiz(req.params.id, req.body);

    logger.info("++++++✅ UPDATE QUIZ: Quiz updated successfully ++++++");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Quiz mis à jour avec succès",
      data: { quiz },
    });
  } catch (error) {
    logger.error("❌ UPDATE QUIZ ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour du quiz",
    });
    }
};

// =============== DELETE QUIZ ===============
const deleteQuiz = async (req, res) => {
  logger.info("===================deleteQuiz=======================");

  try {
    await quizService.deleteQuiz(req.params.id);

    logger.info("++++++✅ DELETE QUIZ: Quiz deleted successfully ++++++");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Quiz supprimé avec succès",
    });
  } catch (error) {
    logger.error("❌ DELETE QUIZ ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la suppression du quiz",
    });
  }
};

// =============== GET POPULAR QUIZZES ===============
const getPopularQuizzes = async (req, res) => {
  logger.info("===================getPopularQuizzes=======================");

  try {
    const limit = parseInt(req.query.limit) || 10;
    const quizzes = await quizService.getPopularQuizzes(limit);

    logger.info(
      "++++++✅ GET POPULAR QUIZZES: Popular quizzes retrieved ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Quizzes populaires récupérés avec succès",
      data: { quizzes },
    });
  } catch (error) {
    logger.error("❌ GET POPULAR QUIZZES ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message:
        error.message ||
        "Erreur lors de la récupération des quizzes populaires",
    });
  }
};

// =============== GET QUIZZES BY SUBJECT ===============
const getQuizzesBySubject = async (req, res) => {
  logger.info("===================getQuizzesBySubject=======================");

  try {
    const { subjectId } = req.params;
    const filters = req.query;
    const quizzes = await quizService.getQuizzesBySubject(subjectId, filters);

    logger.info("++++++✅ GET QUIZZES BY SUBJECT: Quizzes retrieved ++++++");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Quizzes récupérés avec succès",
      data: { quizzes },
    });
  } catch (error) {
    logger.error("❌ GET QUIZZES BY SUBJECT ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des quizzes",
    });
  }
};

  // Check quiz eligibility
  checkQuizEligibility = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await quizService.canUserTakeQuiz(id, userId);
    res.status(result.statusCode).json(result);
  });

  // Get quiz statistics
  getQuizStatistics = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if user owns the quiz or is admin
    const quiz = await quizService.getQuizById(id);
    if (
      quiz.data.createdBy._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(403, "Not authorized to view quiz statistics");
    }

    const result = await quizService.getQuizStatistics(id);
    res.status(result.statusCode).json(result);
  });

  // Update quiz analytics
  updateQuizAnalytics = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if user owns the quiz or is admin
    const quiz = await quizService.getQuizById(id);
    if (
      quiz.data.createdBy._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new ApiError(403, "Not authorized to update quiz analytics");
    }

    const result = await quizService.updateQuizAnalytics(id);
    res.status(result.statusCode).json(result);
  });

  // Bulk update quizzes
  bulkUpdateQuizzes = asyncHandler(async (req, res) => {
    const { quizIds, updateData } = req.body;

    if (!Array.isArray(quizIds) || quizIds.length === 0) {
      throw new ApiError(400, "Quiz IDs array is required");
    }

    // Only admin can perform bulk operations
    if (req.user.role !== "admin") {
      throw new ApiError(
        403,
        "Only administrators can perform bulk operations"
      );
    }

    const result = await quizService.bulkUpdateQuizzes(quizIds, updateData);
    res.status(result.statusCode).json(result);
  });

  // Get my quizzes (created by current user)
  getMyQuizzes = asyncHandler(async (req, res) => {
    const filters = { createdBy: req.user.id };
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      search: req.query.search,
      level: req.query.level,
      difficulty: req.query.difficulty,
    };

    const result = await quizService.getAllQuizzes(filters, options);
    res.status(result.statusCode).json(result);
  });
}

module.exports = new QuizController();
