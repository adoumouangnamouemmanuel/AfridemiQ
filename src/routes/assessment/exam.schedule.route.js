const express = require("express");
const {
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
} = require("../../controllers/assessment/exam.schedule.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  createExamScheduleSchema,
  updateExamScheduleSchema,
  getExamSchedulesSchema,
  updateParticipantStatusSchema,
} = require("../../schemas/assessment/exam.schedule.schema");

const router = express.Router();

// Public routes
router.get("/upcoming", getUpcomingExams);
router.get(
  "/date-range",
  validateMiddleware(getExamSchedulesSchema, "query"),
  getExamsByDateRange
);
router.get("/subject/:subjectId", getExamsBySubject);

// Protected routes
router.use(authMiddleware);

// CRUD operations
router.post(
  "/",
  validateMiddleware(createExamScheduleSchema),
  createExamSchedule
);
router.get(
  "/",
  validateMiddleware(getExamSchedulesSchema, "query"),
  getExamSchedules
);
router.get("/:scheduleId", getExamScheduleById);
router.put(
  "/:scheduleId",
  validateMiddleware(updateExamScheduleSchema),
  updateExamSchedule
);
router.delete("/:scheduleId", deleteExamSchedule);

// Registration
router.post("/:scheduleId/register", registerForExam);
router.post("/:scheduleId/unregister", unregisterFromExam);

// Exam management
router.patch("/:scheduleId/start", startExam);
router.patch("/:scheduleId/complete", completeExam);

// Participant management
router.get("/:scheduleId/participants", getExamParticipants);
router.patch(
  "/:scheduleId/participants/:userId",
  validateMiddleware(updateParticipantStatusSchema),
  updateParticipantStatus
);

module.exports = router;