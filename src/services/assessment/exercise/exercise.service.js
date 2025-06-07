const {
  Exercise,
  MathExercise,
  PhysicsExercise,
  ChemistryExercise,
  BiologyExercise,
  FrenchExercise,
  PhilosophyExercise,
  EnglishExercise,
  HistoryExercise,
  GeographyExercise,
  DIFFICULTY_LEVELS,
} = require("../../../models/assessment/exercise.model");
const { ApiError } = require("../../../utils/ApiError");
const { ApiResponse } = require("../../../utils/ApiResponse");

class ExerciseService {
  // Get subject-specific model
  getSubjectModel(subjectType) {
    const models = {
      math: MathExercise,
      physics: PhysicsExercise,
      chemistry: ChemistryExercise,
      biology: BiologyExercise,
      french: FrenchExercise,
      philosophy: PhilosophyExercise,
      english: EnglishExercise,
      history: HistoryExercise,
      geography: GeographyExercise,
    };
    return models[subjectType] || Exercise;
  }

  // Create exercise
  async createExercise(exerciseData, userId) {
    try {
      const { subjectType, ...data } = exerciseData;

      // Set metadata
      data.metadata = {
        ...data.metadata,
        createdBy: userId,
        createdAt: new Date(),
        lastModified: new Date(),
      };

      const Model = this.getSubjectModel(subjectType);
      const exercise = new Model(data);
      await exercise.save();

      return new ApiResponse(201, exercise, "Exercise created successfully");
    } catch (error) {
      throw new ApiError(400, `Failed to create exercise: ${error.message}`);
    }
  }

