const {
  OnboardingStatus,
} = require("../../../models/user/onboarding.status.model");
const createLogger = require("../../logging.service")
const logger = createLogger("OnboardingStatusService");

// Define the onboarding steps
const ONBOARDING_STEPS = [
  "profile_setup",
  "preferences",
  "subjects_selection",
  "exam_selection",
  "goals_setting",
  "tutorial_completion",
];

class OnboardingStatusService {
  // Get or create onboarding status
  async getOrCreateOnboardingStatus(userId) {
    try {
      let onboardingStatus = await OnboardingStatus.findOne({ userId });

      if (!onboardingStatus) {
        onboardingStatus = new OnboardingStatus({
          userId,
          completedSteps: [],
          currentStep: ONBOARDING_STEPS[0],
          lastUpdated: new Date(),
        });
        await onboardingStatus.save();
        logger.info(`Onboarding status created for user: ${userId}`);
      }

      return onboardingStatus;
    } catch (error) {
      logger.error("Error getting or creating onboarding status:", error);
      throw error;
    }
  }

  // Complete a step
  async completeStep(userId, stepName) {
    try {
      const onboardingStatus = await OnboardingStatus.findOne({ userId });

      if (!onboardingStatus) {
        throw new Error("Onboarding status not found");
      }

      // Validate step name
      if (!ONBOARDING_STEPS.includes(stepName)) {
        throw new Error(`Invalid step name: ${stepName}`);
      }

      // Add step to completed steps if not already completed
      if (!onboardingStatus.completedSteps.includes(stepName)) {
        onboardingStatus.completedSteps.push(stepName);
      }

      // Update current step to next uncompleted step
      const nextStep = ONBOARDING_STEPS.find(
        (step) => !onboardingStatus.completedSteps.includes(step)
      );

      if (nextStep) {
        onboardingStatus.currentStep = nextStep;
      } else {
        // All steps completed
        onboardingStatus.currentStep = "completed";
      }

      onboardingStatus.lastUpdated = new Date();
      await onboardingStatus.save();

      logger.info(`Step completed for user ${userId}: ${stepName}`);
      return onboardingStatus;
    } catch (error) {
      logger.error("Error completing step:", error);
      throw error;
    }
  }

  // Update current step
  async updateCurrentStep(userId, stepName) {
    try {
      // Validate step name
      if (!ONBOARDING_STEPS.includes(stepName) && stepName !== "completed") {
        throw new Error(`Invalid step name: ${stepName}`);
      }

      const onboardingStatus = await OnboardingStatus.findOneAndUpdate(
        { userId },
        {
          currentStep: stepName,
          lastUpdated: new Date(),
        },
        { new: true, upsert: true }
      );

      logger.info(`Current step updated for user ${userId}: ${stepName}`);
      return onboardingStatus;
    } catch (error) {
      logger.error("Error updating current step:", error);
      throw error;
    }
  }

  // Reset onboarding
  async resetOnboarding(userId) {
    try {
      const onboardingStatus = await OnboardingStatus.findOneAndUpdate(
        { userId },
        {
          completedSteps: [],
          currentStep: ONBOARDING_STEPS[0],
          lastUpdated: new Date(),
        },
        { new: true, upsert: true }
      );

      logger.info(`Onboarding reset for user: ${userId}`);
      return onboardingStatus;
    } catch (error) {
      logger.error("Error resetting onboarding:", error);
      throw error;
    }
  }

  // Get onboarding progress
  async getOnboardingProgress(userId) {
    try {
      const onboardingStatus = await this.getOrCreateOnboardingStatus(userId);

      const progress = {
        userId: onboardingStatus.userId,
        currentStep: onboardingStatus.currentStep,
        completedSteps: onboardingStatus.completedSteps,
        totalSteps: ONBOARDING_STEPS.length,
        completionPercentage: onboardingStatus.completionPercentage,
        remainingSteps: onboardingStatus.remainingSteps,
        isCompleted: onboardingStatus.isCompleted,
        lastUpdated: onboardingStatus.lastUpdated,
      };

      return progress;
    } catch (error) {
      logger.error("Error getting onboarding progress:", error);
      throw error;
    }
  }

  // Get all onboarding steps
  async getAllSteps() {
    try {
      return ONBOARDING_STEPS.map((step, index) => ({
        name: step,
        order: index + 1,
        description: this.getStepDescription(step),
      }));
    } catch (error) {
      logger.error("Error getting all steps:", error);
      throw error;
    }
  }

  // Get step description
  getStepDescription(stepName) {
    const descriptions = {
      profile_setup: "Configurer votre profil utilisateur",
      preferences: "Définir vos préférences d'apprentissage",
      subjects_selection: "Sélectionner vos matières d'étude",
      exam_selection: "Choisir vos examens cibles",
      goals_setting: "Définir vos objectifs d'apprentissage",
      tutorial_completion: "Terminer le tutoriel d'introduction",
    };

    return descriptions[stepName] || "Description non disponible";
  }

  // Check if step is valid
  isValidStep(stepName) {
    return ONBOARDING_STEPS.includes(stepName) || stepName === "completed";
  }

  // Get next step
  getNextStep(currentCompletedSteps) {
    return ONBOARDING_STEPS.find(
      (step) => !currentCompletedSteps.includes(step)
    );
  }

  // Get onboarding statistics
  async getOnboardingStatistics() {
    try {
      const stats = await OnboardingStatus.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            completedUsers: {
              $sum: {
                $cond: [{ $eq: ["$currentStep", "completed"] }, 1, 0],
              },
            },
            averageCompletionPercentage: {
              $avg: {
                $multiply: [
                  {
                    $divide: [
                      { $size: "$completedSteps" },
                      ONBOARDING_STEPS.length,
                    ],
                  },
                  100,
                ],
              },
            },
          },
        },
      ]);

      const result = stats[0] || {
        totalUsers: 0,
        completedUsers: 0,
        averageCompletionPercentage: 0,
      };

      result.completionRate =
        result.totalUsers > 0
          ? Math.round((result.completedUsers / result.totalUsers) * 100)
          : 0;

      result.averageCompletionPercentage = Math.round(
        result.averageCompletionPercentage || 0
      );

      return result;
    } catch (error) {
      logger.error("Error getting onboarding statistics:", error);
      throw error;
    }
  }
}

module.exports = new OnboardingStatusService();