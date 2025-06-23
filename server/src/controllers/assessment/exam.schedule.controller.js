const examScheduleService = require("../../services/assessment/examSchedule/exam.schedule.service");
const { ApiError } = require("../../utils/ApiError");
const { ApiResponse } = require("../../utils/ApiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const createLogger = require("../../services/logging.service");

const logger = createLogger("ExamScheduleController");

// Create exam schedule
const createExamSchedule = asyncHandler(async (req, res) => {
  const scheduleData = {
    ...req.body,
    creatorId: req.user._id,
  };

  const schedule = await examScheduleService.createExamSchedule(scheduleData);
  logger.info(`Exam schedule created by user ${req.user._id}: ${schedule._id}`);

  res
    .status(201)
    .json(new ApiResponse(201, schedule, "Exam schedule created successfully"));
});

// Get exam schedule by ID
const getExamScheduleById = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;

  const schedule = await examScheduleService.getExamScheduleById(scheduleId);
  logger.info(`Exam schedule retrieved: ${scheduleId}`);

  res
    .status(200)
    .json(
      new ApiResponse(200, schedule, "Exam schedule retrieved successfully")
    );
});

// Get all exam schedules
const getExamSchedules = asyncHandler(async (req, res) => {
  const filters = {
    search: req.query.search,
    examId: req.query.examId,
    subjectId: req.query.subjectId,
    level: req.query.level,
    examType: req.query.examType,
    status: req.query.status,
    creatorId: req.query.creatorId,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
  };

  const options = {
    page: Number.parseInt(req.query.page) || 1,
    limit: Number.parseInt(req.query.limit) || 10,
    sortBy: req.query.sortBy || "scheduling.date",
    sortOrder: req.query.sortOrder || "asc",
  };

  const result = await examScheduleService.getExamSchedules(filters, options);
  logger.info(`Retrieved ${result.schedules.length} exam schedules (page ${options.page})`);

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Exam schedules retrieved successfully")
    );
});

// Update exam schedule
const updateExamSchedule = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;

  const schedule = await examScheduleService.updateExamSchedule(
    scheduleId,
    req.body
  );
  logger.info(`Exam schedule updated by user ${req.user._id}: ${scheduleId}`);

  res
    .status(200)
    .json(new ApiResponse(200, schedule, "Exam schedule updated successfully"));
});

// Delete exam schedule
const deleteExamSchedule = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;

  const result = await examScheduleService.deleteExamSchedule(scheduleId);
  logger.info(`Exam schedule deleted by user ${req.user._id}: ${scheduleId}`);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Exam schedule deleted successfully"));
});

// Register for exam
const registerForExam = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  const userId = req.user._id;

  const result = await examScheduleService.registerForExam(
    scheduleId,
    userId,
    req.body
  );
  logger.info(`User ${userId} registered for exam schedule ${scheduleId}`);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Successfully registered for exam"));
});

// Unregister from exam
const unregisterFromExam = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  const userId = req.user._id;

  const result = await examScheduleService.unregisterFromExam(
    scheduleId,
    userId
  );
  logger.info(`User ${userId} unregistered from exam schedule ${scheduleId}`);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Successfully unregistered from exam"));
});

// Get upcoming exams
const getUpcomingExams = asyncHandler(async (req, res) => {
  const limit = Number.parseInt(req.query.limit) || 10;

  const exams = await examScheduleService.getUpcomingExams(limit);
  logger.info(`Retrieved ${exams.length} upcoming exams`);

  res
    .status(200)
    .json(new ApiResponse(200, exams, "Upcoming exams retrieved successfully"));
});

// Get exams by date range
const getExamsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    logger.error("Missing required date parameters");
    throw new ApiError(400, "Start date and end date are required");
  }

  const exams = await examScheduleService.getExamsByDateRange(
    startDate,
    endDate
  );
  logger.info(`Retrieved ${exams.length} exams between ${startDate} and ${endDate}`);

  res
    .status(200)
    .json(new ApiResponse(200, exams, "Exams retrieved successfully"));
});

// Get exams by subject
const getExamsBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const options = {
    level: req.query.level,
    examType: req.query.examType,
    status: req.query.status,
  };

  const exams = await examScheduleService.getExamsBySubject(subjectId, options);
  logger.info(`Retrieved ${exams.length} exams for subject ${subjectId}`);

  res
    .status(200)
    .json(new ApiResponse(200, exams, "Subject exams retrieved successfully"));
});

// Start exam
const startExam = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;

  const schedule = await examScheduleService.startExam(scheduleId);
  logger.info(`Exam schedule ${scheduleId} started by user ${req.user._id}`);

  res
    .status(200)
    .json(new ApiResponse(200, schedule, "Exam started successfully"));
});

// Complete exam
const completeExam = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;

  const schedule = await examScheduleService.completeExam(scheduleId);
  logger.info(`Exam schedule ${scheduleId} completed by user ${req.user._id}`);

  res
    .status(200)
    .json(new ApiResponse(200, schedule, "Exam completed successfully"));
});

// Update participant status
const updateParticipantStatus = asyncHandler(async (req, res) => {
  const { scheduleId, userId } = req.params;
  const { status } = req.body;

  const result = await examScheduleService.updateParticipantStatus(
    scheduleId,
    userId,
    status
  );
  logger.info(`Updated status to ${status} for user ${userId} in exam schedule ${scheduleId}`);

  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Participant status updated successfully")
    );
});

// Get exam participants
const getExamParticipants = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;

  const participants = await examScheduleService.getExamParticipants(
    scheduleId
  );
  logger.info(`Retrieved ${participants.length} participants for exam schedule ${scheduleId}`);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        participants,
        "Exam participants retrieved successfully"
      )
    );
});

module.exports = {
  createExamSchedule,
  getExamScheduleById,
  getExamSchedules,
  updateExamSchedule,
  deleteExamSchedule,
  registerForExam,
  unregisterFromExam,
  getUpcomingExams,
  getExamsByDateRange,
  getExamsBySubject,
  startExam,
  completeExam,
  updateParticipantStatus,
  getExamParticipants,
};