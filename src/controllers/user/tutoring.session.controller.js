const { StatusCodes } = require("http-status-codes");
const tutoringSessionService = require("../../services/user/tutoringSession/tutoring.session.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");
const createLogger = require("../../services/logging.service");
const { TutoringSession } = require("../../models/user/tutoring.session.model");

const logger = createLogger("TutoringSessionController");

class TutoringSessionController {
  createSession = asyncHandler(async (req, res) => {
    const sessionData = req.body;
    const result = await tutoringSessionService.createSession(
      sessionData,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  });

  getSessionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await TutoringSession.findById(id).select(
      "tutorId studentId"
    );
    if (!session) {
      logger.warn(`Session de tutorat introuvable: ${id}`);
      throw new ApiError(404, "Session de tutorat introuvable");
    }
    const tutor = await PeerTutorProfile.findById(session.tutorId).select(
      "userId"
    );
    if (
      session.studentId.toString() !== req.user.id &&
      tutor.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn(
        `Utilisateur non autorisé ${req.user.id} pour accéder à la session ${id}`
      );
      throw new ApiError(403, "Non autorisé à accéder à cette session");
    }
    const result = await tutoringSessionService.getSessionById(id);
    res.status(result.statusCode).json(result);
  });

  getSessions = asyncHandler(async (req, res) => {
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 20,
      tutorId: req.query.tutorId,
      studentId: req.query.studentId,
      subjectId: req.query.subjectId,
      topicId: req.query.topicId,
      series: req.query.series,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    if (!req.user.role === "admin") {
      options.studentId = req.user.id;
      options.tutorId = (
        await PeerTutorProfile.findOne({ userId: req.user.id }).select("_id")
      )?._id;
    }
    const result = await tutoringSessionService.getSessions(options);
    res.status(result.statusCode).json(result);
  });

  getMySessions = asyncHandler(async (req, res) => {
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 20,
      subjectId: req.query.subjectId,
      topicId: req.query.topicId,
      series: req.query.series,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    const tutorProfile = await PeerTutorProfile.findOne({
      userId: req.user.id,
    }).select("_id");
    if (tutorProfile) {
      options.tutorId = tutorProfile._id;
    } else {
      options.studentId = req.user.id;
    }
    const result = await tutoringSessionService.getSessions(options);
    res.status(result.statusCode).json(result);
  });

  updateSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await TutoringSession.findById(id).select(
      "tutorId studentId"
    );
    if (!session) {
      logger.warn(`Session de tutorat introuvable pour la mise à jour: ${id}`);
      throw new ApiError(404, "Session de tutorat introuvable");
    }
    const tutor = await PeerTutorProfile.findById(session.tutorId).select(
      "userId"
    );
    if (
      session.studentId.toString() !== req.user.id &&
      tutor.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn(
        `Utilisateur non autorisé ${req.user.id} pour la mise à jour de la session ${id}`
      );
      throw new ApiError(403, "Non autorisé à mettre à jour cette session");
    }
    const result = await tutoringSessionService.updateSession(id, req.body);
    res.status(result.statusCode).json(result);
  });

  cancelSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const session = await TutoringSession.findById(id).select(
      "tutorId studentId"
    );
    if (!session) {
      logger.warn(`Session de tutorat introuvable pour l'annulation: ${id}`);
      throw new ApiError(404, "Session de tutorat introuvable");
    }
    const tutor = await PeerTutorProfile.findById(session.tutorId).select(
      "userId"
    );
    if (
      session.studentId.toString() !== req.user.id &&
      tutor.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn(
        `Utilisateur non autorisé ${req.user.id} pour l'annulation de la session ${id}`
      );
      throw new ApiError(403, "Non autorisé à annuler cette session");
    }
    const result = await tutoringSessionService.cancelSession(id);
    res.status(result.statusCode).json(result);
  });
}

module.exports = new TutoringSessionController();