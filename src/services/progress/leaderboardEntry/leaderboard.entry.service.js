const {
  LeaderboardEntry,
} = require("../../../models/progress/leaderboard.entry.model");
const createLogger = require("../../logging.service");

const logger = createLogger("LeaderboardEntryService");

class LeaderboardEntryService {
  // Get or create leaderboard entry
  async getOrCreateEntry(userId, series = null) {
    try {
      let entry = await LeaderboardEntry.findOne({ userId, series }).populate(
        "userId",
        "name email country region"
      );

      if (!entry) {
        entry = new LeaderboardEntry({
          userId,
          series,
          nationalRank: 999999,
          regionalRank: 999999,
          globalRank: 999999,
          badgeCount: 0,
          streak: 0,
        });
        await entry.save();
        await entry.populate("userId", "name email country region");
      }

      return entry;
    } catch (error) {
      logger.error("Error getting/creating leaderboard entry:", error);
      throw error;
    }
  }

  // Update user rank
  async updateRank(userId, rankData, series = null) {
    try {
      const entry = await LeaderboardEntry.findOne({ userId, series });
      if (!entry) {
        throw new Error("Leaderboard entry not found");
      }

      // Store previous rank in history
      entry.history.push({
        date: new Date(),
        rank: entry.globalRank,
        points: entry.totalPoints,
      });

      // Update ranks
      if (rankData.nationalRank) entry.nationalRank = rankData.nationalRank;
      if (rankData.regionalRank) entry.regionalRank = rankData.regionalRank;
      if (rankData.globalRank) entry.globalRank = rankData.globalRank;
      if (rankData.badgeCount !== undefined)
        entry.badgeCount = rankData.badgeCount;
      if (rankData.streak !== undefined) {
        entry.streak = rankData.streak;
        if (rankData.streak > entry.longestStreak) {
          entry.longestStreak = rankData.streak;
        }
      }
      if (rankData.totalPoints !== undefined)
        entry.totalPoints = rankData.totalPoints;

      // Update performance flags
      entry.topPerformance = entry.globalRank <= 100;

      // Check if most improved (rank improved by more than 50 positions)
      if (entry.history.length >= 2) {
        const previousRank = entry.history[entry.history.length - 2].rank;
        entry.mostImproved = previousRank - entry.globalRank >= 50;
      }

      // Keep only last 30 history entries
      if (entry.history.length > 30) {
        entry.history = entry.history.slice(-30);
      }

      await entry.save();
      return entry;
    } catch (error) {
      logger.error("Error updating rank:", error);
      throw error;
    }
  }

  // Get global leaderboard
  async getGlobalLeaderboard(limit = 50, series = null) {
    try {
      const query = series ? { series } : {};

      const leaderboard = await LeaderboardEntry.find(query)
        .populate("userId", "name email country")
        .sort({ globalRank: 1 })
        .limit(limit);

      return leaderboard;
    } catch (error) {
      logger.error("Error getting global leaderboard:", error);
      throw error;
    }
  }

  // Get national leaderboard
  async getNationalLeaderboard(country, limit = 50, series = null) {
    try {
      const query = { country, ...(series && { series }) };

      const leaderboard = await LeaderboardEntry.find(query)
        .populate("userId", "name email")
        .sort({ nationalRank: 1 })
        .limit(limit);

      return leaderboard;
    } catch (error) {
      logger.error("Error getting national leaderboard:", error);
      throw error;
    }
  }

  // Get regional leaderboard
  async getRegionalLeaderboard(region, limit = 50, series = null) {
    try {
      const query = { region, ...(series && { series }) };

      const leaderboard = await LeaderboardEntry.find(query)
        .populate("userId", "name email")
        .sort({ regionalRank: 1 })
        .limit(limit);

      return leaderboard;
    } catch (error) {
      logger.error("Error getting regional leaderboard:", error);
      throw error;
    }
  }

  // Get user's rank position
  async getUserRank(userId, series = null) {
    try {
      const entry = await LeaderboardEntry.findOne({ userId, series }).populate(
        "userId",
        "name email country region"
      );

      if (!entry) {
        return null;
      }

      return {
        user: entry.userId,
        globalRank: entry.globalRank,
        nationalRank: entry.nationalRank,
        regionalRank: entry.regionalRank,
        badgeCount: entry.badgeCount,
        streak: entry.streak,
        longestStreak: entry.longestStreak,
        totalPoints: entry.totalPoints,
        topPerformance: entry.topPerformance,
        mostImproved: entry.mostImproved,
        rankImprovement: entry.rankImprovement,
        performanceTrend: entry.performanceTrend,
      };
    } catch (error) {
      logger.error("Error getting user rank:", error);
      throw error;
    }
  }

  // Get leaderboard statistics
  async getStatistics(series = null) {
    try {
      const query = series ? { series } : {};

      const stats = await LeaderboardEntry.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            averageBadges: { $avg: "$badgeCount" },
            averageStreak: { $avg: "$streak" },
            maxStreak: { $max: "$longestStreak" },
            topPerformers: { $sum: { $cond: ["$topPerformance", 1, 0] } },
            mostImproved: { $sum: { $cond: ["$mostImproved", 1, 0] } },
            totalPoints: { $sum: "$totalPoints" },
          },
        },
      ]);

      return (
        stats[0] || {
          totalUsers: 0,
          averageBadges: 0,
          averageStreak: 0,
          maxStreak: 0,
          topPerformers: 0,
          mostImproved: 0,
          totalPoints: 0,
        }
      );
    } catch (error) {
      logger.error("Error getting statistics:", error);
      throw error;
    }
  }

  // Recalculate all ranks (admin function)
  async recalculateRanks(series = null) {
    try {
      const query = series ? { series } : {};

      // Get all entries sorted by total points
      const entries = await LeaderboardEntry.find(query).sort({
        totalPoints: -1,
        badgeCount: -1,
        streak: -1,
      });

      // Update global ranks
      for (let i = 0; i < entries.length; i++) {
        entries[i].globalRank = i + 1;
        await entries[i].save();
      }

      logger.info(`Recalculated ranks for ${entries.length} entries`);
      return { updated: entries.length };
    } catch (error) {
      logger.error("Error recalculating ranks:", error);
      throw error;
    }
  }
}

module.exports = new LeaderboardEntryService();