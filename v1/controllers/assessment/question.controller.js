const { StatusCodes } = require("http-status-codes");
const questionService = require("../../services/assessment/question/question.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("QuestionController");

// =============== CREATE QUESTION ===============
const createQuestion = async (req, res) => {
  logger.info("===================createQuestion=======================");

  try {
    const question = await questionService.createQuestion(req.body);

    logger.info(
      "++++++✅ CREATE QUESTION: Question created successfully ++++++"
    );
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Question créée avec succès",
      data: { question },
    });
  } catch (error) {
    logger.error("❌ CREATE QUESTION ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la création de la question",
    });
  }
};

// =============== GET ALL QUESTIONS ===============
const getQuestions = async (req, res) => {
  logger.info("===================getQuestions=======================");

  try {
    const result = await questionService.getQuestions(req.query);

    logger.info(
      "++++++✅ GET QUESTIONS: Questions retrieved successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Questions récupérées avec succès",
      data: result,
    });
  } catch (error) {
    logger.error("❌ GET QUESTIONS ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des questions",
    });
  }
};

// =============== GET QUESTION BY ID ===============
const getQuestionById = async (req, res) => {
  logger.info("===================getQuestionById=======================");

  try {
    const question = await questionService.getQuestionById(req.params.id);

    logger.info(
      "++++++✅ GET QUESTION BY ID: Question retrieved successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Question récupérée avec succès",
      data: { question },
    });
  } catch (error) {
    logger.error("❌ GET QUESTION BY ID ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération de la question",
    });
  }
};

// =============== UPDATE QUESTION ===============
const updateQuestion = async (req, res) => {
  logger.info("===================updateQuestion=======================");

  try {
    const question = await questionService.updateQuestion(
      req.params.id,
      req.body
    );

    logger.info(
      "++++++✅ UPDATE QUESTION: Question updated successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Question mise à jour avec succès",
      data: { question },
    });
  } catch (error) {
    logger.error("❌ UPDATE QUESTION ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la mise à jour de la question",
    });
  }
};

// =============== DELETE QUESTION ===============
const deleteQuestion = async (req, res) => {
  logger.info("===================deleteQuestion=======================");

  try {
    await questionService.deleteQuestion(req.params.id);

    logger.info(
      "++++++✅ DELETE QUESTION: Question deleted successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Question supprimée avec succès",
    });
  } catch (error) {
    logger.error("❌ DELETE QUESTION ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la suppression de la question",
    });
  }
};

// =============== GET QUESTIONS BY SUBJECT ===============
const getQuestionsBySubject = async (req, res) => {
  logger.info(
    "===================getQuestionsBySubject======================="
  );

  try {
    const { subjectId } = req.params;
    const filters = req.query;
    const questions = await questionService.getQuestionsBySubject(
      subjectId,
      filters
    );

    logger.info(
      "++++++✅ GET QUESTIONS BY SUBJECT: Questions retrieved ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Questions récupérées avec succès",
      data: { questions },
    });
  } catch (error) {
    logger.error("❌ GET QUESTIONS BY SUBJECT ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des questions",
    });
  }
};

// =============== GET QUESTIONS BY TOPIC ===============
const getQuestionsByTopic = async (req, res) => {
  logger.info("===================getQuestionsByTopic=======================");

  try {
    const { topicId } = req.params;
    const filters = req.query;
    const questions = await questionService.getQuestionsByTopic(
      topicId,
      filters
    );

    logger.info("++++++✅ GET QUESTIONS BY TOPIC: Questions retrieved ++++++");
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Questions récupérées avec succès",
      data: { questions },
    });
  } catch (error) {
    logger.error("❌ GET QUESTIONS BY TOPIC ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des questions",
    });
  }
};

// =============== GET RANDOM QUESTIONS ===============
const getRandomQuestions = async (req, res) => {
  logger.info("===================getRandomQuestions=======================");

  try {
    const { count = 10 } = req.query;
    const filters = req.query;
    const questions = await questionService.getRandomQuestions(
      parseInt(count),
      filters
    );

    logger.info(
      "++++++✅ GET RANDOM QUESTIONS: Random questions retrieved ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Questions aléatoires récupérées avec succès",
      data: { questions },
    });
  } catch (error) {
    logger.error("❌ GET RANDOM QUESTIONS ERROR:", error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Erreur lors de la récupération des questions",
    });
  }
};

// =============== SEARCH QUESTIONS ===============
const searchQuestions = async (req, res) => {
  logger.info("===================searchQuestions=======================");

  try {
    const { q: searchTerm } = req.query;
    const filters = req.query;
    const questions = await questionService.searchQuestions(
      searchTerm,
      filters
    );

    logger.info(
      "++++++✅ SEARCH QUESTIONS: Search completed successfully ++++++"
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Recherche effectuée avec succès",
      data: { questions },
    });
  } catch (error) {
    logger.error("Error deleting question:", error);
    throw error;
  }
};

const verifyQuestion = async (req, res) => {
  try {
    const { verifierId, qualityScore, feedback } = req.body;
    const question = await questionService.verifyQuestion(
      req.params.id,
      verifierId,
      qualityScore,
      feedback
    );
    res.status(StatusCodes.OK).json({
      message: "Question vérifiée avec succès",
      data: question,
    });
  } catch (error) {
    logger.error("Error verifying question:", error);
    throw error;
  }
};

module.exports = {
  createQuestion,
  getQuestionById,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  verifyQuestion,
};
