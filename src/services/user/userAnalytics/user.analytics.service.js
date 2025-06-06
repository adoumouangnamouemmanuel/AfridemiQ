const { UserAnalytics } = require("../../../models/user/user.analytics.model");
const createLogger  = require("../../logging.service");

const logger = createLogger("UserAnalyticsService");

const getOrCreateUserAnalytics = async (userId) => {
  try {
    let analytics = await UserAnalytics.findOne({ userId }).populate(
      "subjectStats.subjectId mastery.subjectId"
    );

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
      logger.info(`Created new analytics for user: ${userId}`);
    }

    return analytics;
  } catch (error) {
    logger.error("Error getting or creating user analytics:", error);
    throw error;
  }
};

const addDailyStats = async (userId, dailyStatsData) => {
  try {
    const analytics = await getOrCreateUserAnalytics(userId);

    // Check if stats for today already exist
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingStatsIndex = analytics.dailyStats.findIndex((stat) => {
      const statDate = new Date(stat.date);
      statDate.setHours(0, 0, 0, 0);
      return statDate.getTime() === today.getTime();
    });

    if (existingStatsIndex !== -1) {
      // Update existing stats
      analytics.dailyStats[existingStatsIndex] = {
        ...analytics.dailyStats[existingStatsIndex],
        ...dailyStatsData,
        date: today,
      };
    } else {
      // Add new stats
      analytics.dailyStats.push({
        ...dailyStatsData,
        date: today,
      });
    }

    analytics.lastUpdated = new Date();
    await analytics.save();

    logger.info(`Daily stats added for user: ${userId}`);
    return analytics;
  } catch (error) {
    logger.error("Error adding daily stats:", error);
    throw error;
  }
};

const updateSubjectStats = async (userId, subjectId, subjectStatsData) => {
  try {
    const analytics = await getOrCreateUserAnalytics(userId);

    const existingStatsIndex = analytics.subjectStats.findIndex(
      (stat) => stat.subjectId.toString() === subjectId
    );

    if (existingStatsIndex !== -1) {
      // Update existing subject stats
      analytics.subjectStats[existingStatsIndex] = {
        ...analytics.subjectStats[existingStatsIndex],
        ...subjectStatsData,
        lastStudied: new Date(),
      };
    } else {
      // Add new subject stats
      analytics.subjectStats.push({
        subjectId,
        ...subjectStatsData,
        lastStudied: new Date(),
      });
    }

    analytics.lastUpdated = new Date();
    await analytics.save();

    logger.info(
      `Subject stats updated for user: ${userId}, subject: ${subjectId}`
    );
    return analytics;
  } catch (error) {
    logger.error("Error updating subject stats:", error);
    throw error;
  }
};

const updateLearningPatterns = async (userId, learningPatternsData) => {
  try {
    const analytics = await getOrCreateUserAnalytics(userId);

    analytics.learningPatterns = {
      ...analytics.learningPatterns,
      ...learningPatternsData,
    };

    analytics.lastUpdated = new Date();
    await analytics.save();

    logger.info(`Learning patterns updated for user: ${userId}`);
    return analytics;
  } catch (error) {
    logger.error("Error updating learning patterns:", error);
    throw error;
  }
};

const updateMastery = async (userId, subjectId, masteryData) => {
  try {
    const analytics = await getOrCreateUserAnalytics(userId);

    const existingMasteryIndex = analytics.mastery.findIndex(
      (mastery) => mastery.subjectId.toString() === subjectId
    );

    if (existingMasteryIndex !== -1) {
      // Update existing mastery
      analytics.mastery[existingMasteryIndex] = {
        ...analytics.mastery[existingMasteryIndex],
        ...masteryData,
        lastAssessmentDate: new Date(),
      };
    } else {
      // Add new mastery
      analytics.mastery.push({
        subjectId,
        ...masteryData,
        lastAssessmentDate: new Date(),
      });
    }

    analytics.lastUpdated = new Date();
    await analytics.save();

    logger.info(`Mastery updated for user: ${userId}, subject: ${subjectId}`);
    return analytics;
  } catch (error) {
    logger.error("Error updating mastery:", error);
    throw error;
  }
};

const updateEfficiency = async (userId, efficiencyData) => {
  try {
    const analytics = await getOrCreateUserAnalytics(userId);

    analytics.efficiency = {
      ...analytics.efficiency,
      ...efficiencyData,
    };

    analytics.lastUpdated = new Date();
    await analytics.save();

    logger.info(`Efficiency updated for user: ${userId}`);
    return analytics;
  } catch (error) {
    logger.error("Error updating efficiency:", error);
    throw error;
  }
};

