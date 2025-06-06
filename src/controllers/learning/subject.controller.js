const { StatusCodes } = require("http-status-codes");
const subjectService = require("../../services/learning/subject/subject.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("SubjectController");

// Create a new subject
const createSubject = async (req, res) => {
  try {
    const subject = await subjectService.createSubject(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Matière créée avec succès",
      data: subject,
    });
  } catch (error) {
    logger.error("Error in createSubject controller", error);
    throw error;
  }
};

// Get all subjects with advanced search
const getSubjects = async (req, res) => {
  try {
    const result = await subjectService.getSubjects(req.query);
    res.status(StatusCodes.OK).json({
      message: "Matières récupérées avec succès",
      data: result.subjects,
      pagination: result.pagination,
      debug: result.debug, // Include debug info temporarily
    });
  } catch (error) {
    logger.error("Error in getSubjects controller", error, {
      query: req.query,
    });
    throw error;
  }
};

// Debug endpoint to get all subjects without filters
const getAllSubjectsRaw = async (req, res) => {
  try {
    const subjects = await subjectService.getAllSubjectsRaw();
    res.status(StatusCodes.OK).json({
      message: "Raw subjects retrieved",
      data: subjects,
      count: subjects.length,
    });
  } catch (error) {
    logger.error("Error in getAllSubjectsRaw controller", error);
    throw error;
  }
};

// Get subject by ID
const getSubjectById = async (req, res) => {
  try {
    const result = await subjectService.getSubjectById(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Matière récupérée avec succès",
      data: result.subject,
    });
  } catch (error) {
    logger.error("Error in getSubjectById controller", error, {
      subjectId: req.params.id,
    });
    throw error;
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const subject = await subjectService.updateSubject(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      message: "Matière mise à jour avec succès",
      data: subject,
    });
  } catch (error) {
    logger.error("Error in updateSubject controller", error, {
      subjectId: req.params.id,
    });
    throw error;
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const result = await subjectService.deleteSubject(req.params.id);
    res.status(StatusCodes.OK).json({
      message: result.message,
    });
  } catch (error) {
    logger.error("Error in deleteSubject controller", error, {
      subjectId: req.params.id,
    });
    throw error;
  }
};

// Rate subject
const rateSubject = async (req, res) => {
  try {
    const { rating } = req.body;
    const subject = await subjectService.rateSubject(req.params.id, rating);
    res.status(StatusCodes.OK).json({
      message: "Note ajoutée avec succès",
      data: subject,
    });
  } catch (error) {
    logger.error("Error in rateSubject controller", error, {
      subjectId: req.params.id,
    });
    throw error;
  }
};

// Add exam to subject
const addExamToSubject = async (req, res) => {
  try {
    const subject = await subjectService.addExamToSubject(
      req.params.id,
      req.body.examId
    );
    res.status(StatusCodes.OK).json({
      message: "Examen ajouté à la matière avec succès",
      data: subject,
    });
  } catch (error) {
    logger.error("Error in addExamToSubject controller", error, {
      subjectId: req.params.id,
      examId: req.body.examId,
    });
    throw error;
  }
};

// Remove exam from subject
const removeExamFromSubject = async (req, res) => {
  try {
    const subject = await subjectService.removeExamFromSubject(
      req.params.id,
      req.params.examId
    );
    res.status(StatusCodes.OK).json({
      message: "Examen retiré de la matière avec succès",
      data: subject,
    });
  } catch (error) {
    logger.error("Error in removeExamFromSubject controller", error, {
      subjectId: req.params.id,
      examId: req.params.examId,
    });
    throw error;
  }
};

// Get subjects by series
const getSubjectsBySeries = async (req, res) => {
  try {
    const subjects = await subjectService.getSubjects({
      series: req.params.series,
    });
    res.status(StatusCodes.OK).json({
      message: "Matières récupérées par série avec succès",
      data: subjects.subjects,
      pagination: subjects.pagination,
    });
  } catch (error) {
    logger.error("Error in getSubjectsBySeries controller", error, {
      series: req.params.series,
    });
    throw error;
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getAllSubjectsRaw,
  getSubjectById,
  updateSubject,
  deleteSubject,
  rateSubject,
  addExamToSubject,
  removeExamFromSubject,
  getSubjectsBySeries,
};