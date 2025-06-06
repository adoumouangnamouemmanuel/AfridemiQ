const { Subject } = require("../../../models/index");
const createLogger = require("../../logging.service");

const logger = createLogger("SearchService");

/**
 * Advanced search with multiple criteria
 */
const advancedSearch = async (searchParams) => {
  try {
    const {
      query,
      category,
      subcategory,
      series,
      difficulty,
      tags,
      minRating,
      maxEstimatedHours,
      minEstimatedHours,
      hasExams,
      isPopular,
      page = 1,
      limit = 20,
      sortBy = "relevance",
      sortOrder = "desc",
    } = searchParams;

    // Build the search pipeline
    const pipeline = [];

    // Match stage - build filter conditions
    const matchConditions = {
      isActive: true,
    };

    // Text search
    if (query) {
      matchConditions.$text = { $search: query };
    }

    // Category filters
    if (category) {
      matchConditions.category = category;
    }

    if (subcategory) {
      matchConditions.subcategory = subcategory;
    }

    // Series filter
    if (series) {
      if (Array.isArray(series)) {
        matchConditions.series = { $in: series };
      } else {
        matchConditions.series = { $in: [series] };
      }
    }

    // Difficulty filter
    if (difficulty) {
      if (Array.isArray(difficulty)) {
        matchConditions.difficulty = { $in: difficulty };
      } else {
        matchConditions.difficulty = difficulty;
      }
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      matchConditions.tags = { $in: tagArray.map((tag) => tag.toLowerCase()) };
    }

    // Rating filter
    if (minRating) {
      matchConditions["rating.average"] = {
        $gte: Number.parseFloat(minRating),
      };
    }

    // Estimated hours filter
    if (minEstimatedHours || maxEstimatedHours) {
      matchConditions.estimatedHours = {};
      if (minEstimatedHours) {
        matchConditions.estimatedHours.$gte =
          Number.parseInt(minEstimatedHours);
      }
      if (maxEstimatedHours) {
        matchConditions.estimatedHours.$lte =
          Number.parseInt(maxEstimatedHours);
      }
    }

    // Has exams filter
    if (hasExams === "true") {
      matchConditions["statistics.totalExams"] = { $gt: 0 };
    } else if (hasExams === "false") {
      matchConditions["statistics.totalExams"] = 0;
    }

    // Popular subjects filter
    if (isPopular === "true") {
      matchConditions.popularity = { $gt: 100 };
    }

    pipeline.push({ $match: matchConditions });

    // Add text score for relevance sorting
    if (query) {
      pipeline.push({
        $addFields: {
          textScore: { $meta: "textScore" },
        },
      });
    }

    // Add computed fields for sorting
    pipeline.push({
      $addFields: {
        examCount: { $size: "$examIds" },
        popularityScore: {
          $add: [
            "$popularity",
            { $multiply: ["$rating.average", 10] },
            { $multiply: ["$statistics.totalStudents", 0.1] },
          ],
        },
      },
    });

    // Sort stage
    const sortStage = {};
    switch (sortBy) {
      case "relevance":
        if (query) {
          sortStage.textScore = sortOrder === "desc" ? -1 : 1;
        } else {
          sortStage.popularityScore = -1;
        }
        break;
      case "name":
        sortStage.name = sortOrder === "desc" ? -1 : 1;
        break;
      case "popularity":
        sortStage.popularity = sortOrder === "desc" ? -1 : 1;
        break;
      case "rating":
        sortStage["rating.average"] = sortOrder === "desc" ? -1 : 1;
        break;
      case "difficulty":
        sortStage.difficulty = sortOrder === "desc" ? -1 : 1;
        break;
      case "estimatedHours":
        sortStage.estimatedHours = sortOrder === "desc" ? -1 : 1;
        break;
      case "examCount":
        sortStage.examCount = sortOrder === "desc" ? -1 : 1;
        break;
      case "createdAt":
        sortStage.createdAt = sortOrder === "desc" ? -1 : 1;
        break;
      default:
        sortStage.popularityScore = -1;
    }

    pipeline.push({ $sort: sortStage });

    // Facet stage for pagination and counting
    pipeline.push({
      $facet: {
        subjects: [
          { $skip: (page - 1) * limit },
          { $limit: Number.parseInt(limit) },
        ],
        totalCount: [{ $count: "count" }],
        facets: [
          {
            $group: {
              _id: null,
              categories: { $addToSet: "$category" },
              difficulties: { $addToSet: "$difficulty" },
              series: { $addToSet: "$series" },
              tags: { $addToSet: "$tags" },
              avgRating: { $avg: "$rating.average" },
              avgEstimatedHours: { $avg: "$estimatedHours" },
              ratingRanges: {
                $push: {
                  $switch: {
                    branches: [
                      {
                        case: { $gte: ["$rating.average", 4.5] },
                        then: "excellent",
                      },
                      {
                        case: { $gte: ["$rating.average", 3.5] },
                        then: "good",
                      },
                      {
                        case: { $gte: ["$rating.average", 2.5] },
                        then: "average",
                      },
                      {
                        case: { $gte: ["$rating.average", 1.5] },
                        then: "poor",
                      },
                    ],
                    default: "unrated",
                  },
                },
              },
            },
          },
        ],
      },
    });

    const results = await Subject.aggregate(pipeline);
    const data = results[0];

    const totalCount = data.totalCount[0]?.count || 0;
    const subjects = data.subjects || [];
    const facets = data.facets[0] || {};

    // Process facets
    const processedFacets = {
      categories: facets.categories || [],
      difficulties: facets.difficulties || [],
      series: facets.series
        ? facets.series.flat().filter((s, i, arr) => arr.indexOf(s) === i)
        : [],
      tags: facets.tags
        ? facets.tags
            .flat()
            .filter((t, i, arr) => arr.indexOf(t) === i)
            .slice(0, 50)
        : [],
      avgRating: facets.avgRating
        ? Math.round(facets.avgRating * 100) / 100
        : 0,
      avgEstimatedHours: facets.avgEstimatedHours
        ? Math.round(facets.avgEstimatedHours)
        : 0,
      ratingDistribution: facets.ratingRanges
        ? facets.ratingRanges.reduce((acc, range) => {
            acc[range] = (acc[range] || 0) + 1;
            return acc;
          }, {})
        : {},
    };

    return {
      subjects,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(totalCount / limit),
        total: totalCount,
        limit: Number.parseInt(limit),
      },
      facets: processedFacets,
      searchParams,
    };
  } catch (error) {
    logger.error("Error in advanced search", error, { searchParams });
    throw error;
  }
};

