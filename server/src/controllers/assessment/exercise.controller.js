const exerciseService = require("../../services/assessment/exercise/exercise.service");
const { asyncHandler } = require("../../utils/asyncHandler");
const { ApiError } = require("../../utils/ApiError");
const createLogger = require("../../services/logging.service");

const logger = createLogger("ExerciseController");

class ExerciseController {
  constructor() {
    // Bind all methods to this instance
    this.createExercise = this.createExercise.bind(this);
    this.getAllExercises = this.getAllExercises.bind(this);
    this.getExerciseById = this.getExerciseById.bind(this);
    this.updateExercise = this.updateExercise.bind(this);
    this.deleteExercise = this.deleteExercise.bind(this);
    this.getExercisesBySubject = this.getExercisesBySubject.bind(this);
    this.getExercisesByTopic = this.getExercisesByTopic.bind(this);
    this.getExercisesByDifficulty = this.getExercisesByDifficulty.bind(this);
    this.addFeedback = this.addFeedback.bind(this);
    this.updateAnalytics = this.updateAnalytics.bind(this);
    this.getExerciseAnalytics = this.getExerciseAnalytics.bind(this);
    this.getRecommendedExercises = this.getRecommendedExercises.bind(this);
    this.bulkCreateExercises = this.bulkCreateExercises.bind(this);
    this.bulkUpdateExercises = this.bulkUpdateExercises.bind(this);
    this.bulkDeleteExercises = this.bulkDeleteExercises.bind(this);
    this.advancedSearch = this.advancedSearch.bind(this);
    this.getExerciseStatistics = this.getExerciseStatistics.bind(this);
    this.getMathExercises = this.getMathExercises.bind(this);
    this.getPhysicsExercises = this.getPhysicsExercises.bind(this);
    this.getChemistryExercises = this.getChemistryExercises.bind(this);
    this.getBiologyExercises = this.getBiologyExercises.bind(this);
    this.getFrenchExercises = this.getFrenchExercises.bind(this);
    this.getPhilosophyExercises = this.getPhilosophyExercises.bind(this);
    this.getEnglishExercises = this.getEnglishExercises.bind(this);
    this.getHistoryExercises = this.getHistoryExercises.bind(this);
    this.getGeographyExercises = this.getGeographyExercises.bind(this);
  }

  // Create exercise
  async createExercise(req, res) {
    logger.info(`Requête de création d'exercice reçue de l'utilisateur ${req.user.id}`);
    const result = await exerciseService.createExercise(req.body, req.user.id);
    res.status(result.statusCode).json(result);
  }

  // Get all exercises
  async getAllExercises(req, res) {
    logger.info(`Requête de récupération d'exercices reçue avec filtres:`, {
      filters: req.query,
      userId: req.user?.id
    });

    const filters = {
      subjectId: req.query.subjectId,
      topicId: req.query.topicId,
      difficulty: req.query.difficulty,
      type: req.query.type,
      subjectType: req.query.subjectType,
      premiumOnly: req.query.premiumOnly === "true",
      createdBy: req.query.createdBy,
      tags: req.query.tags ? req.query.tags.split(",") : undefined,
      search: req.query.search,
    };

    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      populate: req.query.populate
        ? req.query.populate.split(",")
        : ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises(filters, options);
    res.status(result.statusCode).json(result);
  }

  // Get exercise by ID
  async getExerciseById(req, res) {
    logger.info(`Requête de récupération d'exercice reçue pour l'ID: ${req.params.id}`);
    const populate = req.query.populate
      ? req.query.populate.split(",")
      : ["subjectId", "topicId", "metadata.createdBy"];
    const result = await exerciseService.getExerciseById(
      req.params.id,
      populate
    );
    res.status(result.statusCode).json(result);
  }

