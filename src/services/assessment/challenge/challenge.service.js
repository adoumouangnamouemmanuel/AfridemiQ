const { Challenge } = require("../../../models/assessment/challenge.model");
const { Question } = require("../../../models/assessment/question.model");
const { ApiError } = require("../../../utils/ApiError");
const createLogger = require("../../logging.service");

const logger = createLogger("ChallengeService");

class ChallengeService {
  // Create challenge
  async createChallenge(challengeData) {
    try {
      // Validate questions exist
      if (challengeData.questionIds && challengeData.questionIds.length > 0) {
        const questions = await Question.find({
          _id: { $in: challengeData.questionIds },
        });

        if (questions.length !== challengeData.questionIds.length) {
          throw new ApiError(400, "Some questions not found");
        }
      }

      // Validate dates
      if (challengeData.scheduling) {
        const { startDate, endDate, registrationDeadline } =
          challengeData.scheduling;

        if (new Date(startDate) <= new Date()) {
          throw new ApiError(400, "Start date must be in the future");
        }

        if (new Date(endDate) <= new Date(startDate)) {
          throw new ApiError(400, "End date must be after start date");
        }

        if (
          registrationDeadline &&
          new Date(registrationDeadline) >= new Date(startDate)
        ) {
          throw new ApiError(
            400,
            "Registration deadline must be before start date"
          );
        }
      }

      const challenge = new Challenge(challengeData);
      await challenge.save();
      logger.info(`Challenge created successfully: ${challenge._id}`);
      return await this.getChallengeById(challenge._id);
    } catch (error) {
      logger.error("Error creating challenge:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error creating challenge: ${error.message}`);
    }
  }

  // Get challenge by ID
  async getChallengeById(challengeId) {
    try {
      const challenge = await Challenge.findById(challengeId)
        .populate("creatorId", "name email")
        .populate("subjectId", "name code description")
        .populate("topicId", "name description")
        .populate("questionIds", "question format difficulty points")
        .populate("participants", "name email")
        .populate("winners.userId", "name email");

      if (!challenge) {
        throw new ApiError(404, "Challenge not found");
      }

      logger.info(`Challenge retrieved successfully: ${challengeId}`);
      return challenge;
    } catch (error) {
      logger.error("Error retrieving challenge:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error fetching challenge: ${error.message}`);
    }
  }

  // Get all challenges with filters
  async getChallenges(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search,
        subjectId,
        topicId,
        level,
        difficulty,
        status,
        creatorId,
        premiumOnly,
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
      if (topicId) query.topicId = topicId;
      if (level) query.level = level;
      if (difficulty) query.difficulty = difficulty;
      if (status) query.status = status;
      if (creatorId) query.creatorId = creatorId;
      if (premiumOnly !== undefined) query.premiumOnly = premiumOnly;

      // Execute query
      const challenges = await Challenge.find(query)
        .populate("creatorId", "name email")
        .populate("subjectId", "name code")
        .populate("topicId", "name")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await Challenge.countDocuments(query);
      logger.info(`Retrieved ${challenges.length} challenges out of ${total} total`);
      return {
        challenges,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalChallenges: total,
      };
    } catch (error) {
      logger.error("Error retrieving challenges:", error);
      throw new ApiError(500, `Error fetching challenges: ${error.message}`);
    }
  }

  // Update challenge
  async updateChallenge(challengeId, updateData) {
    try {
      const challenge = await Challenge.findById(challengeId);

      if (!challenge) {
        throw new ApiError(404, "Challenge not found");
      }

      // Prevent updates to active or completed challenges
      if (["active", "completed"].includes(challenge.status)) {
        throw new ApiError(400, "Cannot update active or completed challenges");
      }

      // Validate questions if being updated
      if (updateData.questionIds) {
        const questions = await Question.find({
          _id: { $in: updateData.questionIds },
        });

        if (questions.length !== updateData.questionIds.length) {
          throw new ApiError(400, "Some questions not found");
        }
      }

      const updatedChallenge = await Challenge.findByIdAndUpdate(
        challengeId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      logger.info(`Challenge updated successfully: ${challengeId}`);
      return await this.getChallengeById(challengeId);
    } catch (error) {
      logger.error("Error updating challenge:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error updating challenge: ${error.message}`);
    }
  }

  // Delete challenge (soft delete)
  async deleteChallenge(challengeId) {
    try {
      const challenge = await Challenge.findById(challengeId);

      if (!challenge) {
        throw new ApiError(404, "Challenge not found");
      }

      // Prevent deletion of active challenges
      if (challenge.status === "active") {
        throw new ApiError(400, "Cannot delete active challenges");
      }

      challenge.isActive = false;
      challenge.status = "cancelled";
      await challenge.save();
      logger.info(`Challenge deleted successfully: ${challengeId}`);
      return { message: "Challenge deleted successfully" };
    } catch (error) {
      logger.error("Error deleting challenge:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error deleting challenge: ${error.message}`);
    }
  }

  // Join challenge
  async joinChallenge(challengeId, userId) {
    try {
      const challenge = await Challenge.findById(challengeId);

      if (!challenge) {
        throw new ApiError(404, "Challenge not found");
      }

      if (!challenge.canUserJoin(userId)) {
        throw new ApiError(400, "Cannot join this challenge");
      }

      await challenge.addParticipant(userId);
      logger.info(`User ${userId} joined challenge ${challengeId}`);
      return await this.getChallengeById(challengeId);
    } catch (error) {
      logger.error("Error joining challenge:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error joining challenge: ${error.message}`);
    }
  }

  // Leave challenge
  async leaveChallenge(challengeId, userId) {
    try {
      const challenge = await Challenge.findById(challengeId);

      if (!challenge) {
        throw new ApiError(404, "Challenge not found");
      }

      if (challenge.status === "active") {
        throw new ApiError(400, "Cannot leave active challenges");
      }

      await challenge.removeParticipant(userId);
      logger.info(`User ${userId} left challenge ${challengeId}`);
      return { message: "Left challenge successfully" };
    } catch (error) {
      logger.error("Error leaving challenge:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error leaving challenge: ${error.message}`);
    }
  }

  // Get active challenges
  async getActiveChallenges() {
    try {
      const challenges = await Challenge.findActive();
      logger.info(`Retrieved ${challenges.length} active challenges`);
      return challenges;
    } catch (error) {
      logger.error("Error retrieving active challenges:", error);
      throw new ApiError(
        500,
        `Error fetching active challenges: ${error.message}`
      );
    }
  }

  // Get open challenges
  async getOpenChallenges() {
    try {
      return await Challenge.findOpen();
    } catch (error) {
      throw new ApiError(
        500,
        `Error fetching open challenges: ${error.message}`
      );
    }
  }

  // Get challenges by subject
  async getChallengesBySubject(subjectId) {
    try {
      return await Challenge.findBySubject(subjectId);
    } catch (error) {
      throw new ApiError(
        500,
        `Error fetching challenges by subject: ${error.message}`
      );
    }
  }

  // Start challenge
  async startChallenge(challengeId) {
    try {
      const challenge = await Challenge.findById(challengeId);

      if (!challenge) {
        throw new ApiError(404, "Challenge not found");
      }

      if (challenge.status !== "open") {
        throw new ApiError(400, "Challenge is not open for starting");
      }

      challenge.status = "active";
      await challenge.save();

      return await this.getChallengeById(challengeId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error starting challenge: ${error.message}`);
    }
  }

  // Complete challenge
  async completeChallenge(challengeId) {
    try {
      const challenge = await Challenge.findById(challengeId);

      if (!challenge) {
        throw new ApiError(404, "Challenge not found");
      }

      challenge.status = "completed";
      await challenge.updateAnalytics();

      return await this.getChallengeById(challengeId);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error completing challenge: ${error.message}`);
    }
  }

  // Submit challenge result
  async submitChallengeResult(challengeId, userId, resultData) {
    try {
      const challenge = await Challenge.findById(challengeId);

      if (!challenge) {
        throw new ApiError(404, "Challenge not found");
      }

      if (challenge.status !== "active") {
        throw new ApiError(400, "Challenge is not active");
      }

      if (!challenge.participants.includes(userId)) {
        throw new ApiError(400, "User is not a participant in this challenge");
      }

      const winnerData = {
        userId,
        score: resultData.score,
        timeSpent: resultData.timeSpent,
        completedAt: new Date(),
      };

      await challenge.addWinner(winnerData);

      return { message: "Challenge result submitted successfully" };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        `Error submitting challenge result: ${error.message}`
      );
    }
  }

  // Get challenge leaderboard
  async getChallengeLeaderboard(challengeId) {
    try {
      const challenge = await Challenge.findById(challengeId)
        .populate("winners.userId", "name email")
        .select("title winners prizes");

      if (!challenge) {
        throw new ApiError(404, "Challenge not found");
      }

      return {
        challengeTitle: challenge.title,
        leaderboard: challenge.winners,
        prizes: challenge.prizes,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        `Error fetching challenge leaderboard: ${error.message}`
      );
    }
  }
}

module.exports = new ChallengeService();