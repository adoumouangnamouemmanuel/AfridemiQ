const { ExamSchedule } = require("../../../models/assessment/exam.schedule.model");
const { Exam } = require("../../../models/assessment/exam.model");
const { ApiError } = require("../../../utils/ApiError");
const createLogger = require("../../logging.service");

const logger = createLogger("ExamScheduleService");

class ExamScheduleService {
  // Create exam schedule
  async createExamSchedule(scheduleData) {
    try {
      // Validate exam exists
      const exam = await Exam.findById(scheduleData.examId);
      if (!exam) {
        throw new ApiError(404, "Exam not found");
      }

      // Validate scheduling
      const examDateTime = new Date(scheduleData.scheduling.date);
      const [hours, minutes] = scheduleData.scheduling.time.split(":");
      examDateTime.setHours(
        Number.parseInt(hours),
        Number.parseInt(minutes),
        0,
        0
      );

      if (examDateTime <= new Date()) {
        throw new ApiError(400, "Exam date and time must be in the future");
      }

      // Set registration deadline if not provided
      if (
        scheduleData.registration &&
        scheduleData.registration.isRequired &&
        !scheduleData.registration.deadline
      ) {
        const deadline = new Date(examDateTime);
        deadline.setHours(deadline.getHours() - 24); // 24 hours before exam
        scheduleData.registration.deadline = deadline;
      }

      const examSchedule = new ExamSchedule(scheduleData);
      await examSchedule.save();
      logger.info(`Exam schedule created successfully: ${examSchedule._id}`);
      return await this.getExamScheduleById(examSchedule._id);
    } catch (error) {
      logger.error("Error creating exam schedule:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error creating exam schedule: ${error.message}`);
    }
  }

  // Get exam schedule by ID
  async getExamScheduleById(scheduleId) {
    try {
      const schedule = await ExamSchedule.findById(scheduleId)
        .populate("examId", "title description format timeLimit")
        .populate("subjectId", "name code description")
        .populate("creatorId", "name email")
        .populate("participants.userId", "name email");

      if (!schedule) {
        throw new ApiError(404, "Exam schedule not found");
      }

      logger.info(`Exam schedule retrieved successfully: ${scheduleId}`);
      return schedule;
    } catch (error) {
      logger.error("Error retrieving exam schedule:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error fetching exam schedule: ${error.message}`);
    }
  }

  // Get all exam schedules with filters
  async getExamSchedules(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "scheduling.date",
        sortOrder = "asc",
        search,
        examId,
        subjectId,
        level,
        examType,
        status,
        creatorId,
        dateFrom,
        dateTo,
      } = { ...filters, ...options };

      // Build query
      const query = { isActive: true };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      if (examId) query.examId = examId;
      if (subjectId) query.subjectId = subjectId;
      if (level) query.level = level;
      if (examType) query.examType = examType;
      if (status) query.status = status;
      if (creatorId) query.creatorId = creatorId;

      if (dateFrom || dateTo) {
        query["scheduling.date"] = {};
        if (dateFrom) query["scheduling.date"].$gte = new Date(dateFrom);
        if (dateTo) query["scheduling.date"].$lte = new Date(dateTo);
      }

      // Execute query
      const schedules = await ExamSchedule.find(query)
        .populate("examId", "title description format")
        .populate("subjectId", "name code")
        .populate("creatorId", "name email")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await ExamSchedule.countDocuments(query);
      logger.info(`Retrieved ${schedules.length} exam schedules out of ${total} total`);
      return {
        schedules,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalSchedules: total,
      };
    } catch (error) {
      logger.error("Error retrieving exam schedules:", error);
      throw new ApiError(
        500,
        `Error fetching exam schedules: ${error.message}`
      );
    }
  }

