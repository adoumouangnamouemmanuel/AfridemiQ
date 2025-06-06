const parentAccessService = require("../../services/user/parentAccess/parent.access.service");
const { StatusCodes } = require("http-status-codes");
const createLogger = require("../../services/logging.service");

const logger = createLogger("ParentAccessController");

class ParentAccessController {
  // Create parent access
  async createParentAccess(req, res) {
    try {
      const userId = req.user.userId;
      const parentAccessData = req.body;

      const parentAccess = await parentAccessService.createParentAccess(
        userId,
        parentAccessData
      );

      res.status(StatusCodes.CREATED).json({
        message: "Parent access created successfully",
        data: parentAccess,
      });
    } catch (error) {
      logger.error("Error creating parent access:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error creating parent access",
        error: error.message,
      });
    }
  }

  // Get parent access
  async getParentAccess(req, res) {
    try {
      const userId = req.user.userId;

      const parentAccess = await parentAccessService.getParentAccessByUserId(
        userId
      );

      if (!parentAccess) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "Parent access not found",
        });
      }

      res.status(StatusCodes.OK).json({
        message: "Parent access retrieved successfully",
        data: parentAccess,
      });
    } catch (error) {
      logger.error("Error getting parent access:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving parent access",
        error: error.message,
      });
    }
  }

  // Verify parent access
  async verifyParentAccess(req, res) {
    try {
      const { verificationCode } = req.body;

      const parentAccess = await parentAccessService.verifyParentAccess(
        verificationCode
      );

      res.status(StatusCodes.OK).json({
        message: "Parent access verified successfully",
        data: parentAccess,
      });
    } catch (error) {
      logger.error("Error verifying parent access:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error verifying parent access",
        error: error.message,
      });
    }
  }

  // Update parent access
  async updateParentAccess(req, res) {
    try {
      const userId = req.user.userId;
      const updateData = req.body;

      const parentAccess = await parentAccessService.updateParentAccess(
        userId,
        updateData
      );

      res.status(StatusCodes.OK).json({
        message: "Parent access updated successfully",
        data: parentAccess,
      });
    } catch (error) {
      logger.error("Error updating parent access:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error updating parent access",
        error: error.message,
      });
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(req, res) {
    try {
      const userId = req.user.userId;
      const { notifications } = req.body;

      const parentAccess =
        await parentAccessService.updateNotificationPreferences(
          userId,
          notifications
        );

      res.status(StatusCodes.OK).json({
        message: "Notification preferences updated successfully",
        data: parentAccess,
      });
    } catch (error) {
      logger.error("Error updating notification preferences:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error updating notification preferences",
        error: error.message,
      });
    }
  }

  // Get student progress (for parents)
  async getStudentProgress(req, res) {
    try {
      const { userId } = req.params;
      const parentEmail = req.query.parentEmail;

      if (!parentEmail) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Parent email is required",
        });
      }

      const progressData =
        await parentAccessService.getStudentProgressForParent(
          userId,
          parentEmail
        );

      res.status(StatusCodes.OK).json({
        message: "Student progress retrieved successfully",
        data: progressData,
      });
    } catch (error) {
      logger.error("Error getting student progress:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving student progress",
        error: error.message,
      });
    }
  }

  // Get parent's students
  async getParentStudents(req, res) {
    try {
      const parentEmail = req.query.parentEmail;

      if (!parentEmail) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Parent email is required",
        });
      }

      const parentAccess = await parentAccessService.getParentAccessByEmail(
        parentEmail
      );

      res.status(StatusCodes.OK).json({
        message: "Parent students retrieved successfully",
        data: parentAccess,
      });
    } catch (error) {
      logger.error("Error getting parent students:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving parent students",
        error: error.message,
      });
    }
  }

  // Delete parent access
  async deleteParentAccess(req, res) {
    try {
      const userId = req.user.userId;

      await parentAccessService.deleteParentAccess(userId);

      res.status(StatusCodes.OK).json({
        message: "Parent access deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting parent access:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error deleting parent access",
        error: error.message,
      });
    }
  }

  // Admin: Get all parent access
  async getAllParentAccess(req, res) {
    try {
      const filters = {
        isActive:
          req.query.isActive === "true"
            ? true
            : req.query.isActive === "false"
            ? false
            : undefined,
        isVerified:
          req.query.isVerified === "true"
            ? true
            : req.query.isVerified === "false"
            ? false
            : undefined,
        accessLevel: req.query.accessLevel,
        limit: Number.parseInt(req.query.limit) || 100,
        skip: Number.parseInt(req.query.skip) || 0,
      };

      const parentAccess = await parentAccessService.getAllParentAccess(
        filters
      );

      res.status(StatusCodes.OK).json({
        message: "All parent access retrieved successfully",
        data: parentAccess,
      });
    } catch (error) {
      logger.error("Error getting all parent access:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving parent access",
        error: error.message,
      });
    }
  }

  // Admin: Get parent access analytics
  async getParentAccessAnalytics(req, res) {
    try {
      const analytics = await parentAccessService.getParentAccessAnalytics();

      res.status(StatusCodes.OK).json({
        message: "Parent access analytics retrieved successfully",
        data: analytics,
      });
    } catch (error) {
      logger.error("Error getting parent access analytics:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving parent access analytics",
        error: error.message,
      });
    }
  }
}

module.exports = new ParentAccessController();