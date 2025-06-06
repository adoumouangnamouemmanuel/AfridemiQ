const { Country } = require("../../../models/user/country.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const ConflictError = require("../../../errors/conflictError");

/**
 * Create a new country
 */
const createCountry = async (countryData) => {
  try {
    // Check if country with same name or code already exists
    const existingCountry = await Country.findOne({
      $or: [{ name: countryData.name }, { code: countryData.code }],
    });

    if (existingCountry) {
      throw new ConflictError("Un pays avec ce nom ou ce code existe déjà");
    }

    const country = new Country(countryData);
    await country.save();

    console.log(`Country created: ${country.name}`, { countryId: country._id });

    return country;
  } catch (error) {
    console.error("Error creating country", error, { countryData });
    throw error;
  }
};

/**
 * Get all countries with filtering and pagination
 */
const getCountries = async (query) => {
  try {
    const {
      page = 1,
      limit = 20,
      region,
      educationSystem,
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

    if (region) {
      filter.region = region;
    }

    if (educationSystem) {
      filter.educationSystem = educationSystem;
    }

    if (language) {
      filter.languages = { $in: [language] };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { capital: { $regex: search, $options: "i" } },
        { languages: { $regex: search, $options: "i" } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;
    const countries = await Country.find(filter)
      .populate("supportedExams", "title examType year")
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit));

    const total = await Country.countDocuments(filter);

    return {
      countries,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number.parseInt(limit),
      },
    };
  } catch (error) {
    console.error("Error getting countries", error, { query });
    throw error;
  }
};

/**
 * Get country by ID
 */
const getCountryById = async (countryId) => {
  try {
    const country = await Country.findById(countryId).populate(
      "supportedExams",
      "title examType year difficulty"
    );

    if (!country) {
      throw new NotFoundError("Pays non trouvé");
    }

    return country;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de pays invalide");
    }
    console.error("Error getting country by ID", error, { countryId });
    throw error;
  }
};

/**
 * Get country by code
 */
const getCountryByCode = async (countryCode) => {
  try {
    const country = await Country.findOne({
      code: countryCode.toUpperCase(),
      isActive: true,
    }).populate("supportedExams", "title examType year");

    if (!country) {
      throw new NotFoundError("Pays non trouvé");
    }

    return country;
  } catch (error) {
    console.error("Error getting country by code", error, { countryCode });
    throw error;
  }
};

/**
 * Update country
 */
const updateCountry = async (countryId, updateData) => {
  try {
    const country = await Country.findById(countryId);

    if (!country) {
      throw new NotFoundError("Pays non trouvé");
    }

    // Check for name/code conflict if updating these fields
    if (updateData.name || updateData.code) {
      const nameToCheck = updateData.name || country.name;
      const codeToCheck = updateData.code || country.code;

      const existingCountry = await Country.findOne({
        _id: { $ne: countryId },
        $or: [{ name: nameToCheck }, { code: codeToCheck }],
      });

      if (existingCountry) {
        throw new ConflictError("Un pays avec ce nom ou ce code existe déjà");
      }
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (key !== "_id") {
        country[key] = updateData[key];
      }
    });

    await country.save();

    console.log(`Country updated: ${country.name}`, { countryId });

    return country;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de pays invalide");
    }
    console.error("Error updating country", error, { countryId, updateData });
    throw error;
  }
};

/**
 * Delete country (soft delete)
 */
const deleteCountry = async (countryId) => {
  try {
    const country = await Country.findById(countryId);

    if (!country) {
      throw new NotFoundError("Pays non trouvé");
    }

    country.isActive = false;
    await country.save();

    console.log(`Country deleted: ${country.name}`, { countryId });

    return { message: "Pays supprimé avec succès" };
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de pays invalide");
    }
    console.error("Error deleting country", error, { countryId });
    throw error;
  }
};

/**
 * Add exam to country
 */
