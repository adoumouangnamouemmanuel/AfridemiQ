import { Subscription } from "./AfricaExamPrepDataStructure";

const subscription: Subscription = {
  type: "free",
  startDate: "2025-01-01T00:00:00Z",
  expiresAt: null,
  paymentStatus: "active",
  trialPeriod: {
    startDate: "2025-01-01T00:00:00Z",
    endDate: "2025-01-15T00:00:00Z",
  },
  features: ["basicContent", "limitedQuizzes"],
  accessLevel: "basic",
};

export { subscription };