const { Exam } = require("../../../models/assessment/exam.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const ConflictError = require("../../../errors/conflictError");
const createLogger = require("../../../services/logging.service");

const logger = createLogger("ExamService");

/**
 * Créer un nouvel examen
 */
const createExam = async (examData) => {
  try {
    // Vérifier si un examen avec le même nom existe déjà pour ce pays
    const existingExam = await Exam.findOne({
      name: examData.name,
      country: examData.country,
      isActive: true,
    });

    if (existingExam) {
      throw new ConflictError("Un examen avec ce nom existe déjà pour ce pays");
    }

    const exam = new Exam(examData);
    await exam.save();

    logger.info(`Examen créé: ${exam.name}`, { examId: exam._id });

    return exam;
  } catch (error) {
    logger.error("Erreur lors de la création de l'examen", error, { examData });
    throw error;
  }
};

/**
 * Obtenir tous les examens avec filtrage et pagination
 */
const getExams = async (query) => {
  try {
    const {
      page = 1,
      limit = 10,
      country,
      level,
      examFormat,
      examType,
      difficulty,
      primaryLanguage,
      language,
      isActive,
      search,
      sortBy = "name",
      sortOrder = "asc",
    } = query;

    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true" || isActive === true;
    }

    if (country) {
      filter.country = { $regex: country, $options: "i" };
    }

    if (level) {
      filter.levels = { $in: Array.isArray(level) ? level : [level] };
    }

    if (examFormat) {
      filter.examFormat = examFormat;
    }

    if (examType) {
      filter.examType = examType;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (primaryLanguage) {
      filter.primaryLanguage = { $regex: primaryLanguage, $options: "i" };
    }

    if (language) {
      filter.language = { $regex: language, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { longDescription: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { keywords: { $regex: search, $options: "i" } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;
    const exams = await Exam.find(filter)
      .populate("curriculumId", "country educationLevel")
      .populate("series.subjects", "name category difficulty")
      .populate("statistics.subjectStatistics.subject", "name category")
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit));

    const total = await Exam.countDocuments(filter);

    return {
      exams,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number.parseInt(limit),
      },
    };
  } catch (error) {
    logger.error("Erreur lors de la récupération des examens", error, {
      query,
    });
    throw error;
  }
};

/**
 * Obtenir un examen par ID
 */
const getExamById = async (examId) => {
  try {
    const exam = await Exam.findById(examId)
      .populate("curriculumId", "country educationLevel subjects")
      .populate("series.subjects", "name category difficulty estimatedHours")
      .populate("statistics.subjectStatistics.subject", "name category");

    if (!exam) {
      throw new NotFoundError("Examen non trouvé");
    }

    // Increment view count
    exam.metadata.views += 1;
    await exam.save();

    return exam;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID d'examen invalide");
    }
    logger.error("Erreur lors de la récupération de l'examen par ID", error, {
      examId,
    });
    throw error;
  }
};

/**
 * Mettre à jour un examen
 */
const updateExam = async (examId, updateData) => {
  try {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new NotFoundError("Examen non trouvé");
    }

    // Vérifier les conflits si le nom ou le pays est mis à jour
    if (updateData.name || updateData.country) {
      const nameToCheck = updateData.name || exam.name;
      const countryToCheck = updateData.country || exam.country;

      const existingExam = await Exam.findOne({
        _id: { $ne: examId },
        name: nameToCheck,
        country: countryToCheck,
        isActive: true,
      });

      if (existingExam) {
        throw new ConflictError(
          "Un examen avec ce nom existe déjà pour ce pays"
        );
      }
    }

    // Mettre à jour les champs
    Object.keys(updateData).forEach((key) => {
      if (key !== "_id") {
        exam[key] = updateData[key];
      }
    });

    await exam.save();

    logger.info(`Examen mis à jour: ${exam.name}`, { examId });

    return exam;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID d'examen invalide");
    }
    logger.error("Erreur lors de la mise à jour de l'examen", error, {
      examId,
      updateData,
    });
    throw error;
  }
};

