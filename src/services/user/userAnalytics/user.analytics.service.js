const { UserAnalytics } = require("../../../models/user/user.analytics.model");
const { Subject } = require("../../../models/learning/subject.model");
const NotFoundError = require("../../../errors/notFoundError");

class UserAnalyticsService {
  // Get or create user analytics
  async getOrCreateUserAnalytics(userId) {
    try {
      let analytics = await UserAnalytics.findOne({ userId })
        .populate("subjectStats.subjectId", "name code")
        .populate("mastery.subjectId", "name code");

      if (!analytics) {
        analytics = new UserAnalytics({
          userId,
          dailyStats: [],
          subjectStats: [],
          learningPatterns: {
            preferredStudyTime: "",
            mostProductiveDays: [],
            averageSessionLength: 0,
          },
          mastery: [],
          efficiency: {
            averageResponseTime: 0,
            accuracyRate: 0,
            timeSpentPerTopic: 0,
          },
          personalizedRecommendations: {
            weakTopics: [],
            suggestedStudyPath: [],
            nextMilestone: "",
          },
        });
        await analytics.save();
      }

      return analytics;
    } catch (error) {
      throw error;
    }
  }

  // Add daily stats
  async addDailyStats(userId, statsData) {
    try {
      const analytics = await this.getOrCreateUserAnalytics(userId);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if stats for today already exist
      const existingStatsIndex = analytics.dailyStats.findIndex(
        (stat) => stat.date && stat.date.toDateString() === today.toDateString()
      );

      const newStats = {
        date: today,
        studyTime: statsData.studyTime || 0,
        questionsAnswered: statsData.questionsAnswered || 0,
        correctAnswers: statsData.correctAnswers || 0,
        topicsCovered: statsData.topicsCovered || [],
      };

      if (existingStatsIndex >= 0) {
        // Update existing stats
        analytics.dailyStats[existingStatsIndex] = {
          ...analytics.dailyStats[existingStatsIndex],
          studyTime:
            (analytics.dailyStats[existingStatsIndex].studyTime || 0) +
            newStats.studyTime,
          questionsAnswered:
            (analytics.dailyStats[existingStatsIndex].questionsAnswered || 0) +
            newStats.questionsAnswered,
          correctAnswers:
            (analytics.dailyStats[existingStatsIndex].correctAnswers || 0) +
            newStats.correctAnswers,
          topicsCovered: [
            ...new Set([
              ...analytics.dailyStats[existingStatsIndex].topicsCovered,
              ...newStats.topicsCovered,
            ]),
          ],
        };
      } else {
        analytics.dailyStats.push(newStats);
      }

      analytics.lastUpdated = new Date();
      await analytics.save();

      return analytics;
    } catch (error) {
      throw error;
    }
  }