/**
 * Get search suggestions based on partial query
 */
const getSearchSuggestions = async (query, limit = 10) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    const suggestions = await Subject.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { name: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } },
            { keywords: { $regex: query, $options: "i" } },
          ],
        },
      },
      {
        $project: {
          name: 1,
          category: 1,
          series: 1,
          popularity: 1,
          type: { $literal: "subject" },
        },
      },
      { $sort: { popularity: -1 } },
      { $limit: limit },
    ]);

    // Also get tag suggestions
    const tagSuggestions = await Subject.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$tags" },
      {
        $match: {
          tags: { $regex: query, $options: "i" },
        },
      },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          type: { $literal: "tag" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return [...suggestions, ...tagSuggestions];
  } catch (error) {
    logger.error("Error getting search suggestions", error, { query });
    throw error;
  }
};

/**
 * Get trending searches
 */
const getTrendingSearches = async (limit = 10) => {
  try {
    // This would typically come from a search analytics collection
    // For now, we'll return popular subjects
    const trending = await Subject.find({
      isActive: true,
    })
      .sort({ popularity: -1 })
      .limit(limit)
      .select("name category series popularity");

    return trending.map((subject) => ({
      query: subject.name,
      category: subject.category,
      popularity: subject.popularity,
    }));
  } catch (error) {
    logger.error("Error getting trending searches", error);
    throw error;
  }
};

/**
 * Get related subjects based on similarity
 */
const getRelatedSubjects = async (subjectId, limit = 5) => {
  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return [];
    }

    const related = await Subject.find({
      _id: { $ne: subjectId },
      isActive: true,
      $or: [
        { category: subject.category },
        { series: { $in: subject.series } },
        { tags: { $in: subject.tags } },
        { difficulty: subject.difficulty },
      ],
    })
      .sort({ popularity: -1 })
      .limit(limit)
      .select("name category series difficulty rating popularity");

    return related;
  } catch (error) {
    logger.error("Error getting related subjects", error, { subjectId });
    throw error;
  }
};

module.exports = {
  advancedSearch,
  getSearchSuggestions,
  getTrendingSearches,
  getRelatedSubjects,
};