/**
 * Supprimer un examen (suppression douce)
 */
const deleteExam = async (examId) => {
  try {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new NotFoundError("Examen non trouvé");
    }

    exam.isActive = false;
    await exam.save();

    logger.info(`Examen supprimé: ${exam.name}`, { examId });

    return { message: "Examen supprimé avec succès" };
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID d'examen invalide");
    }
    logger.error("Erreur lors de la suppression de l'examen", error, {
      examId,
    });
    throw error;
  }
};

/**
 * Ajouter une série à un examen
 */
const addSeriesToExam = async (examId, seriesData) => {
  try {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new NotFoundError("Examen non trouvé");
    }

    // Vérifier si la série existe déjà
    const existingSeries = exam.series.find(
      (series) => series.id === seriesData.id
    );
    if (existingSeries) {
      throw new ConflictError("Cette série existe déjà pour cet examen");
    }

    await exam.addSeries(seriesData);
    await exam.populate("series.subjects", "name category");

    logger.info(`Série ajoutée à l'examen: ${exam.name}`, {
      examId,
      seriesId: seriesData.id,
    });

    return exam;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide");
    }
    logger.error("Erreur lors de l'ajout de la série à l'examen", error, {
      examId,
      seriesData,
    });
    throw error;
  }
};

/**
 * Supprimer une série d'un examen
 */
const removeSeriesFromExam = async (examId, seriesId) => {
  try {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new NotFoundError("Examen non trouvé");
    }

    const seriesExists = exam.series.find((series) => series.id === seriesId);
    if (!seriesExists) {
      throw new NotFoundError("Cette série n'existe pas pour cet examen");
    }

    await exam.removeSeries(seriesId);

    logger.info(`Série supprimée de l'examen: ${exam.name}`, {
      examId,
      seriesId,
    });

    return exam;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide");
    }
    logger.error(
      "Erreur lors de la suppression de la série de l'examen",
      error,
      { examId, seriesId }
    );
    throw error;
  }
};

/**
 * Ajouter un centre d'examen
 */
const addCenterToExam = async (examId, centerData) => {
  try {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new NotFoundError("Examen non trouvé");
    }

    // Vérifier si le centre existe déjà
    const existingCenter = exam.examCenters.find(
      (center) => center.id === centerData.id
    );
    if (existingCenter) {
      throw new ConflictError("Ce centre existe déjà pour cet examen");
    }

    await exam.addCenter(centerData);

    logger.info(`Centre ajouté à l'examen: ${exam.name}`, {
      examId,
      centerId: centerData.id,
    });

    return exam;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide");
    }
    logger.error("Erreur lors de l'ajout du centre à l'examen", error, {
      examId,
      centerData,
    });
    throw error;
  }
};

/**
 * Ajouter des statistiques à un examen
 */
const addStatisticsToExam = async (examId, statsData) => {
  try {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new NotFoundError("Examen non trouvé");
    }

    await exam.addStatistics(statsData);

    logger.info(`Statistiques ajoutées à l'examen: ${exam.name}`, {
      examId,
      year: statsData.year,
    });

    return exam;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide");
    }
    logger.error("Erreur lors de l'ajout des statistiques à l'examen", error, {
      examId,
      statsData,
    });
    throw error;
  }
};

/**
 * Mettre à jour la note d'un examen
 */
const rateExam = async (examId, rating) => {
  try {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new NotFoundError("Examen non trouvé");
    }

    // Calculer la nouvelle moyenne
    const currentTotal = exam.rating.average * exam.rating.count;
    const newCount = exam.rating.count + 1;
    const newAverage = (currentTotal + rating) / newCount;

    exam.rating.average = Math.round(newAverage * 100) / 100;
    exam.rating.count = newCount;

    await exam.save();

    logger.info(`Note ajoutée à l'examen: ${exam.name}`, {
      examId,
      rating,
      newAverage,
    });

    return exam;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide");
    }
    logger.error("Erreur lors de la notation de l'examen", error, {
      examId,
      rating,
    });
    throw error;
  }
};