  // Update subject stats
  async updateSubjectStats(userId, subjectId, statsData) {
    try {
      // Verify subject exists
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        throw new NotFoundError("Matière non trouvée");
      }

      const analytics = await this.getOrCreateUserAnalytics(userId);

      const existingStatsIndex = analytics.subjectStats.findIndex(
        (stat) =>
          stat.subjectId.toString() === subjectId &&
          stat.series === statsData.series
      );

      const newStats = {
        subjectId,
        series: statsData.series,
        averageScore: statsData.averageScore,
        timeSpent: statsData.timeSpent || 0,
        lastStudied: new Date(),
      };

      if (existingStatsIndex >= 0) {
        // Update existing stats
        analytics.subjectStats[existingStatsIndex] = {
          ...analytics.subjectStats[existingStatsIndex],
          ...newStats,
          timeSpent:
            (analytics.subjectStats[existingStatsIndex].timeSpent || 0) +
            newStats.timeSpent,
        };
      } else {
        analytics.subjectStats.push(newStats);
      }

      analytics.lastUpdated = new Date();
      await analytics.save();

      return analytics;
    } catch (error) {
      throw error;
    }
  }

  // Update learning patterns
  async updateLearningPatterns(userId, patternsData) {
    try {
      const analytics = await this.getOrCreateUserAnalytics(userId);

      analytics.learningPatterns = {
        ...analytics.learningPatterns,
        ...patternsData,
      };

      analytics.lastUpdated = new Date();
      await analytics.save();

      return analytics;
    } catch (error) {
      throw error;
    }
  }

  // Update mastery levels
  async updateMastery(userId, subjectId, masteryData) {
    try {
      // Verify subject exists
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        throw new NotFoundError("Matière non trouvée");
      }

      const analytics = await this.getOrCreateUserAnalytics(userId);

      const existingMasteryIndex = analytics.mastery.findIndex(
        (mastery) =>
          mastery.subjectId.toString() === subjectId &&
          mastery.series === masteryData.series
      );

      const newMastery = {
        subjectId,
        series: masteryData.series,
        masteryLevel: masteryData.masteryLevel,
        lastAssessmentDate: new Date(),
        improvementRate: masteryData.improvementRate || 0,
      };

      if (existingMasteryIndex >= 0) {
        analytics.mastery[existingMasteryIndex] = newMastery;
      } else {
        analytics.mastery.push(newMastery);
      }

      analytics.lastUpdated = new Date();
      await analytics.save();

      return analytics;
    } catch (error) {
      throw error;
    }
  }

  // Update efficiency metrics
  async updateEfficiency(userId, efficiencyData) {
    try {
      const analytics = await this.getOrCreateUserAnalytics(userId);

      analytics.efficiency = {
        ...analytics.efficiency,
        ...efficiencyData,
      };

      analytics.lastUpdated = new Date();
      await analytics.save();

      return analytics;
    } catch (error) {
      throw error;
    }
  }

  // Generate personalized recommendations
  async generateRecommendations(userId) {
    try {
      const analytics = await this.getOrCreateUserAnalytics(userId);

      // Analyze weak subjects based on mastery levels
      const weakSubjects = analytics.mastery
        .filter((mastery) => mastery.masteryLevel < 60)
        .map((mastery) => mastery.subjectId.toString());

      // Analyze subjects with low accuracy
      const lowAccuracySubjects = analytics.subjectStats
        .filter((stat) => stat.averageScore < 50)
        .map((stat) => stat.subjectId.toString());

      const weakTopics = [
        ...new Set([...weakSubjects, ...lowAccuracySubjects]),
      ];

      // Generate study path based on mastery levels
      const suggestedStudyPath = analytics.mastery
        .sort((a, b) => a.masteryLevel - b.masteryLevel)
        .slice(0, 5)
        .map((mastery) => mastery.subjectId.toString());

      // Determine next milestone
      const averageMastery = analytics.averageMasteryLevel;
      let nextMilestone = "";
      if (averageMastery < 25) {
        nextMilestone = "Atteindre 25% de maîtrise moyenne";
      } else if (averageMastery < 50) {
        nextMilestone = "Atteindre 50% de maîtrise moyenne";
      } else if (averageMastery < 75) {
        nextMilestone = "Atteindre 75% de maîtrise moyenne";
      } else {
        nextMilestone = "Maintenir l'excellence";
      }

      analytics.personalizedRecommendations = {
        weakTopics,
        suggestedStudyPath,
        nextMilestone,
      };

      analytics.lastUpdated = new Date();
      await analytics.save();

      return analytics.personalizedRecommendations;
    } catch (error) {
      throw error;
    }
  }

  // Get dashboard data
  async getDashboardData(userId) {
    try {
      const analytics = await this.getOrCreateUserAnalytics(userId);

      // Calculate recent performance (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentStats = analytics.dailyStats.filter(
        (stat) => stat.date >= sevenDaysAgo
      );

      const recentStudyTime = recentStats.reduce(
        (total, stat) => total + (stat.studyTime || 0),
        0
      );
      const recentQuestions = recentStats.reduce(
        (total, stat) => total + (stat.questionsAnswered || 0),
        0
      );
      const recentCorrect = recentStats.reduce(
        (total, stat) => total + (stat.correctAnswers || 0),
        0
      );

      return {
        totalStudyTime: analytics.totalStudyTime,
        overallAccuracy: analytics.overallAccuracy,
        averageMasteryLevel: analytics.averageMasteryLevel,
        recentPerformance: {
          studyTime: recentStudyTime,
          questionsAnswered: recentQuestions,
          accuracy:
            recentQuestions > 0 ? (recentCorrect / recentQuestions) * 100 : 0,
        },
        subjectStats: analytics.subjectStats,
        learningPatterns: analytics.learningPatterns,
        recommendations: analytics.personalizedRecommendations,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get detailed report
  async getDetailedReport(userId, startDate, endDate) {
    try {
      const analytics = await this.getOrCreateUserAnalytics(userId);

      let filteredStats = analytics.dailyStats;

      if (startDate || endDate) {
        filteredStats = analytics.dailyStats.filter((stat) => {
          const statDate = new Date(stat.date);
          if (startDate && statDate < new Date(startDate)) return false;
          if (endDate && statDate > new Date(endDate)) return false;
          return true;
        });
      }

      const totalStudyTime = filteredStats.reduce(
        (total, stat) => total + (stat.studyTime || 0),
        0
      );
      const totalQuestions = filteredStats.reduce(
        (total, stat) => total + (stat.questionsAnswered || 0),
        0
      );
      const totalCorrect = filteredStats.reduce(
        (total, stat) => total + (stat.correctAnswers || 0),
        0
      );

      return {
        period: {
          startDate: startDate || "Début",
          endDate: endDate || "Aujourd'hui",
          totalDays: filteredStats.length,
        },
        summary: {
          totalStudyTime,
          totalQuestions,
          totalCorrect,
          accuracy:
            totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
        },
        dailyBreakdown: filteredStats,
        subjectPerformance: analytics.subjectStats,
        masteryProgress: analytics.mastery,
        efficiency: analytics.efficiency,
        recommendations: analytics.personalizedRecommendations,
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get all users analytics
  async getAllUsersAnalytics(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const analytics = await UserAnalytics.find()
        .populate("userId", "name email")
        .populate("subjectStats.subjectId", "name code")
        .sort({ lastUpdated: -1 })
        .skip(skip)
        .limit(limit);

      const total = await UserAnalytics.countDocuments();

      return {
        analytics,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get system statistics
  async getSystemStatistics() {
    try {
      const totalUsers = await UserAnalytics.countDocuments();

      const aggregation = await UserAnalytics.aggregate([
        {
          $group: {
            _id: null,
            totalStudyTime: { $sum: { $sum: "$dailyStats.studyTime" } },
            totalQuestions: { $sum: { $sum: "$dailyStats.questionsAnswered" } },
            totalCorrectAnswers: {
              $sum: { $sum: "$dailyStats.correctAnswers" },
            },
            averageMasteryLevel: { $avg: { $avg: "$mastery.masteryLevel" } },
          },
        },
      ]);

      const stats = aggregation[0] || {
        totalStudyTime: 0,
        totalQuestions: 0,
        totalCorrectAnswers: 0,
        averageMasteryLevel: 0,
      };

      return {
        totalUsers,
        systemWideStats: {
          totalStudyTime: stats.totalStudyTime,
          totalQuestions: stats.totalQuestions,
          totalCorrectAnswers: stats.totalCorrectAnswers,
          overallAccuracy:
            stats.totalQuestions > 0
              ? (stats.totalCorrectAnswers / stats.totalQuestions) * 100
              : 0,
          averageMasteryLevel: stats.averageMasteryLevel || 0,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserAnalyticsService();
