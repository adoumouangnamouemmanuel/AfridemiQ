const challengeService = require("../../services/assessment/challenge/challenge.service");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

// Create challenge
const createChallenge = asyncHandler(async (req, res) => {
  const challengeData = {
    ...req.body,
    creatorId: req.user._id,
  };

  const challenge = await challengeService.createChallenge(challengeData);

  res
    .status(201)
    .json(new ApiResponse(201, challenge, "Challenge created successfully"));
});

// Get challenge by ID
const getChallengeById = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;

  const challenge = await challengeService.getChallengeById(challengeId);

  res
    .status(200)
    .json(new ApiResponse(200, challenge, "Challenge retrieved successfully"));
});

// Get all challenges
const getChallenges = asyncHandler(async (req, res) => {
  const filters = {
    search: req.query.search,
    subjectId: req.query.subjectId,
    topicId: req.query.topicId,
    level: req.query.level,
    difficulty: req.query.difficulty,
    status: req.query.status,
    creatorId: req.query.creatorId,
    premiumOnly: req.query.premiumOnly,
  };

  const options = {
    page: Number.parseInt(req.query.page) || 1,
    limit: Number.parseInt(req.query.limit) || 10,
    sortBy: req.query.sortBy || "createdAt",
    sortOrder: req.query.sortOrder || "desc",
  };

  const result = await challengeService.getChallenges(filters, options);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Challenges retrieved successfully"));
});

// Update challenge
const updateChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;

  const challenge = await challengeService.updateChallenge(
    challengeId,
    req.body
  );

  res
    .status(200)
    .json(new ApiResponse(200, challenge, "Challenge updated successfully"));
});

// Delete challenge
const deleteChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;

  const result = await challengeService.deleteChallenge(challengeId);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Challenge deleted successfully"));
});

// Join challenge
const joinChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const userId = req.user._id;

  const challenge = await challengeService.joinChallenge(challengeId, userId);

  res
    .status(200)
    .json(new ApiResponse(200, challenge, "Joined challenge successfully"));
});

// Leave challenge
const leaveChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const userId = req.user._id;

  const result = await challengeService.leaveChallenge(challengeId, userId);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Left challenge successfully"));
});

// Get active challenges
const getActiveChallenges = asyncHandler(async (req, res) => {
  const challenges = await challengeService.getActiveChallenges();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        challenges,
        "Active challenges retrieved successfully"
      )
    );
});

// Get open challenges
const getOpenChallenges = asyncHandler(async (req, res) => {
  const challenges = await challengeService.getOpenChallenges();

  res
    .status(200)
    .json(
      new ApiResponse(200, challenges, "Open challenges retrieved successfully")
    );
});

// Get challenges by subject
const getChallengesBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;

  const challenges = await challengeService.getChallengesBySubject(subjectId);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        challenges,
        "Subject challenges retrieved successfully"
      )
    );
});

// Start challenge
const startChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;

  const challenge = await challengeService.startChallenge(challengeId);

  res
    .status(200)
    .json(new ApiResponse(200, challenge, "Challenge started successfully"));
});

// Complete challenge
const completeChallenge = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;

  const challenge = await challengeService.completeChallenge(challengeId);

  res
    .status(200)
    .json(new ApiResponse(200, challenge, "Challenge completed successfully"));
});

// Submit challenge result
const submitChallengeResult = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const userId = req.user._id;
  const resultData = req.body;

  const result = await challengeService.submitChallengeResult(
    challengeId,
    userId,
    resultData
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Challenge result submitted successfully")
    );
});

// Get challenge leaderboard
const getChallengeLeaderboard = asyncHandler(async (req, res) => {
  const { challengeId } = req.params;

  const leaderboard = await challengeService.getChallengeLeaderboard(
    challengeId
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        leaderboard,
        "Challenge leaderboard retrieved successfully"
      )
    );
});

module.exports = {
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
};