  // Update exercise
  async updateExercise(req, res) {
    logger.info(`Requête de mise à jour d'exercice reçue pour l'ID: ${req.params.id} de l'utilisateur ${req.user.id}`);
    const result = await exerciseService.updateExercise(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  }

  // Delete exercise
  async deleteExercise(req, res) {
    logger.info(`Requête de suppression d'exercice reçue pour l'ID: ${req.params.id} de l'utilisateur ${req.user.id}`);
    const result = await exerciseService.deleteExercise(
      req.params.id,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  }

  // Get exercises by subject
  async getExercisesBySubject(req, res) {
    logger.info(`Requête de récupération d'exercices par matière reçue pour l'ID: ${req.params.subjectId}`);
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      populate: req.query.populate
        ? req.query.populate.split(",")
        : ["topicId"],
    };

    const result = await exerciseService.getExercisesBySubject(
      req.params.subjectId,
      options
    );
    res.status(result.statusCode).json(result);
  }

  // Get exercises by topic
  async getExercisesByTopic(req, res) {
    logger.info(`Requête de récupération d'exercices par sujet reçue pour l'ID: ${req.params.topicId}`);
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      populate: req.query.populate
        ? req.query.populate.split(",")
        : ["subjectId"],
    };

    const result = await exerciseService.getExercisesByTopic(
      req.params.topicId,
      options
    );
    res.status(result.statusCode).json(result);
  }

  // Get exercises by difficulty
  async getExercisesByDifficulty(req, res) {
    logger.info(`Requête de récupération d'exercices par difficulté reçue: ${req.params.difficulty}`);
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
      populate: req.query.populate
        ? req.query.populate.split(",")
        : ["subjectId", "topicId"],
    };

