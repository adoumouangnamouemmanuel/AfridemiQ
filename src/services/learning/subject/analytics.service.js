const { Subject } = require("../../../models/learning/subject.model");
const createLogger = require("../../logging.service");

const logger = createLogger("AnalyticsService");

/**
 * Get comprehensive subject analytics
 */
const getSubjectAnalytics = async (filters = {}) => {
  try {
    const { startDate, endDate, category, series } = filters;

    // Build match conditions
    const matchConditions = { isActive: true };

    if (startDate || endDate) {
      matchConditions.createdAt = {};
      if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
      if (endDate) matchConditions.createdAt.$lte = new Date(endDate);
    }

    if (category) matchConditions.category = category;
    if (series) matchConditions.series = { $in: [series] };

    const analytics = await Subject.aggregate([
      { $match: matchConditions },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalSubjects: { $sum: 1 },
                totalExams: { $sum: "$statistics.totalExams" },
                totalStudents: { $sum: "$statistics.totalStudents" },
                avgRating: { $avg: "$rating.average" },
                avgPopularity: { $avg: "$popularity" },
                avgEstimatedHours: { $avg: "$estimatedHours" },
              },
            },
          ],
          categoryBreakdown: [
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 },
                avgRating: { $avg: "$rating.average" },
                avgPopularity: { $avg: "$popularity" },
                totalExams: { $sum: "$statistics.totalExams" },
                totalStudents: { $sum: "$statistics.totalStudents" },
              },
            },
            { $sort: { count: -1 } },
          ],
          difficultyBreakdown: [
            {
              $group: {
                _id: "$difficulty",
                count: { $sum: 1 },
                avgRating: { $avg: "$rating.average" },
                avgEstimatedHours: { $avg: "$estimatedHours" },
              },
            },
          ],
          seriesBreakdown: [
            { $unwind: "$series" },
            {
              $group: {
                _id: "$series",
                count: { $sum: 1 },
                avgRating: { $avg: "$rating.average" },
                totalExams: { $sum: "$statistics.totalExams" },
              },
            },
            { $sort: { count: -1 } },
          ],
          monthlyTrends: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
                avgRating: { $avg: "$rating.average" },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
          topPerforming: [
            {
              $addFields: {
                performanceScore: {
                  $add: [
                    { $multiply: ["$rating.average", 20] },
                    { $multiply: ["$popularity", 0.1] },
                    { $multiply: ["$statistics.totalStudents", 0.05] },
                  ],
                },
              },
            },
            { $sort: { performanceScore: -1 } },
            { $limit: 10 },
            {
              $project: {
                name: 1,
                category: 1,
                series: 1,
                rating: 1,
                popularity: 1,
                statistics: 1,
                performanceScore: 1,
              },
            },
          ],
          ratingDistribution: [
            {
              $bucket: {
                groupBy: "$rating.average",
                boundaries: [0, 1, 2, 3, 4, 5],
                default: "unrated",
                output: {
                  count: { $sum: 1 },
                  subjects: { $push: "$name" },
                },
              },
            },
          ],
          popularityDistribution: [
            {
              $bucket: {
                groupBy: "$popularity",
                boundaries: [0, 10, 50, 100, 500, 1000],
                default: "very-high",
                output: {
                  count: { $sum: 1 },
                  avgRating: { $avg: "$rating.average" },
                },
              },
            },
          ],
        },
      },
    ]);

    const result = analytics[0];

    return {
      overview: result.overview[0] || {},
      categoryBreakdown: result.categoryBreakdown || [],
      difficultyBreakdown: result.difficultyBreakdown || [],
      seriesBreakdown: result.seriesBreakdown || [],
      monthlyTrends: result.monthlyTrends || [],
      topPerforming: result.topPerforming || [],
      ratingDistribution: result.ratingDistribution || [],
      popularityDistribution: result.popularityDistribution || [],
    };
  } catch (error) {
    logger.error("Error getting subject analytics", error, { filters });
    throw error;
  }
};

/**
 * Get subject performance metrics
 */
