const { Subject } = require("../../../models/learning/subject.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const ConflictError = require("../../../errors/conflictError");
const createLogger = require("../../logging.service");

const logger = createLogger("SubjectService");

// =============== CREATE SUBJECT ===============
const createSubject = async (subjectData) => {
  logger.info("===================createSubject=======================");

  // Check if subject with same code already exists
    const existingSubject = await Subject.findOne({
    code: subjectData.code.toUpperCase(),
    });
    if (existingSubject) {
    throw new ConflictError("Une matière avec ce code existe déjà");
  }

  // Check if subject with same name already exists
  const existingName = await Subject.findOne({
    name: { $regex: new RegExp(`^${subjectData.name}$`, "i") },
  });
  if (existingName) {
    throw new ConflictError("Une matière avec ce nom existe déjà");
    }

    const subject = new Subject(subjectData);
    await subject.save();

  logger.info("++++++✅ CREATE SUBJECT: Subject created successfully ++++++");
    return subject;
};

// =============== GET ALL SUBJECTS ===============
const getSubjects = async (query) => {
  logger.info("===================getSubjects=======================");

    const {
      page = 1,
      limit = 10,
    category,
    examType,
    country,
    educationLevel,
      series,
      isActive,
    isPremium,
    isFeatured,
    search,
      sortBy = "name",
      sortOrder = "asc",
    } = query;

  // Build filter object
  const filter = { status: "active" };

  if (category) filter.category = category;
  if (examType) filter.examTypes = examType;
  if (country) filter.countries = country;
  if (educationLevel) filter.educationLevels = educationLevel;
  if (series) filter.series = series;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (isPremium !== undefined) filter.isPremium = isPremium === "true";
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

  // Add search functionality
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
    }

  // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Calculate pagination
    const skip = (page - 1) * limit;

  // Execute query with pagination
  const [subjects, total] = await Promise.all([
    Subject.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
    Subject.countDocuments(filter),
  ]);

  const pagination = {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    totalCount: total,
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
    };

  logger.info("++++++✅ GET SUBJECTS: Subjects retrieved successfully ++++++");
  return { subjects, pagination };
};

// =============== GET SUBJECT BY ID ===============
const getSubjectById = async (subjectId) => {
  logger.info("===================getSubjectById=======================");

  const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new NotFoundError("Matière non trouvée");
    }

  logger.info(
    "++++++✅ GET SUBJECT BY ID: Subject retrieved successfully ++++++"
  );
  return subject;
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

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  addExamToSubject,
  removeExamFromSubject,
  rateSubject,
};
