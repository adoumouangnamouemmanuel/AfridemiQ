const { Curriculum } = require("../../../models/learning/curriculum.model")
const NotFoundError = require("../../../errors/notFoundError")
const BadRequestError = require("../../../errors/badRequestError")
const ConflictError = require("../../../errors/conflictError")
const createLogger = require("../../../services/logging.service")

const logger = createLogger("CurriculumService")

/**
 * Create a new curriculum
 */
const createCurriculum = async (curriculumData) => {
  try {
    // Check if curriculum already exists for the same country, education level, and academic year
    const existingCurriculum = await Curriculum.findOne({
      country: curriculumData.country,
      educationLevel: curriculumData.educationLevel,
      "academicYear.startDate": curriculumData.academicYear.startDate,
      isActive: true,
    })

    if (existingCurriculum) {
      throw new ConflictError("Un curriculum existe déjà pour ce pays, niveau et année académique")
    }

    const curriculum = new Curriculum(curriculumData)
    await curriculum.save()

    logger.info(`Curriculum created for ${curriculum.country} - ${curriculum.educationLevel}`, {
      curriculumId: curriculum._id,
    })

    return curriculum
  } catch (error) {
    logger.error("Error creating curriculum", error, { curriculumData })
    throw error
  }
}

/**
 * Get all curricula with filtering and pagination
 */
const getCurricula = async (query) => {
  try {
    const {
      page = 1,
      limit = 10,
      country,
      educationLevel,
      series,
      isActive,
      sortBy = "country",
      sortOrder = "asc",
    } = query

    const filter = {}

    if (isActive !== undefined) {
      filter.isActive = isActive === "true" || isActive === true
    }

    if (country) {
      filter.country = { $regex: country, $options: "i" }
    }

    if (educationLevel) {
      filter.educationLevel = educationLevel
    }

    if (series) {
      filter.series = { $in: Array.isArray(series) ? series : [series] }
    }

    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const skip = (page - 1) * limit
    const curricula = await Curriculum.find(filter)
      .populate("subjects.subjectId", "name category difficulty")
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit))

    const total = await Curriculum.countDocuments(filter)

    return {
      curricula,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number.parseInt(limit),
      },
    }
  } catch (error) {
    logger.error("Error getting curricula", error, { query })
    throw error
  }
}

/**
 * Get curriculum by ID
 */
const getCurriculumById = async (curriculumId) => {
  try {
    const curriculum = await Curriculum.findById(curriculumId)
      .populate("subjects.subjectId", "name category difficulty estimatedHours")
      .populate("createdBy", "name email")

    if (!curriculum) {
      throw new NotFoundError("Curriculum non trouvé")
    }

    return curriculum
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de curriculum invalide")
    }
    logger.error("Error getting curriculum by ID", error, { curriculumId })
    throw error
  }
}

/**
 * Update curriculum
 */
const updateCurriculum = async (curriculumId, updateData) => {
  try {
    const curriculum = await Curriculum.findById(curriculumId)

    if (!curriculum) {
      throw new NotFoundError("Curriculum non trouvé")
    }

    // Check for conflicts if updating key fields
    if (updateData.country || updateData.educationLevel || updateData.academicYear) {
      const countryToCheck = updateData.country || curriculum.country
      const levelToCheck = updateData.educationLevel || curriculum.educationLevel
      const startDateToCheck = updateData.academicYear?.startDate || curriculum.academicYear.startDate

      const existingCurriculum = await Curriculum.findOne({
        _id: { $ne: curriculumId },
        country: countryToCheck,
        educationLevel: levelToCheck,
        "academicYear.startDate": startDateToCheck,
        isActive: true,
      })

      if (existingCurriculum) {
        throw new ConflictError("Un curriculum existe déjà pour ces paramètres")
      }
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (key !== "_id") {
        curriculum[key] = updateData[key]
      }
    })

    await curriculum.save()

    logger.info(`Curriculum updated: ${curriculum.country} - ${curriculum.educationLevel}`, {
      curriculumId,
    })

    return curriculum
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de curriculum invalide")
    }
    logger.error("Error updating curriculum", error, { curriculumId, updateData })
    throw error
  }
}

