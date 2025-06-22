import { Notification } from "./AfricaExamPrepDataStructure";

const notification: Notification = {
  id: "notification-001",
  userId: "user-001",
  type: "reminder",
  title: "Study Reminder",
  message: "Time to practice Limits for Bac D!",
  priority: "medium",
  read: false,
  actionUrl: "https://example.com/topics/topic-001",
  expiresAt: "2025-06-04T23:59:59Z",
  metadata: { relatedEntityId: "topic-001", relatedEntityType: "topic" },
};

export { notification };