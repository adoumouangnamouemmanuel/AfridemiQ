const { StatusCodes } = require("http-status-codes");
const onboardingStatusService = require("../../services/user/onboardingStatus/onboarding.status.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("OnboardingStatusController");

const onboardingStatusController = {
  // Get onboarding status
  async getOnboardingStatus(req, res) {
    try {
      const userId = req.user.userId;
      const onboardingStatus =
        await onboardingStatusService.getOrCreateOnboardingStatus(userId);

      res.status(StatusCodes.OK).json({
        message: "Onboarding status retrieved successfully",
        data: onboardingStatus,
      });
    } catch (error) {
      logger.error("Error getting onboarding status:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving onboarding status",
        error: error.message,
      });
    }
  },

  // Get onboarding progress
  async getOnboardingProgress(req, res) {
    try {
      const userId = req.user.userId;
      const progress = await onboardingStatusService.getOnboardingProgress(
        userId
      );

      res.status(StatusCodes.OK).json({
        message: "Onboarding progress retrieved successfully",
        data: progress,
      });
    } catch (error) {
      logger.error("Error getting onboarding progress:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving onboarding progress",
        error: error.message,
      });
    }
  },

  // Complete a step
  async completeStep(req, res) {
    try {
      const userId = req.user.userId;
      const { stepName } = req.body;

      const onboardingStatus = await onboardingStatusService.completeStep(
        userId,
        stepName
      );

      res.status(StatusCodes.OK).json({
        message: "Step completed successfully",
        data: onboardingStatus,
      });
    } catch (error) {
      logger.error("Error completing step:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error completing step",
        error: error.message,
      });
    }
  },

  // Update current step
  async updateCurrentStep(req, res) {
    try {
      const userId = req.user.userId;
      const { stepName } = req.body;

      const onboardingStatus = await onboardingStatusService.updateCurrentStep(
        userId,
        stepName
      );

      res.status(StatusCodes.OK).json({
        message: "Current step updated successfully",
        data: onboardingStatus,
      });
    } catch (error) {
      logger.error("Error updating current step:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error updating current step",
        error: error.message,
      });
    }
  },

  // Reset onboarding
  async resetOnboarding(req, res) {
    try {
      const userId = req.user.userId;
      const onboardingStatus = await onboardingStatusService.resetOnboarding(
        userId
      );

      res.status(StatusCodes.OK).json({
        message: "Onboarding reset successfully",
        data: onboardingStatus,
      });
    } catch (error) {
      logger.error("Error resetting onboarding:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error resetting onboarding",
        error: error.message,
      });
    }
  },

  // Get all onboarding steps
  async getAllSteps(req, res) {
    try {
      const steps = await onboardingStatusService.getAllSteps();

      res.status(StatusCodes.OK).json({
        message: "Onboarding steps retrieved successfully",
        data: steps,
      });
    } catch (error) {
      logger.error("Error getting all steps:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving onboarding steps",
        error: error.message,
      });
    }
  },

  // Get onboarding statistics (admin only)
  async getOnboardingStatistics(req, res) {
    try {
      const statistics =
        await onboardingStatusService.getOnboardingStatistics();

      res.status(StatusCodes.OK).json({
        message: "Onboarding statistics retrieved successfully",
        data: statistics,
      });
    } catch (error) {
      logger.error("Error getting onboarding statistics:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error retrieving onboarding statistics",
        error: error.message,
      });
    }
  },
};

module.exports = onboardingStatusController;