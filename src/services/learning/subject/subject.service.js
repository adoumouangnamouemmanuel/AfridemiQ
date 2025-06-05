const { Subject } = require("../../models/index");
const NotFoundError = require("../../errors/notFoundError");
const BadRequestError = require("../../errors/badRequestError");
const ConflictError = require("../../errors/conflictError");
const createLogger = require("../../services/logging.service");
const searchService = require("./subject/search.service");
const analyticsService = require("./subject/analytics.service");
const bulkService = require("./subject/bulk.service");

const logger = createLogger("SubjectService");

/**
 * Create a new subject
 */
const createSubject = async (subjectData) => {
  try {
    // Check if subject with same name and series already exists
    const existingSubject = await Subject.findOne({
      name: subjectData.name,
      series: { $in: subjectData.series },
      isActive: true,
    });

    if (existingSubject) {
      throw new ConflictError(
        "Une matière avec ce nom existe déjà pour cette série"
      );
    }

    const subject = new Subject(subjectData);
    await subject.save();

    logger.info(`Subject created: ${subject.name}`, { subjectId: subject._id });

    return subject;
  } catch (error) {
    logger.error("Error creating subject", error, { subjectData });
    throw error;
  }
};

/**
 * Get all subjects with advanced filtering and pagination
 */
const getSubjects = async (query) => {
  try {
    // Use advanced search service for complex queries
    if (query.query || query.tags || query.minRating || query.hasExams) {
      return await searchService.advancedSearch(query);
    }

    // Simple filtering for basic queries
    const {
      page = 1,
      limit = 10,
      series,
      category,
      difficulty,
      isActive = true,
      sortBy = "name",
      sortOrder = "asc",
    } = query;

    const filter = { isActive };

    if (series) {
      filter.series = { $in: Array.isArray(series) ? series : [series] };
    }

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;
    const subjects = await Subject.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit));

    const total = await Subject.countDocuments(filter);

    return {
      subjects,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number.parseInt(limit),
      },
    };
  } catch (error) {
    logger.error("Error getting subjects", error, { query });
    throw error;
  }
};

/**
 * Get subject by ID with related data
 */
const getSubjectById = async (subjectId, includeRelated = false) => {
  try {
    const subject = await Subject.findById(subjectId).populate(
      "examIds",
      "title description difficulty"
    );

    if (!subject) {
      throw new NotFoundError("Matière non trouvée");
    }

    // Increment popularity (view count)
    subject.popularity += 1;
    await subject.save();

    const result = { subject };

    if (includeRelated) {
      result.related = await searchService.getRelatedSubjects(subjectId);
      result.performance = await analyticsService.getSubjectPerformance(
        subjectId
      );
    }

    return result;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de matière invalide");
    }
    logger.error("Error getting subject by ID", error, { subjectId });
    throw error;
  }
};

/**
 * Update subject
 */
const updateSubject = async (subjectId, updateData) => {
  try {
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      throw new NotFoundError("Matière non trouvée");
    }

    // Check for name/series conflict if name or series is being updated
    if (updateData.name || updateData.series) {
      const nameToCheck = updateData.name || subject.name;
      const seriesToCheck = updateData.series || subject.series;

      const existingSubject = await Subject.findOne({
        _id: { $ne: subjectId },
        name: nameToCheck,
        series: { $in: seriesToCheck },
        isActive: true,
      });

      if (existingSubject) {
        throw new ConflictError(
          "Une matière avec ce nom existe déjà pour cette série"
        );
      }
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (key !== "_id") {
        subject[key] = updateData[key];
      }
    });

    await subject.save();

    logger.info(`Subject updated: ${subject.name}`, { subjectId });

    return subject;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de matière invalide");
    }
    logger.error("Error updating subject", error, { subjectId, updateData });
    throw error;
  }
};

/**
 * Delete subject (soft delete)
 */
const deleteSubject = async (subjectId) => {
  try {
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      throw new NotFoundError("Matière non trouvée");
    }

    subject.isActive = false;
    await subject.save();

    logger.info(`Subject deleted: ${subject.name}`, { subjectId });

    return { message: "Matière supprimée avec succès" };
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de matière invalide");
    }
    logger.error("Error deleting subject", error, { subjectId });
    throw error;
  }
};

/**
 * Add exam to subject
 */
const addExamToSubject = async (subjectId, examId) => {
  try {
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      throw new NotFoundError("Matière non trouvée");
    }

    if (subject.examIds.includes(examId)) {
      throw new ConflictError("Cet examen est déjà associé à cette matière");
    }

    subject.examIds.push(examId);
    await subject.save();

    await subject.populate("examIds", "title description difficulty");

    logger.info(`Exam added to subject: ${subject.name}`, {
      subjectId,
      examId,
    });

    return subject;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide");
    }
    logger.error("Error adding exam to subject", error, { subjectId, examId });
    throw error;
  }
};

/**
 * Remove exam from subject
 */
const removeExamFromSubject = async (subjectId, examId) => {
  try {
    const subject = await Subject.findById(subjectId);

    if (!subject) {
      throw new NotFoundError("Matière non trouvée");
    }

    if (!subject.examIds.includes(examId)) {
      throw new NotFoundError("Cet examen n'est pas associé à cette matière");
    }

    subject.examIds = subject.examIds.filter((id) => id.toString() !== examId);
    await subject.save();

    await subject.populate("examIds", "title description difficulty");

    logger.info(`Exam removed from subject: ${subject.name}`, {
      subjectId,
      examId,
    });

    return subject;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide");
    }
    logger.error("Error removing exam from subject", error, {
      subjectId,
      examId,
    });
    throw error;
  }
};

/**
 * Rate a subject
 */
const rateSubject = async (subjectId, rating) => {
  try {
    if (rating < 1 || rating > 5) {
      throw new BadRequestError("La note doit être entre 1 et 5");
    }

    const subject = await Subject.findById(subjectId);

    if (!subject) {
      throw new NotFoundError("Matière non trouvée");
    }

    await subject.updateRating(rating);

    logger.info(`Subject rated: ${subject.name} - ${rating}/5`, {
      subjectId,
      rating,
    });

    return subject;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de matière invalide");
    }
    logger.error("Error rating subject", error, { subjectId, rating });
    throw error;
  }
};

// Export all services including search, analytics, and bulk operations
module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  addExamToSubject,
  removeExamFromSubject,
  rateSubject,

  // Search services
  advancedSearch: searchService.advancedSearch,
  getSearchSuggestions: searchService.getSearchSuggestions,
  getTrendingSearches: searchService.getTrendingSearches,
  getRelatedSubjects: searchService.getRelatedSubjects,

  // Analytics services
  getSubjectAnalytics: analyticsService.getSubjectAnalytics,
  getSubjectPerformance: analyticsService.getSubjectPerformance,
  getTrendingSubjects: analyticsService.getTrendingSubjects,
  compareSubjects: analyticsService.compareSubjects,

  // Bulk operations
  bulkCreateSubjects: bulkService.bulkCreateSubjects,
  bulkUpdateSubjects: bulkService.bulkUpdateSubjects,
  bulkDeleteSubjects: bulkService.bulkDeleteSubjects,
  bulkExportSubjects: bulkService.bulkExportSubjects,
  bulkImportSubjects: bulkService.bulkImportSubjects,
};
