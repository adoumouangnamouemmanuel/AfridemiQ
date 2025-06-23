import { LeaderboardEntry } from "./AfricaExamPrepDataStructure";

const leaderboardEntry: LeaderboardEntry = {
  id: "leaderboard-001",
  userId: "user-001",
  nationalRank: 50,
  regionalRank: 10,
  globalRank: 200,
  badgeCount: 1,
  streak: 5,
  topPerformance: false,
  mostImproved: true,
  longestStreak: 7,
  history: [
    { date: "2025-06-01", rank: 55 },
    { date: "2025-05-31", rank: 60 },
  ],
  series: "Bac_D",
};

export { leaderboardEntry };