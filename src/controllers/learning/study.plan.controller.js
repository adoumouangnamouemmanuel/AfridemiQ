const { StatusCodes } = require("http-status-codes");
const studyPlanService = require("../../services/learning/studyPlan/study.plan.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("StudyPlanController");

const createStudyPlan = async (req, res) => {
  try {
    const studyPlan = await studyPlanService.createStudyPlan(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Plan d'étude créé avec succès",
      data: studyPlan,
    });
  } catch (error) {
    logger.error("Error creating study plan:", error);
    throw error;
  }
};

const getStudyPlanById = async (req, res) => {
  try {
    const studyPlan = await studyPlanService.getStudyPlanById(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Plan d'étude récupéré avec succès",
      data: studyPlan,
    });
  } catch (error) {
    logger.error("Error retrieving study plan:", error);
    throw error;
  }
};

const getStudyPlanByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const studyPlan = await studyPlanService.getStudyPlanByUserId(userId);
    
    if (!studyPlan) {
      return res.status(200).json({
        status: "success",
        message: "No study plan found for this user",
        data: null
      });
    }

    res.status(200).json({
      status: "success",
      data: studyPlan,
    });
  } catch (error) {
    logger.error("Error in getStudyPlanByUserId controller:", error);
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message,
      code: error.name,
    });
  }
};

const getStudyPlans = async (req, res) => {
  try {
    const result = await studyPlanService.getStudyPlans(req.query, req.query);
    res.status(StatusCodes.OK).json({
      message: "Plans d'étude récupérés avec succès",
      data: result.studyPlans,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error retrieving study plans:", error);
    throw error;
  }
};

const updateStudyPlan = async (req, res) => {
  try {
    const studyPlan = await studyPlanService.updateStudyPlan(
      req.params.id,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Plan d'étude mis à jour avec succès",
      data: studyPlan,
    });
  } catch (error) {
    logger.error("Error updating study plan:", error);
    throw error;
  }
};

const deleteStudyPlan = async (req, res) => {
  try {
    const result = await studyPlanService.deleteStudyPlan(req.params.id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    logger.error("Error deleting study plan:", error);
    throw error;
  }
};

module.exports = {
  createStudyPlan,
  getStudyPlanById,
  getStudyPlanByUserId,
  getStudyPlans,
  updateStudyPlan,
  deleteStudyPlan,
};