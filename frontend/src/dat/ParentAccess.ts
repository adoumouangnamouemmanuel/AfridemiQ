import { ParentAccess } from "./AfricaExamPrepDataStructure";

const parentAccess: ParentAccess = {
  id: "parent-001",
  userId: "user-001",
  parentEmail: "parent@example.com",
  accessLevel: "viewProgress",
  notifications: [{ type: "progressReport", frequency: "weekly" }],
};

export { parentAccess };