const generateDashboardData = async (userId) => {
  try {
    const analytics = await getOrCreateUserAnalytics(userId);

    // Calculate summary statistics
    const totalStudyTime = analytics.dailyStats.reduce(
      (total, stat) => total + (stat.studyTime || 0),
      0
    );
    const totalQuestionsAnswered = analytics.dailyStats.reduce(
      (total, stat) => total + (stat.questionsAnswered || 0),
      0
    );
    const totalCorrectAnswers = analytics.dailyStats.reduce(
      (total, stat) => total + (stat.correctAnswers || 0),
      0
    );

    const overallAccuracy =
      totalQuestionsAnswered > 0
        ? (totalCorrectAnswers / totalQuestionsAnswered) * 100
        : 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = analytics.dailyStats.filter(
      (stat) => new Date(stat.date) >= sevenDaysAgo
    );

    // Get subject performance
    const subjectPerformance = analytics.subjectStats.map((stat) => ({
      subjectId: stat.subjectId,
      series: stat.series,
      averageScore: stat.averageScore,
      timeSpent: stat.timeSpent,
      lastStudied: stat.lastStudied,
    }));

    // Get mastery levels
    const masteryLevels = analytics.mastery.map((mastery) => ({
      subjectId: mastery.subjectId,
      series: mastery.series,
      masteryLevel: mastery.masteryLevel,
      improvementRate: mastery.improvementRate,
    }));

    const dashboardData = {
      summary: {
        totalStudyTime,
        totalQuestionsAnswered,
        overallAccuracy: Math.round(overallAccuracy * 100) / 100,
        averageSessionLength: analytics.learningPatterns.averageSessionLength,
      },
      recentActivity,
      subjectPerformance,
      masteryLevels,
      efficiency: analytics.efficiency,
      recommendations: analytics.personalizedRecommendations,
    };

    logger.info(`Dashboard data generated for user: ${userId}`);
    return dashboardData;
  } catch (error) {
    logger.error("Error generating dashboard data:", error);
    throw error;
  }
};