    const result = await exerciseService.getExercisesByDifficulty(
      req.params.difficulty,
      options
    );
    res.status(result.statusCode).json(result);
  }

  // Add feedback
  async addFeedback(req, res) {
    logger.info(`Requête d'ajout de commentaire reçue pour l'exercice ${req.params.id} de l'utilisateur ${req.user.id}`);
    const { rating, comments } = req.body;

    if (!rating || rating < 0 || rating > 5) {
      logger.warn(`Note invalide: ${rating} de l'utilisateur ${req.user.id}`);
      throw new ApiError(400, "La note doit être comprise entre 0 et 5");
    }

    const result = await exerciseService.addFeedback(
      req.params.id,
      req.user.id,
      rating,
      comments
    );
    res.status(result.statusCode).json(result);
  }

  // Update analytics
  async updateAnalytics(req, res) {
    logger.info(`Requête de mise à jour des statistiques reçue pour l'exercice ${req.params.id}`);
    const { score, timeSpent } = req.body;

    if (score === undefined || timeSpent === undefined) {
      logger.warn(`Données statistiques manquantes pour l'exercice ${req.params.id}`);
      throw new ApiError(400, "Le score et le temps passé sont requis");
    }

    const result = await exerciseService.updateAnalytics(
      req.params.id,
      score,
      timeSpent
    );
    res.status(result.statusCode).json(result);
  }

  // Get exercise analytics
  async getExerciseAnalytics(req, res) {
    logger.info(`Requête de récupération des statistiques reçue pour l'exercice ${req.params.id}`);
    const result = await exerciseService.getExerciseAnalytics(req.params.id);
    res.status(result.statusCode).json(result);
  }

  // Get recommended exercises
  async getRecommendedExercises(req, res) {
    logger.info(`Requête de récupération d'exercices recommandés reçue pour l'utilisateur ${req.user.id}`);
    const options = {
      limit: Number.parseInt(req.query.limit) || 10,
      difficulty: req.query.difficulty,
      subjectId: req.query.subjectId,
      topicId: req.query.topicId,
    };

    const result = await exerciseService.getRecommendedExercises(
      req.user.id,
      options
    );
    res.status(result.statusCode).json(result);
  }

  // Bulk create exercises
  async bulkCreateExercises(req, res) {
    logger.info(`Requête de création en masse d'exercices reçue de l'utilisateur ${req.user.id}`);
    if (!Array.isArray(req.body) || req.body.length === 0) {
      logger.warn(`Corps de requête invalide pour la création en masse de l'utilisateur ${req.user.id}`);
      throw new ApiError(
        400,
        "Le corps de la requête doit être un tableau non vide d'exercices"
      );
    }

    const result = await exerciseService.bulkCreateExercises(
      req.body,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  }

  // Bulk update exercises
  async bulkUpdateExercises(req, res) {
    logger.info(`Requête de mise à jour en masse d'exercices reçue de l'utilisateur ${req.user.id}`);
    const { exerciseIds, updateData } = req.body;

    if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) {
      logger.warn(`Tableau d'IDs d'exercices invalide dans la requête de mise à jour en masse de l'utilisateur ${req.user.id}`);
      throw new ApiError(400, "exerciseIds doit être un tableau non vide");
    }

    if (!updateData || typeof updateData !== "object") {
      logger.warn(`Données de mise à jour invalides dans la requête de mise à jour en masse de l'utilisateur ${req.user.id}`);
      throw new ApiError(400, "updateData est requis et doit être un objet");
    }

    const result = await exerciseService.bulkUpdateExercises(
      exerciseIds,
      updateData,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  }

  // Bulk delete exercises
  async bulkDeleteExercises(req, res) {
    logger.info(`Requête de suppression en masse d'exercices reçue de l'utilisateur ${req.user.id}`);
    const { exerciseIds } = req.body;

    if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) {
      logger.warn(`Tableau d'IDs d'exercices invalide dans la requête de suppression en masse de l'utilisateur ${req.user.id}`);
      throw new ApiError(400, "exerciseIds doit être un tableau non vide");
    }

    const result = await exerciseService.bulkDeleteExercises(
      exerciseIds,
      req.user.id
    );
    res.status(result.statusCode).json(result);
  }

  // Advanced search
  async advancedSearch(req, res) {
    logger.info(`Requête de recherche avancée reçue avec critères:`, {
      criteria: req.body,
      userId: req.user?.id
    });
    const searchCriteria = {
      keywords: req.body.keywords,
      subjects: req.body.subjects,
      topics: req.body.topics,
      difficulties: req.body.difficulties,
      types: req.body.types,
      tags: req.body.tags,
      dateRange: req.body.dateRange,
      ratingRange: req.body.ratingRange,
      premiumOnly: req.body.premiumOnly,
    };

    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "relevance",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await exerciseService.advancedSearch(
      searchCriteria,
      options
    );
    res.status(result.statusCode).json(result);
  }

  // Get exercise statistics
  async getExerciseStatistics(req, res) {
    logger.info(`Requête de récupération des statistiques reçue avec filtres:`, {
      filters: req.query,
      userId: req.user?.id
    });
    const filters = {
      subjectId: req.query.subjectId,
      topicId: req.query.topicId,
      dateRange:
        req.query.startDate && req.query.endDate
          ? {
              start: req.query.startDate,
              end: req.query.endDate,
            }
          : undefined,
    };

    const result = await exerciseService.getExerciseStatistics(filters);
    res.status(result.statusCode).json(result);
  }

  // Get subject-specific exercises
  async getMathExercises(req, res) {
    logger.info(`Requête de récupération d'exercices de mathématiques reçue`);
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises({ subjectType: "math_exercise" }, options);
    res.status(result.statusCode).json(result);
  }

  async getPhysicsExercises(req, res) {
    logger.info(`Requête de récupération d'exercices de physique reçue`);
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises({ subjectType: "physics_exercise" }, options);
    res.status(result.statusCode).json(result);
  }

  async getChemistryExercises(req, res) {
    logger.info(`Requête de récupération d'exercices de chimie reçue`);
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises({ subjectType: "chemistry_exercise" }, options);
    res.status(result.statusCode).json(result);
  }

  async getBiologyExercises(req, res) {
    logger.info(`Requête de récupération d'exercices de biologie reçue`);
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises({ subjectType: "biology_exercise" }, options);
    res.status(result.statusCode).json(result);
  }

  async getFrenchExercises(req, res) {
    logger.info(`Requête de récupération d'exercices de français reçue`);
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises({ subjectType: "french_exercise" }, options);
    res.status(result.statusCode).json(result);
  }

  async getPhilosophyExercises(req, res) {
    logger.info(`Requête de récupération d'exercices de philosophie reçue`);
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises({ subjectType: "philosophy_exercise" }, options);
    res.status(result.statusCode).json(result);
  }

  async getEnglishExercises(req, res) {
    logger.info(`Requête de récupération d'exercices d'anglais reçue`);
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises({ subjectType: "english_exercise" }, options);
    res.status(result.statusCode).json(result);
  }

  async getHistoryExercises(req, res) {
    logger.info(`Requête de récupération d'exercices d'histoire reçue`);
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises({ subjectType: "history_exercise" }, options);
    res.status(result.statusCode).json(result);
  }

  async getGeographyExercises(req, res) {
    logger.info(`Requête de récupération d'exercices de géographie reçue`);
    const options = {
      page: Number.parseInt(req.query.page) || 1,
      limit: Number.parseInt(req.query.limit) || 10,
      populate: ["subjectId", "topicId"],
    };

    const result = await exerciseService.getAllExercises({ subjectType: "geography_exercise" }, options);
    res.status(result.statusCode).json(result);
  }
}

// Create and export a single instance
const exerciseController = new ExerciseController();
module.exports = exerciseController;