const addExamToCountry = async (countryId, examId) => {
  try {
    const country = await Country.findById(countryId);

    if (!country) {
      throw new NotFoundError("Pays non trouvé");
    }

    if (country.supportedExams.includes(examId)) {
      throw new ConflictError("Cet examen est déjà supporté par ce pays");
    }

    await country.addExam(examId);
    await country.populate("supportedExams", "title examType year");

    console.log(`Exam added to country: ${country.name}`, {
      countryId,
      examId,
    });

    return country;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide");
    }
    console.error("Error adding exam to country", error, { countryId, examId });
    throw error;
  }
};

/**
 * Remove exam from country
 */
const removeExamFromCountry = async (countryId, examId) => {
  try {
    const country = await Country.findById(countryId);

    if (!country) {
      throw new NotFoundError("Pays non trouvé");
    }

    if (!country.supportedExams.includes(examId)) {
      throw new NotFoundError("Cet examen n'est pas supporté par ce pays");
    }

    await country.removeExam(examId);
    await country.populate("supportedExams", "title examType year");

    console.log(`Exam removed from country: ${country.name}`, {
      countryId,
      examId,
    });

    return country;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide");
    }
    console.error("Error removing exam from country", error, {
      countryId,
      examId,
    });
    throw error;
  }
};

/**
 * Get countries by region
 */
const getCountriesByRegion = async (region) => {
  try {
    const countries = await Country.findByRegion(region).populate(
      "supportedExams",
      "title examType"
    );

    return countries;
  } catch (error) {
    console.error("Error getting countries by region", error, { region });
    throw error;
  }
};

/**
 * Get countries by education system
 */
const getCountriesByEducationSystem = async (educationSystem) => {
  try {
    const countries = await Country.findByEducationSystem(
      educationSystem
    ).populate("supportedExams", "title examType");

    return countries;
  } catch (error) {
    console.error("Error getting countries by education system", error, {
      educationSystem,
    });
    throw error;
  }
};

/**
 * Get countries by language
 */
const getCountriesByLanguage = async (language) => {
  try {
    const countries = await Country.findByLanguage(language).populate(
      "supportedExams",
      "title examType"
    );

    return countries;
  } catch (error) {
    console.error("Error getting countries by language", error, { language });
    throw error;
  }
};

/**
 * Get country statistics
 */
const getCountryStats = async () => {
  try {
    const [regionStats, educationStats, generalStats] = await Promise.all([
      Country.getRegionStats(),
      Country.getEducationSystemStats(),
      Country.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalCountries: { $sum: 1 },
            totalUsers: { $sum: "$statistics.totalUsers" },
            totalExams: { $sum: "$statistics.totalExams" },
            totalSubjects: { $sum: "$statistics.totalSubjects" },
            avgExamsPerCountry: { $avg: { $size: "$supportedExams" } },
            avgLanguagesPerCountry: { $avg: { $size: "$languages" } },
          },
        },
      ]),
    ]);

    return {
      general: generalStats[0] || {},
      byRegion: regionStats,
      byEducationSystem: educationStats,
    };
  } catch (error) {
    console.error("Error getting country statistics", error);
    throw error;
  }
};

/**
 * Search countries
 */
const searchCountries = async (searchTerm, limit = 10) => {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const countries = await Country.find({
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { code: { $regex: searchTerm, $options: "i" } },
        { capital: { $regex: searchTerm, $options: "i" } },
        { languages: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select("name code flag region educationSystem languages")
      .limit(limit)
      .sort({ name: 1 });

    return countries;
  } catch (error) {
    console.error("Error searching countries", error, { searchTerm });
    throw error;
  }
};

module.exports = {
  createCountry,
  getCountries,
  getCountryById,
  getCountryByCode,
  updateCountry,
  deleteCountry,
  addExamToCountry,
  removeExamFromCountry,
  getCountriesByRegion,
  getCountriesByEducationSystem,
  getCountriesByLanguage,
  getCountryStats,
  searchCountries,
};