/**
 * Delete curriculum (soft delete)
 */
const deleteCurriculum = async (curriculumId) => {
  try {
    const curriculum = await Curriculum.findById(curriculumId)

    if (!curriculum) {
      throw new NotFoundError("Curriculum non trouvé")
    }

    curriculum.isActive = false
    await curriculum.save()

    logger.info(`Curriculum deleted: ${curriculum.country} - ${curriculum.educationLevel}`, {
      curriculumId,
    })

    return { message: "Curriculum supprimé avec succès" }
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de curriculum invalide")
    }
    logger.error("Error deleting curriculum", error, { curriculumId })
    throw error
  }
}

/**
 * Add subject to curriculum
 */
const addSubjectToCurriculum = async (curriculumId, subjectData) => {
  try {
    const curriculum = await Curriculum.findById(curriculumId)

    if (!curriculum) {
      throw new NotFoundError("Curriculum non trouvé")
    }

    // Check if subject already exists in curriculum
    const existingSubject = curriculum.subjects.find(
      (subject) => subject.subjectId.toString() === subjectData.subjectId,
    )

    if (existingSubject) {
      throw new ConflictError("Cette matière existe déjà dans le curriculum")
    }

    curriculum.subjects.push(subjectData)
    await curriculum.save()

    logger.info(`Subject added to curriculum: ${curriculum.country} - ${curriculum.educationLevel}`, {
      curriculumId,
      subjectId: subjectData.subjectId,
    })

    return curriculum
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide")
    }
    logger.error("Error adding subject to curriculum", error, { curriculumId, subjectData })
    throw error
  }
}

/**
 * Remove subject from curriculum
 */
const removeSubjectFromCurriculum = async (curriculumId, subjectId) => {
  try {
    const curriculum = await Curriculum.findById(curriculumId)

    if (!curriculum) {
      throw new NotFoundError("Curriculum non trouvé")
    }

    const subjectIndex = curriculum.subjects.findIndex((subject) => subject.subjectId.toString() === subjectId)

    if (subjectIndex === -1) {
      throw new NotFoundError("Cette matière n'existe pas dans le curriculum")
    }

    curriculum.subjects.splice(subjectIndex, 1)
    await curriculum.save()

    logger.info(`Subject removed from curriculum: ${curriculum.country} - ${curriculum.educationLevel}`, {
      curriculumId,
      subjectId,
    })

    return curriculum
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide")
    }
    logger.error("Error removing subject from curriculum", error, { curriculumId, subjectId })
    throw error
  }
}

/**
 * Get curricula by country
 */
const getCurriculaByCountry = async (country) => {
  try {
    const curricula = await Curriculum.find({
      country: { $regex: country, $options: "i" },
      isActive: true,
    })
      .populate("subjects.subjectId", "name category")
      .sort({ educationLevel: 1, "academicYear.startDate": -1 })

    return curricula
  } catch (error) {
    logger.error("Error getting curricula by country", error, { country })
    throw error
  }
}

/**
 * Get curriculum statistics
 */
const getCurriculumStats = async () => {
  try {
    const stats = await Curriculum.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalCurricula: { $sum: 1 },
          countries: { $addToSet: "$country" },
          educationLevels: { $addToSet: "$educationLevel" },
          avgSubjectsPerCurriculum: { $avg: { $size: "$subjects" } },
        },
      },
      {
        $project: {
          _id: 0,
          totalCurricula: 1,
          totalCountries: { $size: "$countries" },
          totalEducationLevels: { $size: "$educationLevels" },
          avgSubjectsPerCurriculum: { $round: ["$avgSubjectsPerCurriculum", 2] },
          countries: 1,
          educationLevels: 1,
        },
      },
    ])

    return stats[0] || {}
  } catch (error) {
    logger.error("Error getting curriculum statistics", error)
    throw error
  }
}

module.exports = {
  createCurriculum,
  getCurricula,
  getCurriculumById,
  updateCurriculum,
  deleteCurriculum,
  addSubjectToCurriculum,
  removeSubjectFromCurriculum,
  getCurriculaByCountry,
  getCurriculumStats,
}