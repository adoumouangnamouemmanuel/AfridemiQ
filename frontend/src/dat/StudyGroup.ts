import { StudyGroup } from "./AfricaExamPrepDataStructure";

const studyGroup: StudyGroup = {
  id: "group-001",
  name: "Bac D Math Study Group",
  description: "Collaborative group for Bac D Math students in Chad.",
  memberIds: ["user-001", "user-002"],
  createdBy: "user-002",
  challengeIds: ["challenge-001"],
  createdAt: "2025-05-01T00:00:00Z",
  features: {
    chatEnabled: true,
    fileSharing: true,
    liveSessions: false,
    progressTracking: true,
  },
  roles: [
    {
      userId: "user-002",
      role: "admin",
      permissions: ["manage_members", "create_challenges"],
    },
    { userId: "user-001", role: "member", permissions: ["join_sessions"] },
  ],
  activities: [
    {
      type: "resource_share",
      content: { resourceId: "resource-001" },
      createdAt: "2025-05-02T00:00:00Z",
      createdBy: "user-002",
    },
  ],
  studySchedule: {
    sessions: [{ day: "Monday", time: "18:00", topic: "Limits", duration: 60 }],
  },
  resourceIds: ["resource-001"],
  groupProgressSummary: {
    completedTopics: 1,
    averageScore: 75,
  },
};

export { studyGroup };