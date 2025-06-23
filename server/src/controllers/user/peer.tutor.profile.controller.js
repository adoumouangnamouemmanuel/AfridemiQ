const { StatusCodes } = require("http-status-codes");
const peerTutorProfileService = require("../../services/user/peerTutorProfile/peer.tutor.profile.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");
const createLogger = require("../../services/logging.service");
const {
  PeerTutorProfile,
} = require("../../models/user/peer.tutor.profile.model");

const logger = createLogger("PeerTutorProfileController");

class PeerTutorProfileController {
  createProfile = asyncHandler(async (req, res) => {
    const profileData = { ...req.body, userId: req.user.id };
    const result = await peerTutorProfileService.createProfile(profileData);
    res.status(result.statusCode).json(result);
  });

  getProfileById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await peerTutorProfileService.getProfileById(id);
    res.status(result.statusCode).json(result);
  });

  getProfiles = asyncHandler(async (req, res) => {
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 20,
      subjectId: req.query.subjectId,
      topicId: req.query.topicId,
      series: req.query.series,
      isAvailable: req.query.isAvailable === "true",
      premiumOnly: req.query.premiumOnly === "true",
    };
    const result = await peerTutorProfileService.getProfiles(options);
    res.status(result.statusCode).json(result);
  });

  updateProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const profile = await PeerTutorProfile.findById(id).select("userId");
    if (!profile) {
      logger.warn(`Profil de tuteur introuvable pour la mise à jour: ${id}`);
      throw new ApiError(404, "Profil de tuteur introuvable");
    }
    if (
      profile.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn(
        `Utilisateur non autorisé ${req.user.id} pour la mise à jour du profil ${id}`
      );
      throw new ApiError(403, "Non autorisé à mettre à jour ce profil");
    }
    const result = await peerTutorProfileService.updateProfile(id, req.body);
    res.status(result.statusCode).json(result);
  });

  deleteProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const profile = await PeerTutorProfile.findById(id).select("userId");
    if (!profile) {
      logger.warn(`Profil de tuteur introuvable pour la suppression: ${id}`);
      throw new ApiError(404, "Profil de tuteur introuvable");
    }
    if (
      profile.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      logger.warn(
        `Utilisateur non autorisé ${req.user.id} pour la suppression du profil ${id}`
      );
      throw new ApiError(403, "Non autorisé à supprimer ce profil");
    }
    const result = await peerTutorProfileService.deleteProfile(id);
    res.status(result.statusCode).json(result);
  });

  addReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await peerTutorProfileService.addReview(
      id,
      req.body,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  });

  getMyProfile = asyncHandler(async (req, res) => {
    const profile = await PeerTutorProfile.findOne({ userId: req.user.id })
      .populate([
        { path: "userId", select: "name email" },
        { path: "subjects", select: "name" },
        { path: "topics", select: "name" },
        { path: "reviews.userId", select: "name" },
      ])
      .lean();
    if (!profile) {
      logger.warn(
        `Profil de tuteur introuvable pour l'utilisateur ${req.user.id}`
      );
      throw new ApiError(404, "Profil de tuteur introuvable");
    }
    return new ApiResponse(
      200,
      profile,
      "Profil de tuteur récupéré avec succès"
    );
  });
}

module.exports = new PeerTutorProfileController();