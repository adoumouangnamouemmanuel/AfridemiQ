const { TopicProgress } = require("../../models/progress/topic.progress.model");
const { Topic } = require("../../models/learning/topic.model");
const { createLogger } = require("../../services/logging.service");

const logger = createLogger("TopicProgressService");

class TopicProgressService {
  // Get or create topic progress for user
  async getOrCreateTopicProgress(userId, topicId, series = null) {
    try {
      let progress = await TopicProgress.findOne({ userId, topicId })
        .populate("topicId", "name description difficulty")
        .populate("userId", "name email");

      if (!progress) {
        progress = new TopicProgress({
          userId,
          topicId,
          series,
          masteryLevel: "beginner",
          timeSpent: 0,
          practiceSessions: [],
          weakAreas: [],
          strongAreas: [],
        });
        await progress.save();
        await progress.populate("topicId", "name description difficulty");
        await progress.populate("userId", "name email");
      }

      return progress;
    } catch (error) {
      logger.error("Error getting or creating topic progress:", error);
      throw error;
    }
  }

  // Get user's progress for all topics
  async getUserTopicProgress(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.series) query.series = filters.series;
      if (filters.masteryLevel) query.masteryLevel = filters.masteryLevel;
      if (filters.topicId) query.topicId = filters.topicId;

      const progress = await TopicProgress.find(query)
        .populate("topicId", "name description difficulty estimatedTime")
        .sort({ lastStudied: -1 })
        .limit(filters.limit || 50)
        .skip(filters.skip || 0);