const getSubjectPerformance = async (subjectId) => {
  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      throw new Error("Subject not found");
    }

    const performance = await Subject.aggregate([
      { $match: { _id: subject._id } },
      {
        $lookup: {
          from: "subjects",
          let: { currentCategory: "$category", currentSeries: "$series" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$category", "$$currentCategory"] },
                    {
                      $gt: [
                        {
                          $size: {
                            $setIntersection: ["$series", "$$currentSeries"],
                          },
                        },
                        0,
                      ],
                    },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "similarSubjects",
        },
      },
      {
        $addFields: {
          categoryRank: {
            $add: [
              {
                $size: {
                  $filter: {
                    input: "$similarSubjects",
                    cond: { $gt: ["$$this.popularity", "$popularity"] },
                  },
                },
              },
              1,
            ],
          },
          categoryTotal: { $size: "$similarSubjects" },
          percentileRank: {
            $multiply: [
              {
                $divide: [
                  {
                    $size: {
                      $filter: {
                        input: "$similarSubjects",
                        cond: { $lt: ["$$this.popularity", "$popularity"] },
                      },
                    },
                  },
                  { $size: "$similarSubjects" },
                ],
              },
              100,
            ],
          },
        },
      },
      {
        $project: {
          name: 1,
          category: 1,
          series: 1,
          popularity: 1,
          rating: 1,
          statistics: 1,
          categoryRank: 1,
          categoryTotal: 1,
          percentileRank: 1,
          performance: {
            popularityScore: "$popularity",
            ratingScore: { $multiply: ["$rating.average", 20] },
            engagementScore: { $multiply: ["$statistics.totalStudents", 0.1] },
            completionScore: { $multiply: ["$statistics.completionRate", 100] },
          },
        },
      },
    ]);

    return performance[0] || null;
  } catch (error) {
    logger.error("Error getting subject performance", error, { subjectId });
    throw error;
  }
};

/**
 * Get trending subjects
 */
const getTrendingSubjects = async (period = "week", limit = 10) => {
  try {
    let dateThreshold;
    const now = new Date();

    switch (period) {
      case "day":
        dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const trending = await Subject.aggregate([
      {
        $match: {
          isActive: true,
          updatedAt: { $gte: dateThreshold },
        },
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$popularity", 0.4] },
              { $multiply: ["$rating.average", 20] },
              { $multiply: ["$statistics.totalStudents", 0.1] },
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: [now, "$updatedAt"] },
                      1000 * 60 * 60 * 24, // Convert to days
                    ],
                  },
                  -1, // Negative to favor recent updates
                ],
              },
            ],
          },
        },
      },
      { $sort: { trendingScore: -1 } },
      { $limit: limit },
      {
        $project: {
          name: 1,
          category: 1,
          series: 1,
          popularity: 1,
          rating: 1,
          statistics: 1,
          trendingScore: 1,
          updatedAt: 1,
        },
      },
    ]);

    return trending;
  } catch (error) {
    logger.error("Error getting trending subjects", error, { period, limit });
    throw error;
  }
};

/**
 * Get subject comparison data
 */
const compareSubjects = async (subjectIds) => {
  try {
    if (!Array.isArray(subjectIds) || subjectIds.length < 2) {
      throw new Error("At least 2 subject IDs are required for comparison");
    }

    const subjects = await Subject.find({
      _id: { $in: subjectIds },
      isActive: true,
    }).select(
      "name category series difficulty rating popularity statistics estimatedHours tags createdAt"
    );

    if (subjects.length !== subjectIds.length) {
      throw new Error("Some subjects were not found");
    }

    // Calculate comparison metrics
    const comparison = subjects.map((subject) => ({
      id: subject._id,
      name: subject.name,
      category: subject.category,
      series: subject.series,
      difficulty: subject.difficulty,
      rating: subject.rating,
      popularity: subject.popularity,
      statistics: subject.statistics,
      estimatedHours: subject.estimatedHours,
      tags: subject.tags,
      createdAt: subject.createdAt,
      metrics: {
        popularityRank: 0, // Will be calculated below
        ratingRank: 0,
        difficultyLevel:
          subject.difficulty === "facile"
            ? 1
            : subject.difficulty === "moyen"
            ? 2
            : 3,
        engagementScore:
          subject.statistics.totalStudents * 0.1 + subject.popularity * 0.01,
      },
    }));

    // Calculate ranks
    comparison.sort((a, b) => b.popularity - a.popularity);
    comparison.forEach((subject, index) => {
      subject.metrics.popularityRank = index + 1;
    });

    comparison.sort((a, b) => b.rating.average - a.rating.average);
    comparison.forEach((subject, index) => {
      subject.metrics.ratingRank = index + 1;
    });

    // Sort back to original order
    const orderedComparison = subjectIds.map((id) =>
      comparison.find((s) => s.id.toString() === id.toString())
    );

    return {
      subjects: orderedComparison,
      summary: {
        totalSubjects: subjects.length,
        avgRating:
          subjects.reduce((sum, s) => sum + s.rating.average, 0) /
          subjects.length,
        avgPopularity:
          subjects.reduce((sum, s) => sum + s.popularity, 0) / subjects.length,
        avgEstimatedHours:
          subjects.reduce((sum, s) => sum + (s.estimatedHours || 0), 0) /
          subjects.length,
        commonSeries: subjects.reduce((common, s) => {
          if (common.length === 0) return s.series;
          return common.filter((series) => s.series.includes(series));
        }, []),
        categories: [...new Set(subjects.map((s) => s.category))],
        difficulties: [...new Set(subjects.map((s) => s.difficulty))],
      },
    };
  } catch (error) {
    logger.error("Error comparing subjects", error, { subjectIds });
    throw error;
  }
};

module.exports = {
  getSubjectAnalytics,
  getSubjectPerformance,
  getTrendingSubjects,
  compareSubjects,
};