  // Get all exercises with filters
  async getAllExercises(filters = {}, options = {}) {
    try {
      const {
        subjectId,
        topicId,
        difficulty,
        type,
        subjectType,
        premiumOnly,
        isActive = true,
        createdBy,
        tags,
        search,
      } = filters;

      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        populate = [],
      } = options;

      // Build query
      const query = { isActive };

      if (subjectId) query.subjectId = subjectId;
      if (topicId) query.topicId = topicId;
      if (difficulty) query.difficulty = difficulty;
      if (type) query.type = type;
      if (subjectType) query.subjectType = subjectType;
      if (premiumOnly !== undefined) query.premiumOnly = premiumOnly;
      if (createdBy) query["metadata.createdBy"] = createdBy;
      if (tags && tags.length > 0) query["metadata.tags"] = { $in: tags };

      // Search functionality
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { instructions: { $regex: search, $options: "i" } },
          { "metadata.tags": { $regex: search, $options: "i" } },
        ];
      }

      // Execute query
      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      let exerciseQuery = Exercise.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number.parseInt(limit));

      // Add population
      if (populate.length > 0) {
        populate.forEach((field) => {
          exerciseQuery = exerciseQuery.populate(field);
        });
      }

      const exercises = await exerciseQuery.exec();
      const total = await Exercise.countDocuments(query);

      const pagination = {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number.parseInt(limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      };

      return new ApiResponse(
        200,
        { exercises, pagination },
        "Exercises retrieved successfully"
      );
    } catch (error) {
      throw new ApiError(500, `Failed to retrieve exercises: ${error.message}`);
    }
  }

  // Get exercise by ID
  async getExerciseById(exerciseId, populate = []) {
    try {
      let query = Exercise.findById(exerciseId);

      if (populate.length > 0) {
        populate.forEach((field) => {
          query = query.populate(field);
        });
      }

      const exercise = await query.exec();

      if (!exercise) {
        throw new ApiError(404, "Exercise not found");
      }

      return new ApiResponse(200, exercise, "Exercise retrieved successfully");
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to retrieve exercise: ${error.message}`);
    }
  }

  // Update exercise
  async updateExercise(exerciseId, updateData, userId) {
    try {
      const exercise = await Exercise.findById(exerciseId);

      if (!exercise) {
        throw new ApiError(404, "Exercise not found");
      }

      // Update metadata
      updateData.metadata = {
        ...exercise.metadata,
        ...updateData.metadata,
        updatedBy: userId,
        lastModified: new Date(),
        version: exercise.metadata.version + 1,
      };

      const updatedExercise = await Exercise.findByIdAndUpdate(
        exerciseId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      return new ApiResponse(
        200,
        updatedExercise,
        "Exercise updated successfully"
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, `Failed to update exercise: ${error.message}`);
    }
  }

  // Delete exercise (soft delete)
  async deleteExercise(exerciseId, userId) {
    try {
      const exercise = await Exercise.findById(exerciseId);

      if (!exercise) {
        throw new ApiError(404, "Exercise not found");
      }

      await Exercise.findByIdAndUpdate(exerciseId, {
        isActive: false,
        "metadata.updatedBy": userId,
        "metadata.lastModified": new Date(),
      });

      return new ApiResponse(200, null, "Exercise deleted successfully");
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to delete exercise: ${error.message}`);
    }
  }

  // Get exercises by subject
  async getExercisesBySubject(subjectId, options = {}) {
    try {
      return await this.getAllExercises({ subjectId, isActive: true }, options);
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to retrieve exercises by subject: ${error.message}`
      );
    }
  }

  // Get exercises by topic
  async getExercisesByTopic(topicId, options = {}) {
    try {
      return await this.getAllExercises({ topicId, isActive: true }, options);
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to retrieve exercises by topic: ${error.message}`
      );
    }
  }

  // Get exercises by difficulty
  async getExercisesByDifficulty(difficulty, options = {}) {
    try {
      if (!DIFFICULTY_LEVELS.includes(difficulty)) {
        throw new ApiError(400, "Invalid difficulty level");
      }

      return await this.getAllExercises(
        { difficulty, isActive: true },
        options
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        `Failed to retrieve exercises by difficulty: ${error.message}`
      );
    }
  }

  // Add feedback to exercise
  async addFeedback(exerciseId, userId, rating, comments) {
    try {
      const exercise = await Exercise.findById(exerciseId);

      if (!exercise) {
        throw new ApiError(404, "Exercise not found");
      }

      // Check if user already provided feedback
      const existingFeedback = exercise.feedback.find(
        (fb) => fb.userId.toString() === userId.toString()
      );

      if (existingFeedback) {
        // Update existing feedback
        existingFeedback.rating = rating;
        existingFeedback.comments = comments;
        existingFeedback.createdAt = new Date();
      } else {
        // Add new feedback
        exercise.feedback.push({ userId, rating, comments });
      }

      await exercise.save();

      return new ApiResponse(200, exercise, "Feedback added successfully");
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to add feedback: ${error.message}`);
    }
  }

  // Update exercise analytics
  async updateAnalytics(exerciseId, score, timeSpent) {
    try {
      const exercise = await Exercise.findById(exerciseId);

      if (!exercise) {
        throw new ApiError(404, "Exercise not found");
      }

      await exercise.updateAnalytics(score, timeSpent);

      return new ApiResponse(
        200,
        exercise.analytics,
        "Analytics updated successfully"
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to update analytics: ${error.message}`);
    }
  }

  // Get exercise analytics
  async getExerciseAnalytics(exerciseId) {
    try {
      const exercise = await Exercise.findById(exerciseId).select(
        "analytics feedback"
      );

      if (!exercise) {
        throw new ApiError(404, "Exercise not found");
      }

      const analytics = {
        ...exercise.analytics.toObject(),
        averageRating: exercise.averageRating,
        totalFeedback: exercise.totalFeedback,
      };

      return new ApiResponse(
        200,
        analytics,
        "Analytics retrieved successfully"
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to retrieve analytics: ${error.message}`);
    }
  }

  // Get recommended exercises
  async getRecommendedExercises(userId, options = {}) {
    try {
      const { limit = 10, difficulty, subjectId, topicId } = options;

      // Build recommendation query based on user preferences/history
      const query = { isActive: true };

      if (difficulty) query.difficulty = difficulty;
      if (subjectId) query.subjectId = subjectId;
      if (topicId) query.topicId = topicId;

      const exercises = await Exercise.find(query)
        .sort({ "analytics.successRate": -1, "analytics.averageScore": -1 })
        .limit(Number.parseInt(limit))
        .populate("subjectId", "name")
        .populate("topicId", "name");

      return new ApiResponse(
        200,
        exercises,
        "Recommended exercises retrieved successfully"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to get recommended exercises: ${error.message}`
      );
    }
  }

  // Bulk operations
  async bulkCreateExercises(exercisesData, userId) {
    try {
      const exercises = exercisesData.map((data) => ({
        ...data,
        metadata: {
          ...data.metadata,
          createdBy: userId,
          createdAt: new Date(),
          lastModified: new Date(),
        },
      }));

      const createdExercises = await Exercise.insertMany(exercises);

      return new ApiResponse(
        201,
        createdExercises,
        `${createdExercises.length} exercises created successfully`
      );
    } catch (error) {
      throw new ApiError(
        400,
        `Failed to bulk create exercises: ${error.message}`
      );
    }
  }

  async bulkUpdateExercises(exerciseIds, updateData, userId) {
    try {
      const updatePayload = {
        ...updateData,
        "metadata.updatedBy": userId,
        "metadata.lastModified": new Date(),
      };

      const result = await Exercise.updateMany(
        { _id: { $in: exerciseIds } },
        updatePayload
      );

      return new ApiResponse(
        200,
        result,
        `${result.modifiedCount} exercises updated successfully`
      );
    } catch (error) {
      throw new ApiError(
        400,
        `Failed to bulk update exercises: ${error.message}`
      );
    }
  }

  async bulkDeleteExercises(exerciseIds, userId) {
    try {
      const result = await Exercise.updateMany(
        { _id: { $in: exerciseIds } },
        {
          isActive: false,
          "metadata.updatedBy": userId,
          "metadata.lastModified": new Date(),
        }
      );

      return new ApiResponse(
        200,
        result,
        `${result.modifiedCount} exercises deleted successfully`
      );
    } catch (error) {
      throw new ApiError(
        400,
        `Failed to bulk delete exercises: ${error.message}`
      );
    }
  }

  // Advanced search
  async advancedSearch(searchCriteria, options = {}) {
    try {
      const {
        keywords,
        subjects,
        topics,
        difficulties,
        types,
        tags,
        dateRange,
        ratingRange,
        premiumOnly,
      } = searchCriteria;

      const {
        page = 1,
        limit = 10,
        sortBy = "relevance",
        sortOrder = "desc",
      } = options;

      // Build complex query
      const query = { isActive: true };

      // Text search
      if (keywords) {
        query.$text = { $search: keywords };
      }

      // Filters
      if (subjects && subjects.length > 0) {
        query.subjectId = { $in: subjects };
      }

      if (topics && topics.length > 0) {
        query.topicId = { $in: topics };
      }

      if (difficulties && difficulties.length > 0) {
        query.difficulty = { $in: difficulties };
      }

      if (types && types.length > 0) {
        query.type = { $in: types };
      }

      if (tags && tags.length > 0) {
        query["metadata.tags"] = { $in: tags };
      }

      if (premiumOnly !== undefined) {
        query.premiumOnly = premiumOnly;
      }

      // Date range filter
      if (dateRange && dateRange.start && dateRange.end) {
        query.createdAt = {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end),
        };
      }

      // Execute search
      const skip = (page - 1) * limit;
      let sortOptions = {};

      if (sortBy === "relevance" && keywords) {
        sortOptions = { score: { $meta: "textScore" } };
      } else {
        sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
      }

      const exercises = await Exercise.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number.parseInt(limit))
        .populate("subjectId", "name")
        .populate("topicId", "name");

      const total = await Exercise.countDocuments(query);

      const pagination = {
        currentPage: Number.parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number.parseInt(limit),
      };

      return new ApiResponse(
        200,
        { exercises, pagination },
        "Advanced search completed successfully"
      );
    } catch (error) {
      throw new ApiError(500, `Advanced search failed: ${error.message}`);
    }
  }

  // Get exercise statistics
  async getExerciseStatistics(filters = {}) {
    try {
      const matchStage = { isActive: true };

      if (filters.subjectId) matchStage.subjectId = filters.subjectId;
      if (filters.topicId) matchStage.topicId = filters.topicId;
      if (filters.dateRange) {
        matchStage.createdAt = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end),
        };
      }

      const stats = await Exercise.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalExercises: { $sum: 1 },
            averageRating: { $avg: "$analytics.averageScore" },
            totalAttempts: { $sum: "$analytics.totalAttempts" },
            averageSuccessRate: { $avg: "$analytics.successRate" },
            difficultyDistribution: {
              $push: "$difficulty",
            },
            typeDistribution: {
              $push: "$type",
            },
            premiumCount: {
              $sum: { $cond: ["$premiumOnly", 1, 0] },
            },
            freeCount: {
              $sum: { $cond: ["$premiumOnly", 0, 1] },
            },
          },
        },
      ]);

      // Process difficulty and type distributions
      const result = stats[0] || {};

      if (result.difficultyDistribution) {
        const difficultyCount = {};
        result.difficultyDistribution.forEach((diff) => {
          difficultyCount[diff] = (difficultyCount[diff] || 0) + 1;
        });
        result.difficultyDistribution = difficultyCount;
      }

      if (result.typeDistribution) {
        const typeCount = {};
        result.typeDistribution.forEach((type) => {
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
        result.typeDistribution = typeCount;
      }

      return new ApiResponse(
        200,
        result,
        "Exercise statistics retrieved successfully"
      );
    } catch (error) {
      throw new ApiError(
        500,
        `Failed to get exercise statistics: ${error.message}`
      );
    }
  }
}

module.exports = new ExerciseService();