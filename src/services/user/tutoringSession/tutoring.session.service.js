const { TutoringSession } = require("../../../models/user/tutoring.session.model");
const {
  PeerTutorProfile,
} = require("../../../models/user/peer.tutor.profile.model");
const { ApiError } = require("../../../utils/ApiError");
const { ApiResponse } = require("../../../utils/ApiResponse");
const createLogger = require("../../services/logging.service");

const logger = createLogger("TutoringSessionService");

class TutoringSessionService {
  // Create a new tutoring session
  async createSession(sessionData, studentId) {
    try {
      const tutorProfile = await PeerTutorProfile.findById(sessionData.tutorId);
      if (!tutorProfile) {
        logger.warn(`Profil de tuteur introuvable: ${sessionData.tutorId}`);
        throw new ApiError(404, "Tuteur introuvable");
      }
      if (!tutorProfile.isAvailable) {
        logger.warn(`Tuteur non disponible: ${sessionData.tutorId}`);
        throw new ApiError(400, "Tuteur non disponible");
      }
      if (!tutorProfile.subjects.includes(sessionData.subjectId)) {
        logger.warn(
          `Matière non enseignée par le tuteur ${sessionData.tutorId}`
        );
        throw new ApiError(400, "Matière non enseignée par ce tuteur");
      }

      // Check for conflicting sessions
      const conflictingSession = await TutoringSession.findOne({
        tutorId: sessionData.tutorId,
        scheduledAt: sessionData.scheduledAt,
        status: "scheduled",
      });
      if (conflictingSession) {
        logger.warn(
          `Conflit de session pour le tuteur ${sessionData.tutorId} à ${sessionData.scheduledAt}`
        );
        throw new ApiError(409, "Conflit de session pour le tuteur");
      }

      const session = new TutoringSession({
        ...sessionData,
        studentId,
        status: "scheduled",
      });
      await session.save();
      await session.populate([
        { path: "tutorId", select: "userId subjects" },
        { path: "studentId", select: "name email" },
        { path: "subjectId", select: "name" },
        { path: "topicId", select: "name" },
      ]);

      logger.info(
        `Session de tutorat créée pour l'étudiant ${studentId} avec le tuteur ${sessionData.tutorId}`
      );
      return new ApiResponse(
        201,
        session,
        "Session de tutorat créée avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la création de la session pour l'étudiant ${studentId}:`,
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
        "Échec de la création de la session de tutorat",
        error.message
      );
    }
  }

  // Get session by ID
  async getSessionById(id) {
    try {
      const session = await TutoringSession.findById(id)
        .populate([
          { path: "tutorId", select: "userId subjects" },
          { path: "studentId", select: "name email" },
          { path: "subjectId", select: "name" },
          { path: "topicId", select: "name" },
        ])
        .lean();
      if (!session) {
        logger.warn(`Session de tutorat introuvable: ${id}`);
        throw new ApiError(404, "Session de tutorat introuvable");
      }
      logger.info(`Récupération de la session de tutorat: ${id}`);
      return new ApiResponse(
        200,
        session,
        "Session de tutorat récupérée avec succès"
      );
    } catch (error) {
      logger.error(
        `Erreur lors de la récupération de la session ${id}:`,
        error
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la récupération de la session de tutorat",
        error.message
      );
    }
  }

  // Get sessions with filters
  async getSessions(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        tutorId,
        studentId,
        subjectId,
        topicId,
        series,
        status,
        startDate,
        endDate,
      } = options;
      const query = {};
      if (tutorId) query.tutorId = tutorId;
      if (studentId) query.studentId = studentId;
      if (subjectId) query.subjectId = subjectId;
      if (topicId) query.topicId = topicId;
      if (series) query.series = series;
      if (status) query.status = status;
      if (startDate || endDate) {
        query.scheduledAt = {};
        if (startDate) query.scheduledAt.$gte = new Date(startDate);
        if (endDate) query.scheduledAt.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;
      const [sessions, total] = await Promise.all([
        TutoringSession.find(query)
          .populate([
            { path: "tutorId", select: "userId subjects" },
            { path: "studentId", select: "name email" },
            { path: "subjectId", select: "name" },
            { path: "topicId", select: "name" },
          ])
          .sort({ scheduledAt: -1 })
          .skip(skip)
          .limit(Number.parseInt(limit))
          .lean(),
        TutoringSession.countDocuments(query),
      ]);

      logger.info(`Récupération de ${sessions.length} sessions de tutorat`);
      return new ApiResponse(
        200,
        {
          sessions,
          pagination: {
            currentPage: Number.parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: Number.parseInt(limit),
          },
        },
        "Sessions de tutorat récupérées avec succès"
      );
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des sessions de tutorat:",
        error
      );
      throw new ApiError(
        500,
        "Échec de la récupération des sessions de tutorat",
        error.message
      );
    }
  }

  // Update session
  async updateSession(id, data) {
    try {
      const session = await TutoringSession.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate([
          { path: "tutorId", select: "userId subjects" },
          { path: "studentId", select: "name email" },
          { path: "subjectId", select: "name" },
          { path: "topicId", select: "name" },
        ])
        .lean();
      if (!session) {
        logger.warn(
          `Session de tutorat introuvable pour la mise à jour: ${id}`
        );
        throw new ApiError(404, "Session de tutorat introuvable");
      }
      logger.info(`Mise à jour de la session de tutorat: ${id}`);
      return new ApiResponse(
        200,
        session,
        "Session de tutorat mise à jour avec succès"
      );
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de la session ${id}:`, error);
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
        "Échec de la mise à jour de la session de tutorat",
        error.message
      );
    }
  }

  // Cancel session
  async cancelSession(id) {
    try {
      const session = await TutoringSession.findByIdAndUpdate(
        id,
        { status: "cancelled" },
        { new: true, runValidators: true }
      )
        .populate([
          { path: "tutorId", select: "userId subjects" },
          { path: "studentId", select: "name email" },
          { path: "subjectId", select: "name" },
          { path: "topicId", select: "name" },
        ])
        .lean();
      if (!session) {
        logger.warn(`Session de tutorat introuvable pour l'annulation: ${id}`);
        throw new ApiError(404, "Session de tutorat introuvable");
      }
      logger.info(`Annulation de la session de tutorat: ${id}`);
      return new ApiResponse(
        200,
        session,
        "Session de tutorat annulée avec succès"
      );
    } catch (error) {
      logger.error(`Erreur lors de l'annulation de la session ${id}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de l'annulation de la session de tutorat",
        error.message
      );
    }
  }
}

module.exports = new TutoringSessionService();