      return progress;
    } catch (error) {
      logger.error("Error getting user topic progress:", error);
      throw error;
    }
  }

  // Record practice session
  async recordPracticeSession(userId, topicId, sessionData) {
    try {
      const {
        score,
        timeSpent,
        weakAreas = [],
        strongAreas = [],
      } = sessionData;

      const progress = await this.getOrCreateTopicProgress(userId, topicId);

      // Add practice session
      progress.practiceSessions.push({
        date: new Date(),
        score,
        timeSpent,
      });

      // Update total time spent
      progress.timeSpent += timeSpent;
      progress.lastStudied = new Date();

      // Update weak and strong areas
      if (weakAreas.length > 0) {
        progress.weakAreas = [
          ...new Set([...progress.weakAreas, ...weakAreas]),
        ];
      }
      if (strongAreas.length > 0) {
        progress.strongAreas = [
          ...new Set([...progress.strongAreas, ...strongAreas]),
        ];
      }

      // Update mastery level based on performance
      await this.updateMasteryLevel(progress);

      await progress.save();
      return progress;
    } catch (error) {
      logger.error("Error recording practice session:", error);
      throw error;
    }
  }

  // Update mastery level based on performance
  async updateMasteryLevel(progress) {
    try {
      const recentSessions = progress.practiceSessions
        .slice(-5) // Last 5 sessions
        .filter((session) => session.score !== undefined);

      if (recentSessions.length < 3) return; // Need at least 3 sessions

      const averageScore =
        recentSessions.reduce((sum, session) => sum + session.score, 0) /
        recentSessions.length;
      const totalSessions = progress.practiceSessions.length;

      // Mastery level progression logic
      if (
        averageScore >= 90 &&
        totalSessions >= 10 &&
        progress.masteryLevel !== "mastered"
      ) {
        progress.masteryLevel = "mastered";
      } else if (
        averageScore >= 80 &&
        totalSessions >= 7 &&
        progress.masteryLevel === "beginner"
      ) {
        progress.masteryLevel = "intermediate";
      } else if (
        averageScore >= 85 &&
        totalSessions >= 8 &&
        progress.masteryLevel === "intermediate"
      ) {
        progress.masteryLevel = "advanced";
      }

      logger.info(
        `Updated mastery level for user ${progress.userId} topic ${progress.topicId}: ${progress.masteryLevel}`
      );
    } catch (error) {
      logger.error("Error updating mastery level:", error);
      throw error;
    }
  }

  // Get topic progress analytics
  async getTopicProgressAnalytics(userId, topicId) {
    try {
      const progress = await TopicProgress.findOne({
        userId,
        topicId,
      }).populate("topicId", "name description difficulty");

      if (!progress) {
        return null;
      }

      const analytics = {
        basicInfo: {
          topicName: progress.topicId.name,
          masteryLevel: progress.masteryLevel,
          progressPercentage: progress.progressPercentage,
          totalTimeSpent: progress.timeSpent,
          lastStudied: progress.lastStudied,
        },
        sessionAnalytics: {
          totalSessions: progress.totalSessions,
          averageScore: progress.averageScore,
          studyStreak: progress.studyStreak,
          recentPerformance: progress.practiceSessions.slice(-10),
        },
        strengths: progress.strongAreas,
        weaknesses: progress.weakAreas,
        recommendations: await this.generateRecommendations(progress),
      };

      return analytics;
    } catch (error) {
      logger.error("Error getting topic progress analytics:", error);
      throw error;
    }
  }

  // Generate personalized recommendations
  async generateRecommendations(progress) {
    try {
      const recommendations = [];

      // Based on mastery level
      if (progress.masteryLevel === "beginner" && progress.totalSessions < 5) {
        recommendations.push(
          "Continue practicing basic concepts to build foundation"
        );
      }

      // Based on weak areas
      if (progress.weakAreas.length > 0) {
        recommendations.push(
          `Focus on improving: ${progress.weakAreas.slice(0, 3).join(", ")}`
        );
      }

      // Based on study frequency
      const daysSinceLastStudy = progress.lastStudied
        ? Math.floor(
            (new Date() - new Date(progress.lastStudied)) /
              (1000 * 60 * 60 * 24)
          )
        : 999;

      if (daysSinceLastStudy > 7) {
        recommendations.push(
          "It's been a while since your last study session. Consider reviewing this topic"
        );
      }

      // Based on performance trends
      const recentSessions = progress.practiceSessions.slice(-5);
      if (recentSessions.length >= 3) {
        const trend = this.calculatePerformanceTrend(recentSessions);
        if (trend === "declining") {
          recommendations.push(
            "Your recent scores are declining. Consider reviewing fundamentals"
          );
        } else if (trend === "improving") {
          recommendations.push(
            "Great improvement! Consider advancing to more challenging material"
          );
        }
      }

      return recommendations;
    } catch (error) {
      logger.error("Error generating recommendations:", error);
      return [];
    }
  }

  // Calculate performance trend
  calculatePerformanceTrend(sessions) {
    if (sessions.length < 3) return "stable";

    const firstHalf = sessions.slice(0, Math.floor(sessions.length / 2));
    const secondHalf = sessions.slice(Math.floor(sessions.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, s) => sum + s.score, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, s) => sum + s.score, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 5) return "improving";
    if (difference < -5) return "declining";
    return "stable";
  }

  // Get user's overall progress statistics
  async getUserProgressStatistics(userId) {
    try {
      const allProgress = await TopicProgress.find({ userId }).populate(
        "topicId",
        "name subjectId"
      );

      const stats = {
        totalTopics: allProgress.length,
        masteryDistribution: {
          beginner: 0,
          intermediate: 0,
          advanced: 0,
          mastered: 0,
        },
        totalTimeSpent: 0,
        totalSessions: 0,
        averageScore: 0,
        activeStreak: 0,
        subjectProgress: {},
      };

      let totalScores = 0;
      let totalSessionsWithScores = 0;

      allProgress.forEach((progress) => {
        // Mastery distribution
        stats.masteryDistribution[progress.masteryLevel]++;

        // Time and sessions
        stats.totalTimeSpent += progress.timeSpent;
        stats.totalSessions += progress.totalSessions;

        // Average score calculation
        progress.practiceSessions.forEach((session) => {
          if (session.score !== undefined) {
            totalScores += session.score;
            totalSessionsWithScores++;
          }
        });

        // Subject progress
        const subjectId = progress.topicId.subjectId?.toString();
        if (subjectId) {
          if (!stats.subjectProgress[subjectId]) {
            stats.subjectProgress[subjectId] = {
              totalTopics: 0,
              masteredTopics: 0,
              timeSpent: 0,
            };
          }
          stats.subjectProgress[subjectId].totalTopics++;
          if (progress.masteryLevel === "mastered") {
            stats.subjectProgress[subjectId].masteredTopics++;
          }
          stats.subjectProgress[subjectId].timeSpent += progress.timeSpent;
        }
      });

      stats.averageScore =
        totalSessionsWithScores > 0
          ? Math.round(totalScores / totalSessionsWithScores)
          : 0;

      return stats;
    } catch (error) {
      logger.error("Error getting user progress statistics:", error);
      throw error;
    }
  }

  // Update weak/strong areas
  async updateAreasOfFocus(
    userId,
    topicId,
    { weakAreas = [], strongAreas = [] }
  ) {
    try {
      const progress = await TopicProgress.findOne({ userId, topicId });
      if (!progress) {
        throw new Error("Topic progress not found");
      }

      progress.weakAreas = [...new Set(weakAreas)];
      progress.strongAreas = [...new Set(strongAreas)];

      await progress.save();
      return progress;
    } catch (error) {
      logger.error("Error updating areas of focus:", error);
      throw error;
    }
  }

  // Delete topic progress
  async deleteTopicProgress(userId, topicId) {
    try {
      const result = await TopicProgress.findOneAndDelete({ userId, topicId });
      if (!result) {
        throw new Error("Topic progress not found");
      }
      return result;
    } catch (error) {
      logger.error("Error deleting topic progress:", error);
      throw error;
    }
  }
}

module.exports = new TopicProgressService();