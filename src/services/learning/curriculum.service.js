const { Curriculum } = require("../../models/learning/curriculum.model");
const { Subject } = require("../../models/learning/subject.model");
const NotFoundError = require("../../errors/notFoundError");
const BadRequestError = require("../../errors/badRequestError");
const ConflictError = require("../../errors/conflictError");

const createCurriculum = async (curriculumData) => {
  try {
    const existingCurriculum = await Curriculum.findOne({
      country: curriculumData.country,
      educationLevel: curriculumData.educationLevel,
      "academicYear.startDate": curriculumData.academicYear.startDate,
      isActive: true,
    });

    if (existingCurriculum) {
      throw new ConflictError(
        "Un curriculum existe déjà pour ce pays, niveau et année académique"
      );
    }

    const curriculum = new Curriculum(curriculumData);
    await curriculum.save();

    console.log(
      `Curriculum created for ${curriculum.country} - ${curriculum.educationLevel}`,
      {
        curriculumId: curriculum._id,
      }
    );

    return curriculum;
  } catch (error) {
    console.error("Error creating curriculum", error, { curriculumData });
    throw error;
  }
};

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
    } = query;

    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true" || isActive === true;
    }

    if (country) {
      filter.country = { $regex: country, $options: "i" };
    }

    if (educationLevel) {
      filter.educationLevel = educationLevel;
    }

    if (series) {
      filter.series = { $in: Array.isArray(series) ? series : [series] };
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;
    const curricula = await Curriculum.find(filter)
      .populate({
        path: "subjects",
        select: "name category difficulty estimatedHours",
        populate: {
          path: "topics",
          select: "name description difficulty learningObjectives",
        },
      })
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(Number.parseInt(limit));

    const total = await Curriculum.countDocuments(filter);

    return {
      curricula,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number.parseInt(limit),
      },
    };
  } catch (error) {
    console.error("Error getting curricula", error, { query });
    throw error;
  }
};

const getCurriculumById = async (curriculumId) => {
  try {
    const curriculum = await Curriculum.findById(curriculumId)
      .populate({
        path: "subjects",
        select: "name category difficulty estimatedHours",
        populate: {
          path: "topics",
          select: "name description difficulty learningObjectives",
        },
      })
      .populate("createdBy", "name email");

    if (!curriculum) {
      throw new NotFoundError("Curriculum non trouvé");
    }

    return curriculum;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de curriculum invalide");
    }
    console.error("Error getting curriculum by ID", error, { curriculumId });
    throw error;
  }
};

const updateCurriculum = async (curriculumId, updateData) => {
  try {
    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      throw new NotFoundError("Curriculum non trouvé");
    }

    if (
      updateData.country ||
      updateData.educationLevel ||
      updateData.academicYear
    ) {
      const countryToCheck = updateData.country || curriculum.country;
      const levelToCheck =
        updateData.educationLevel || curriculum.educationLevel;
      const startDateToCheck =
        updateData.academicYear?.startDate || curriculum.academicYear.startDate;

      const existingCurriculum = await Curriculum.findOne({
        _id: { $ne: curriculumId },
        country: countryToCheck,
        educationLevel: levelToCheck,
        "academicYear.startDate": startDateToCheck,
        isActive: true,
      });

      if (existingCurriculum) {
        throw new ConflictError(
          "Un curriculum existe déjà pour ces paramètres"
        );
      }
    }

    if (updateData.subjects) {
      const validSubjects = await Subject.find({
        _id: { $in: updateData.subjects },
        isActive: true,
      });
      if (validSubjects.length !== updateData.subjects.length) {
        throw new BadRequestError(
          "Certains subjectIds ne sont pas valides ou inactifs"
        );
      }
    }

    Object.keys(updateData).forEach((key) => {
      if (key !== "_id") {
        curriculum[key] = updateData[key];
      }
    });

    await curriculum.save();

    console.log(
      `Curriculum updated: ${curriculum.country} - ${curriculum.educationLevel}`,
      {
        curriculumId,
      }
    );

    return curriculum;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de curriculum invalide");
    }
    console.error("Error updating curriculum", error, {
      curriculumId,
      updateData,
    });
    throw error;
  }
};

const deleteCurriculum = async (curriculumId) => {
  try {
    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      throw new NotFoundError("Curriculum non trouvé");
    }

    curriculum.isActive = false;
    await curriculum.save();

    console.log(
      `Curriculum deleted: ${curriculum.country} - ${curriculum.educationLevel}`,
      {
        curriculumId,
      }
    );

    return { message: "Curriculum supprimé avec succès" };
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID de curriculum invalide");
    }
    console.error("Error deleting curriculum", error, { curriculumId });
    throw error;
  }
};

const addSubjectToCurriculum = async (curriculumId, { subjectId }) => {
  try {
    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      throw new NotFoundError("Curriculum non trouvé");
    }

    const subject = await Subject.findById(subjectId);
    if (!subject || !subject.isActive) {
      throw new NotFoundError("Matière non trouvée ou inactive");
    }

    if (curriculum.subjects.includes(subjectId)) {
      throw new ConflictError("Cette matière existe déjà dans le curriculum");
    }

    curriculum.subjects.push(subjectId);
    await curriculum.save();

    console.log(
      `Subject added to curriculum: ${curriculum.country} - ${curriculum.educationLevel}`,
      {
        curriculumId,
        subjectId,
      }
    );

    return curriculum;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide");
    }
    console.error("Error adding subject to curriculum", error, {
      curriculumId,
      subjectId,
    });
    throw error;
  }
};

const removeSubjectFromCurriculum = async (curriculumId, subjectId) => {
  try {
    const curriculum = await Curriculum.findById(curriculumId);

    if (!curriculum) {
      throw new NotFoundError("Curriculum non trouvé");
    }

    if (!curriculum.subjects.includes(subjectId)) {
      throw new NotFoundError("Cette matière n'existe pas dans le curriculum");
    }

    curriculum.subjects = curriculum.subjects.filter(
      (id) => id.toString() !== subjectId
    );
    await curriculum.save();

    console.log(
      `Subject removed from curriculum: ${curriculum.country} - ${curriculum.educationLevel}`,
      {
        curriculumId,
        subjectId,
      }
    );

    return curriculum;
  } catch (error) {
    if (error.name === "CastError") {
      throw new BadRequestError("ID invalide");
    }
    console.error("Error removing subject from curriculum", error, {
      curriculumId,
      subjectId,
    });
    throw error;
  }
};

const getCurriculaByCountry = async (country) => {
  try {
    const curricula = await Curriculum.find({
      country: { $regex: country, $options: "i" },
      isActive: true,
    })
      .populate({
        path: "subjects",
        select: "name category",
        populate: {
          path: "topics",
          select: "name description difficulty",
        },
      })
      .sort({ educationLevel: 1, "academicYear.startDate": -1 });

    return curricula;
  } catch (error) {
    console.error("Error getting curricula by country", error, { country });
    throw error;
  }
};

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
          avgSubjectsPerCurriculum: {
            $round: ["$avgSubjectsPerCurriculum", 2],
          },
          countries: 1,
          educationLevels: 1,
        },
      },
    ]);

    return stats[0] || {};
  } catch (error) {
    console.error("Error getting curriculum statistics", error);
    throw error;
  }
};

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
};