/**
 * Incrémenter la popularité d'un examen
 */
const incrementPopularity = async (examId, amount = 1) => {
  try {
    const exam = await Exam.findById(examId);

    if (!exam) {
      throw new NotFoundError("Examen non trouvé");
    }

    exam.popularity += amount;
    await exam.save();

    return exam;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide");
    }
    logger.error("Erreur lors de l'incrémentation de la popularité", error, {
      examId,
      amount,
    });
    throw error;
  }
};

/**
 * Obtenir les examens par pays
 */
const getExamsByCountry = async (country) => {
  try {
    const exams = await Exam.findByCountry(country)
      .populate("curriculumId", "educationLevel")
      .populate("series.subjects", "name category")
      .sort({ examType: 1, name: 1 });

    return exams;
  } catch (error) {
    logger.error("Erreur lors de la récupération des examens par pays", error, {
      country,
    });
    throw error;
  }
};

/**
 * Obtenir les examens par niveau
 */
const getExamsByLevel = async (level) => {
  try {
    const exams = await Exam.findByLevel(level)
      .populate("curriculumId", "country educationLevel")
      .populate("series.subjects", "name category")
      .sort({ country: 1, name: 1 });

    return exams;
  } catch (error) {
    logger.error(
      "Erreur lors de la récupération des examens par niveau",
      error,
      { level }
    );
    throw error;
  }
};

/**
 * Obtenir les examens à venir
 */
const getUpcomingExams = async (days = 30) => {
  try {
    const exams = await Exam.findUpcoming(days)
      .populate("curriculumId", "country educationLevel")
      .select("name country levels importantDates examFormat examType")
      .sort({ "importantDates.date": 1 });

    return exams;
  } catch (error) {
    logger.error("Erreur lors de la récupération des examens à venir", error, {
      days,
    });
    throw error;
  }
};

/**
 * Obtenir les statistiques des examens
 */
const getExamStats = async () => {
  try {
    const [countryStats, generalStats, popularExams] = await Promise.all([
      Exam.getStatsByCountry(),
      Exam.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalExams: { $sum: 1 },
            totalSeries: { $sum: { $size: "$series" } },
            totalCenters: { $sum: { $size: "$examCenters" } },
            countries: { $addToSet: "$country" },
            formats: { $addToSet: "$examFormat" },
            types: { $addToSet: "$examType" },
            languages: { $addToSet: "$primaryLanguage" },
            avgRating: { $avg: "$rating.average" },
            totalViews: { $sum: "$metadata.views" },
          },
        },
      ]),
      Exam.find({ isActive: true })
        .sort({ popularity: -1 })
        .limit(10)
        .select("name country popularity rating"),
    ]);

    return {
      general: generalStats[0] || {},
      byCountry: countryStats,
      popularExams,
    };
  } catch (error) {
    logger.error(
      "Erreur lors de la récupération des statistiques des examens",
      error
    );
    throw error;
  }
};

/**
 * Rechercher des examens
 */
const searchExams = async (searchTerm, limit = 10) => {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const exams = await Exam.find({
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { longDescription: { $regex: searchTerm, $options: "i" } },
        { country: { $regex: searchTerm, $options: "i" } },
        { tags: { $regex: searchTerm, $options: "i" } },
        { keywords: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select(
        "name country levels examFormat examType difficulty primaryLanguage popularity rating"
      )
      .limit(limit)
      .sort({ popularity: -1, "rating.average": -1 });

    return exams;
  } catch (error) {
    logger.error("Erreur lors de la recherche d'examens", error, {
      searchTerm,
    });
    throw error;
  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  addSeriesToExam,
  removeSeriesFromExam,
  addCenterToExam,
  addStatisticsToExam,
  rateExam,
  incrementPopularity,
  getExamsByCountry,
  getExamsByLevel,
  getUpcomingExams,
  getExamStats,
  searchExams,
};