  // Update exam schedule
  async updateExamSchedule(scheduleId, updateData) {
    try {
      const schedule = await ExamSchedule.findById(scheduleId);

      if (!schedule) {
        throw new ApiError(404, "Exam schedule not found");
      }

      // Prevent updates to active or completed exams
      if (["active", "completed"].includes(schedule.status)) {
        throw new ApiError(
          400,
          "Cannot update active or completed exam schedules"
        );
      }

      // Validate scheduling updates
      if (updateData.scheduling) {
        const examDateTime = new Date(
          updateData.scheduling.date || schedule.scheduling.date
        );
        const time = updateData.scheduling.time || schedule.scheduling.time;
        const [hours, minutes] = time.split(":");
        examDateTime.setHours(
          Number.parseInt(hours),
          Number.parseInt(minutes),
          0,
          0
        );

        if (examDateTime <= new Date()) {
          throw new ApiError(400, "Exam date and time must be in the future");
        }
      }

      const updatedSchedule = await ExamSchedule.findByIdAndUpdate(
        scheduleId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      logger.info(`Exam schedule updated successfully: ${scheduleId}`);
      return await this.getExamScheduleById(scheduleId);
    } catch (error) {
      logger.error("Error updating exam schedule:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error updating exam schedule: ${error.message}`);
    }
  }

  // Delete exam schedule (soft delete)
  async deleteExamSchedule(scheduleId) {
    try {
      const schedule = await ExamSchedule.findById(scheduleId);

      if (!schedule) {
        throw new ApiError(404, "Exam schedule not found");
      }

      // Prevent deletion of active exams
      if (schedule.status === "active") {
        throw new ApiError(400, "Cannot delete active exam schedules");
      }

      schedule.isActive = false;
      schedule.status = "cancelled";
      await schedule.save();
      logger.info(`Exam schedule deleted successfully: ${scheduleId}`);
      return { message: "Exam schedule deleted successfully" };
    } catch (error) {
      logger.error("Error deleting exam schedule:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error deleting exam schedule: ${error.message}`);
    }
  }

  // Register user for exam
  async registerForExam(scheduleId, userId, paymentData = {}) {
    try {
      const schedule = await ExamSchedule.findById(scheduleId);

      if (!schedule) {
        throw new ApiError(404, "Exam schedule not found");
      }

      const paymentRequired = schedule.registration.fee > 0;
      await schedule.registerUser(userId, paymentRequired);
      logger.info(`User ${userId} registered for exam schedule ${scheduleId}`);
      return { message: "Successfully registered for exam" };
    } catch (error) {
      logger.error("Error registering for exam:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error registering for exam: ${error.message}`);
    }
  }

  // Unregister user from exam
  async unregisterFromExam(scheduleId, userId) {
    try {
      const schedule = await ExamSchedule.findById(scheduleId);

      if (!schedule) {
        throw new ApiError(404, "Exam schedule not found");
      }

      await schedule.unregisterUser(userId);
      logger.info(`User ${userId} unregistered from exam schedule ${scheduleId}`);
      return { message: "Successfully unregistered from exam" };
    } catch (error) {
      logger.error("Error unregistering from exam:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        `Error unregistering from exam: ${error.message}`
      );
    }
  }

  // Get upcoming exams
  async getUpcomingExams(limit = 10) {
    try {
      const exams = await ExamSchedule.findUpcoming(limit);
      logger.info(`Retrieved ${exams.length} upcoming exams`);
      return exams;
    } catch (error) {
      logger.error("Error retrieving upcoming exams:", error);
      throw new ApiError(500, `Error fetching upcoming exams: ${error.message}`);
    }
  }

  // Get exams by date range
  async getExamsByDateRange(startDate, endDate) {
    try {
      const exams = await ExamSchedule.findByDateRange(startDate, endDate);
      logger.info(`Retrieved ${exams.length} exams between ${startDate} and ${endDate}`);
      return exams;
    } catch (error) {
      logger.error("Error retrieving exams by date range:", error);
      throw new ApiError(500, `Error fetching exams by date range: ${error.message}`);
    }
  }

  // Get exams by subject
  async getExamsBySubject(subjectId, options = {}) {
    try {
      const exams = await ExamSchedule.findBySubject(subjectId, options);
      logger.info(`Retrieved ${exams.length} exams for subject ${subjectId}`);
      return exams;
    } catch (error) {
      logger.error("Error retrieving exams by subject:", error);
      throw new ApiError(500, `Error fetching exams by subject: ${error.message}`);
    }
  }

  // Start exam
  async startExam(scheduleId) {
    try {
      const schedule = await ExamSchedule.findById(scheduleId);

      if (!schedule) {
        throw new ApiError(404, "Exam schedule not found");
      }

      await schedule.startExam();
      logger.info(`Exam schedule ${scheduleId} started successfully`);
      return await this.getExamScheduleById(scheduleId);
    } catch (error) {
      logger.error("Error starting exam:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error starting exam: ${error.message}`);
    }
  }

  // Complete exam
  async completeExam(scheduleId) {
    try {
      const schedule = await ExamSchedule.findById(scheduleId);

      if (!schedule) {
        throw new ApiError(404, "Exam schedule not found");
      }

      await schedule.completeExam();
      logger.info(`Exam schedule ${scheduleId} completed successfully`);
      return await this.getExamScheduleById(scheduleId);
    } catch (error) {
      logger.error("Error completing exam:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error completing exam: ${error.message}`);
    }
  }

  // Update participant status
  async updateParticipantStatus(scheduleId, userId, status) {
    try {
      const schedule = await ExamSchedule.findById(scheduleId);

      if (!schedule) {
        throw new ApiError(404, "Exam schedule not found");
      }

      await schedule.updateParticipantStatus(userId, status);
      logger.info(`Updated status to ${status} for user ${userId} in exam schedule ${scheduleId}`);
      return await this.getExamScheduleById(scheduleId);
    } catch (error) {
      logger.error("Error updating participant status:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error updating participant status: ${error.message}`);
    }
  }

  // Get exam participants
  async getExamParticipants(scheduleId) {
    try {
      const participants = await ExamSchedule.getParticipants(scheduleId);
      logger.info(`Retrieved ${participants.length} participants for exam schedule ${scheduleId}`);
      return participants;
    } catch (error) {
      logger.error("Error retrieving exam participants:", error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Error fetching exam participants: ${error.message}`);
    }
  }
}

module.exports = new ExamScheduleService();