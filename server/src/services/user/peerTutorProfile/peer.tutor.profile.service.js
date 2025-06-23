const {
  PeerTutorProfile,
} = require("../../../models/user/peer.tutor.profile.model");
const { ApiError } = require("../../../utils/ApiError");
const { ApiResponse } = require("../../../utils/ApiResponse");
const createLogger = require("../../../services/logging.service");

const logger = createLogger("PeerTutorProfileService");

class PeerTutorProfileService {
  // Create a new peer tutor profile
  async createProfile(profileData) {
    try {
      const existingProfile = await PeerTutorProfile.findOne({
        userId: profileData.userId,
      });
      if (existingProfile) {
        logger.warn(
          `Profil de tuteur déjà existant pour l'utilisateur ${profileData.userId}`
        );
        throw new ApiError(409, "Profil de tuteur déjà existant");
      }

      const profile = new PeerTutorProfile(profileData);
      await profile.save();
      await profile.populate([
        { path: "userId", select: "name email" },
        { path: "subjects", select: "name" },
        { path: "topics", select: "name" },
      ]);

      logger.info(
        `Profil de tuteur créé pour l'utilisateur ${profileData.userId}`
      );
      return new ApiResponse(201, profile, "Profil de tuteur créé avec succès");
    } catch (error) {
      logger.error(
        `Erreur lors de la création du profil pour l'utilisateur ${profileData.userId}:`,
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
        "Échec de la création du profil de tuteur",
        error.message
      );
    }
  }

  // Get profile by ID
  async getProfileById(id) {
    try {
      const profile = await PeerTutorProfile.findById(id)
        .populate([
          { path: "userId", select: "name email" },
          { path: "subjects", select: "name" },
          { path: "topics", select: "name" },
          { path: "reviews.userId", select: "name" },
        ])
        .lean();
      if (!profile) {
        logger.warn(`Profil de tuteur introuvable: ${id}`);
        throw new ApiError(404, "Profil de tuteur introuvable");
      }
      logger.info(`Récupération du profil de tuteur: ${id}`);
      return new ApiResponse(
        200,
        profile,
        "Profil de tuteur récupéré avec succès"
      );
    } catch (error) {
      logger.error(`Erreur lors de la récupération du profil ${id}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la récupération du profil de tuteur",
        error.message
      );
    }
  }

  // Get profiles with filters
  async getProfiles(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        subjectId,
        topicId,
        series,
        isAvailable,
        premiumOnly,
      } = options;
      const query = {};
      if (subjectId) query.subjects = subjectId;
      if (topicId) query.topics = topicId;
      if (series) query.series = series;
      if (isAvailable !== undefined) query.isAvailable = isAvailable;
      if (premiumOnly !== undefined) query.premiumOnly = premiumOnly;

      const skip = (page - 1) * limit;
      const [profiles, total] = await Promise.all([
        PeerTutorProfile.find(query)
          .populate([
            { path: "userId", select: "name email" },
            { path: "subjects", select: "name" },
            { path: "topics", select: "name" },
          ])
          .sort({ rating: -1, createdAt: -1 })
          .skip(skip)
          .limit(Number.parseInt(limit))
          .lean(),
        PeerTutorProfile.countDocuments(query),
      ]);

      logger.info(`Récupération de ${profiles.length} profils de tuteurs`);
      return new ApiResponse(
        200,
        {
          profiles,
          pagination: {
            currentPage: Number.parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: Number.parseInt(limit),
          },
        },
        "Profils de tuteurs récupérés avec succès"
      );
    } catch (error) {
      logger.error(
        "Erreur lors de la récupération des profils de tuteurs:",
        error
      );
      throw new ApiError(
        500,
        "Échec de la récupération des profils de tuteurs",
        error.message
      );
    }
  }

  // Update profile
  async updateProfile(id, data) {
    try {
      const profile = await PeerTutorProfile.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate([
          { path: "userId", select: "name email" },
          { path: "subjects", select: "name" },
          { path: "topics", select: "name" },
        ])
        .lean();
      if (!profile) {
        logger.warn(`Profil de tuteur introuvable pour la mise à jour: ${id}`);
        throw new ApiError(404, "Profil de tuteur introuvable");
      }
      logger.info(`Mise à jour du profil de tuteur: ${id}`);
      return new ApiResponse(
        200,
        profile,
        "Profil de tuteur mis à jour avec succès"
      );
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour du profil ${id}:`, error);
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
        "Échec de la mise à jour du profil de tuteur",
        error.message
      );
    }
  }

  // Delete profile
  async deleteProfile(id) {
    try {
      const profile = await PeerTutorProfile.findByIdAndDelete(id);
      if (!profile) {
        logger.warn(`Profil de tuteur introuvable pour la suppression: ${id}`);
        throw new ApiError(404, "Profil de tuteur introuvable");
      }
      logger.info(`Suppression du profil de tuteur: ${id}`);
      return new ApiResponse(
        200,
        null,
        "Profil de tuteur supprimé avec succès"
      );
    } catch (error) {
      logger.error(`Erreur lors de la suppression du profil ${id}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Échec de la suppression du profil de tuteur",
        error.message
      );
    }
  }

  // Add review to profile
  async addReview(id, reviewData, userId) {
    try {
      const profile = await PeerTutorProfile.findById(id);
      if (!profile) {
        logger.warn(`Profil de tuteur introuvable pour l'ajout d'avis: ${id}`);
        throw new ApiError(404, "Profil de tuteur introuvable");
      }

      profile.reviews.push({ ...reviewData, userId });
      await profile.save();
      await profile.populate([
        { path: "userId", select: "name email" },
        { path: "subjects", select: "name" },
        { path: "topics", select: "name" },
        { path: "reviews.userId", select: "name" },
      ]);

      logger.info(
        `Avis ajouté au profil de tuteur ${id} par l'utilisateur ${userId}`
      );
      return new ApiResponse(200, profile, "Avis ajouté avec succès");
    } catch (error) {
      logger.error(`Erreur lors de l'ajout d'un avis au profil ${id}:`, error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "Échec de l'ajout de l'avis", error.message);
    }
  }
}

module.exports = new PeerTutorProfileService();