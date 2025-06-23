const { Assessment } = require("../../../models/assessment/assessment.model");
const { Question } = require("../../../models/assessment/question.model");
const { ApiError } = require("../../../utils/ApiError"); 

class AssessmentService {
  // Create assessment
  async createAssessment(assessmentData) {
    try {
      // Validate questions exist
      if (assessmentData.questionIds && assessmentData.questionIds.length > 0) {
        const questions = await Question.find({
          _id: { $in: assessmentData.questionIds },
        });

        if (questions.length !== assessmentData.questionIds.length) {
          throw new ApiError(400, "Some questions not found");
        }

        // Calculate total marks
        assessmentData.totalMarks = questions.reduce(
          (sum, q) => sum + q.points,
          0
        );
      }

      const assessment = new Assessment(assessmentData);
      await assessment.save();

      return await this.getAssessmentById(assessment._id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error creating assessment: ${error.message}`);
    }
  }

  // Get assessment by ID
  async getAssessmentById(assessmentId) {
    try {
      const assessment = await Assessment.findById(assessmentId)
        .populate("subjectId", "name code description")
        .populate("topicIds", "name description")
        .populate("questionIds", "question format difficulty points")
        .populate("creatorId", "name email");

      if (!assessment) {
        throw new ApiError(404, "Assessment not found");
      }

      return assessment;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error fetching assessment: ${error.message}`);
    }
  }

  // Get all assessments with filters
  async getAssessments(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        subjectId,
        level,
        format,
        difficulty,
        status,
        premiumOnly,
        creatorId,
      } = { ...filters, ...options };

      // Build query
      const query = { isActive: true };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      if (subjectId) query.subjectId = subjectId;
      if (level) query.level = level;
      if (format) query.format = format;
      if (difficulty) query.difficulty = difficulty;
      if (status) query.status = status;
      if (premiumOnly !== undefined) query.premiumOnly = premiumOnly;
      if (creatorId) query.creatorId = creatorId;

      // Execute query
      const assessments = await Assessment.find(query)
        .populate("subjectId", "name code")
        .populate("topicIds", "name")
        .populate("creatorId", "name email")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await Assessment.countDocuments(query);

      return {
        assessments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalAssessments: total,
      };
    } catch (error) {
      throw new ApiError(500, `Error fetching assessments: ${error.message}`);
    }
  }

  // Update assessment
  async updateAssessment(assessmentId, updateData) {
    try {
      // Validate questions if being updated
      if (updateData.questionIds) {
        const questions = await Question.find({
          _id: { $in: updateData.questionIds },
        });

        if (questions.length !== updateData.questionIds.length) {
          throw new ApiError(400, "Some questions not found");
        }

        // Recalculate total marks
        updateData.totalMarks = questions.reduce((sum, q) => sum + q.points, 0);
      }

      const assessment = await Assessment.findByIdAndUpdate(
        assessmentId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!assessment) {
        throw new ApiError(404, "Assessment not found");
      }

      return await this.getAssessmentById(assessmentId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error updating assessment: ${error.message}`);
    }
  }

  // Delete assessment (soft delete)
  async deleteAssessment(assessmentId) {
    try {
      const assessment = await Assessment.findByIdAndUpdate(
        assessmentId,
        { $set: { isActive: false, status: "archived" } },
        { new: true }
      );

      if (!assessment) {
        throw new ApiError(404, "Assessment not found");
      }

      return { message: "Assessment deleted successfully" };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error deleting assessment: ${error.message}`);
    }
  }

  // Get assessments by subject
  async getAssessmentsBySubject(subjectId, options = {}) {
    try {
      return await Assessment.findBySubject(subjectId, options);
    } catch (error) {
      throw new ApiError(
        500,
        `Error fetching assessments by subject: ${error.message}`
      );
    }
  }

  // Get published assessments
  async getPublishedAssessments(filters = {}) {
    try {
      return await Assessment.findPublished(filters);
    } catch (error) {
      throw new ApiError(
        500,
        `Error fetching published assessments: ${error.message}`
      );
    }
  }

  // Publish assessment
  async publishAssessment(assessmentId) {
    try {
      const assessment = await Assessment.findById(assessmentId);

      if (!assessment) {
        throw new ApiError(404, "Assessment not found");
      }

      // Validate assessment has questions
      if (!assessment.questionIds || assessment.questionIds.length === 0) {
        throw new ApiError(400, "Cannot publish assessment without questions");
      }

      assessment.status = "published";
      await assessment.save();

      return await this.getAssessmentById(assessmentId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error publishing assessment: ${error.message}`);
    }
  }

  // Get assessment analytics
  async getAssessmentAnalytics(assessmentId) {
    try {
      const assessment = await Assessment.findById(assessmentId);

      if (!assessment) {
        throw new ApiError(404, "Assessment not found");
      }

      return {
        id: assessment._id,
        title: assessment.title,
        analytics: assessment.analytics,
        questionCount: assessment.questionCount,
        totalMarks: assessment.totalMarks,
        passingScore: assessment.passingScore,
        difficulty: assessment.difficulty,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        `Error fetching assessment analytics: ${error.message}`
      );
    }
  }

  // Bulk operations
  async bulkUpdateAssessments(assessmentIds, updateData) {
    try {
      const result = await Assessment.updateMany(
        { _id: { $in: assessmentIds }, isActive: true },
        { $set: updateData }
      );

      return {
        message: `${result.modifiedCount} assessments updated successfully`,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      throw new ApiError(
        500,
        `Error bulk updating assessments: ${error.message}`
      );
    }
  }

  async bulkDeleteAssessments(assessmentIds) {
    try {
      const result = await Assessment.updateMany(
        { _id: { $in: assessmentIds } },
        { $set: { isActive: false, status: "archived" } }
      );

      return {
        message: `${result.modifiedCount} assessments deleted successfully`,
        deletedCount: result.modifiedCount,
      };
    } catch (error) {
      throw new ApiError(
        500,
        `Error bulk deleting assessments: ${error.message}`
      );
    }
  }
}

module.exports = new AssessmentService();