const generateDetailedReport = async (userId, options = {}) => {
  try {
    const { startDate, endDate } = options;
    const analytics = await getOrCreateUserAnalytics(userId);

    let filteredDailyStats = analytics.dailyStats;

    // Apply date filters if provided
    if (startDate || endDate) {
      filteredDailyStats = analytics.dailyStats.filter((stat) => {
        const statDate = new Date(stat.date);
        if (startDate && statDate < new Date(startDate)) return false;
        if (endDate && statDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Calculate detailed statistics
    const totalStudyTime = filteredDailyStats.reduce(
      (total, stat) => total + (stat.studyTime || 0),
      0
    );
    const totalQuestionsAnswered = filteredDailyStats.reduce(
      (total, stat) => total + (stat.questionsAnswered || 0),
      0
    );
    const totalCorrectAnswers = filteredDailyStats.reduce(
      (total, stat) => total + (stat.correctAnswers || 0),
      0
    );

    const averageStudyTime =
      filteredDailyStats.length > 0
        ? totalStudyTime / filteredDailyStats.length
        : 0;
    const overallAccuracy =
      totalQuestionsAnswered > 0
        ? (totalCorrectAnswers / totalQuestionsAnswered) * 100
        : 0;

    // Calculate trends
    const studyTimeTrend = calculateTrend(
      filteredDailyStats.map((stat) => stat.studyTime || 0)
    );
    const accuracyTrend = calculateTrend(
      filteredDailyStats.map((stat) =>
        stat.questionsAnswered > 0
          ? (stat.correctAnswers / stat.questionsAnswered) * 100
          : 0
      )
    );

    const report = {
      period: {
        startDate:
          startDate ||
          (filteredDailyStats.length > 0 ? filteredDailyStats[0].date : null),
        endDate:
          endDate ||
          (filteredDailyStats.length > 0
            ? filteredDailyStats[filteredDailyStats.length - 1].date
            : null),
        totalDays: filteredDailyStats.length,
      },
      summary: {
        totalStudyTime,
        averageStudyTime: Math.round(averageStudyTime * 100) / 100,
        totalQuestionsAnswered,
        totalCorrectAnswers,
        overallAccuracy: Math.round(overallAccuracy * 100) / 100,
      },
      trends: {
        studyTime: studyTimeTrend,
        accuracy: accuracyTrend,
      },
      dailyBreakdown: filteredDailyStats,
      subjectPerformance: analytics.subjectStats,
      masteryProgress: analytics.mastery,
      learningPatterns: analytics.learningPatterns,
      efficiency: analytics.efficiency,
    };

    logger.info(`Detailed report generated for user: ${userId}`);
    return report;
  } catch (error) {
    logger.error("Error generating detailed report:", error);
    throw error;
  }
};

const generateRecommendations = async (userId) => {
  try {
    const analytics = await getOrCreateUserAnalytics(userId);

    // Analyze weak areas
    const weakSubjects = analytics.subjectStats
      .filter((stat) => stat.averageScore < 60)
      .map((stat) => stat.subjectId);

    // Analyze mastery levels
    const lowMasterySubjects = analytics.mastery
      .filter((mastery) => mastery.masteryLevel < 50)
      .map((mastery) => mastery.subjectId);

    // Combine weak areas
    const allWeakAreas = [...new Set([...weakSubjects, ...lowMasterySubjects])];

    // Generate study path recommendations
    const suggestedStudyPath = [];
    if (allWeakAreas.length > 0) {
      suggestedStudyPath.push("Concentrez-vous sur les matières faibles");
      suggestedStudyPath.push("Augmentez le temps d'étude quotidien");
      suggestedStudyPath.push("Pratiquez plus d'exercices");
    }

    // Determine next milestone
    let nextMilestone = "Continuez vos efforts d'apprentissage";
    if (analytics.efficiency.accuracyRate < 70) {
      nextMilestone = "Améliorer la précision à 70%";
    } else if (analytics.efficiency.accuracyRate < 85) {
      nextMilestone = "Atteindre 85% de précision";
    }

    const recommendations = {
      weakTopics: allWeakAreas,
      suggestedStudyPath,
      nextMilestone,
      studyTimeRecommendation:
        analytics.learningPatterns.averageSessionLength < 30
          ? "Augmentez vos sessions d'étude à au moins 30 minutes"
          : "Maintenez votre rythme d'étude actuel",
      focusAreas:
        allWeakAreas.length > 0
          ? "Concentrez-vous sur les matières identifiées comme faibles"
          : "Continuez à maintenir vos performances actuelles",
    };

    // Update recommendations in analytics
    analytics.personalizedRecommendations = {
      weakTopics: allWeakAreas.map((id) => id.toString()),
      suggestedStudyPath,
      nextMilestone,
    };

    analytics.lastUpdated = new Date();
    await analytics.save();

    logger.info(`Recommendations generated for user: ${userId}`);
    return recommendations;
  } catch (error) {
    logger.error("Error generating recommendations:", error);
    throw error;
  }
};

const getAllUsersAnalytics = async (options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const analytics = await UserAnalytics.find()
      .populate("userId", "name email")
      .populate("subjectStats.subjectId", "name")
      .populate("mastery.subjectId", "name")
      .skip(skip)
      .limit(limit)
      .sort({ lastUpdated: -1 });

    const total = await UserAnalytics.countDocuments();

    logger.info(`Retrieved ${analytics.length} user analytics records`);
    return {
      analytics,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    logger.error("Error getting all users analytics:", error);
    throw error;
  }
};

const getSystemStatistics = async () => {
  try {
    const totalUsers = await UserAnalytics.countDocuments();

    // Calculate system-wide statistics
    const allAnalytics = await UserAnalytics.find();

    let totalStudyTime = 0;
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;
    let activeUsers = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    allAnalytics.forEach((analytics) => {
      // Check if user was active in last 30 days
      const recentActivity = analytics.dailyStats.some(
        (stat) => new Date(stat.date) >= thirtyDaysAgo
      );
      if (recentActivity) activeUsers++;

      // Sum up all statistics
      analytics.dailyStats.forEach((stat) => {
        totalStudyTime += stat.studyTime || 0;
        totalQuestionsAnswered += stat.questionsAnswered || 0;
        totalCorrectAnswers += stat.correctAnswers || 0;
      });
    });

    const averageAccuracy =
      totalQuestionsAnswered > 0
        ? (totalCorrectAnswers / totalQuestionsAnswered) * 100
        : 0;
    const averageStudyTimePerUser =
      totalUsers > 0 ? totalStudyTime / totalUsers : 0;

    const statistics = {
      totalUsers,
      activeUsers,
      userEngagement: {
        activeUserRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      },
      studyMetrics: {
        totalStudyTime,
        averageStudyTimePerUser:
          Math.round(averageStudyTimePerUser * 100) / 100,
        totalQuestionsAnswered,
        totalCorrectAnswers,
        systemWideAccuracy: Math.round(averageAccuracy * 100) / 100,
      },
      generatedAt: new Date(),
    };

    logger.info("System statistics generated");
    return statistics;
  } catch (error) {
    logger.error("Error getting system statistics:", error);
    throw error;
  }
};

// Helper function to calculate trend
const calculateTrend = (values) => {
  if (values.length < 2) return 0;

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg =
    firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  return secondAvg - firstAvg;
};

module.exports = {
  getOrCreateUserAnalytics,
  addDailyStats,
  updateSubjectStats,
  updateLearningPatterns,
  updateMastery,
  updateEfficiency,
  generateDashboardData,
  generateDetailedReport,
  generateRecommendations,
  getAllUsersAnalytics,
  getSystemStatistics,
};