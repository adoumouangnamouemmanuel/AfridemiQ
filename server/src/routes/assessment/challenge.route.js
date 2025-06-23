const express = require("express");
const {
  createChallenge,
  getChallengeById,
  getChallenges,
  updateChallenge,
  deleteChallenge,
  joinChallenge,
  leaveChallenge,
  getActiveChallenges,
  getOpenChallenges,
  getChallengesBySubject,
  startChallenge,
  completeChallenge,
  submitChallengeResult,
  getChallengeLeaderboard,
} = require("../../controllers/assessment/challenge.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  createChallengeSchema,
  updateChallengeSchema,
  getChallengesSchema,
  submitChallengeResultSchema,
} = require("../../schemas/assessment/challenge.schema");

const router = express.Router();

// Public routes
router.get("/active", getActiveChallenges);
router.get("/open", getOpenChallenges);
router.get("/subject/:subjectId", getChallengesBySubject);
router.get("/:challengeId/leaderboard", getChallengeLeaderboard);

// Protected routes
router.use(authMiddleware);

// CRUD operations
router.post("/", validateMiddleware(createChallengeSchema), createChallenge);
router.get("/", validateMiddleware(getChallengesSchema, "query"), getChallenges);
router.get("/:challengeId", getChallengeById);
router.put(
  "/:challengeId",
  validateMiddleware(updateChallengeSchema),
  updateChallenge
);
router.delete("/:challengeId", deleteChallenge);

// Challenge participation
router.post("/:challengeId/join", joinChallenge);
router.post("/:challengeId/leave", leaveChallenge);
router.post(
  "/:challengeId/submit",
  validateMiddleware(submitChallengeResultSchema),
  submitChallengeResult
);

// Challenge management
router.patch("/:challengeId/start", startChallenge);
router.patch("/:challengeId/complete", completeChallenge);

module.exports = router;