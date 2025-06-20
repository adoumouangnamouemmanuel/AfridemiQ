const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { User } = require("../../models/user/user.model");
const {
  generateToken,
  generateRefreshToken,
} = require("../../utils/jwt.utils");
const BadRequestError = require("../../errors/badRequestError");
const NotFoundError = require("../../errors/notFoundError");
const UnauthorizedError = require("../../errors/unauthorizedError");
const ConflictError = require("../../errors/conflictError");
const createLogger = require("../logging.service");
const { PAGINATION } = require("../../constants");

const logger = createLogger("UserService");

// =============== CORE AUTH (KEEP 100% INTACT) ===============

// Register a new user
const register = async (data) => {
  //TODO: remove later
  console.log("======================register===================");
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) throw new ConflictError("Email déjà utilisé");
  const user = await User.create(data); // Rely on pre("save") for hashing
  const token = generateToken({ userId: user._id, role: user.role });
  //TODO: remove later
  console.log("++++++✅ REGISTER: Registration successful ++++++");
  return { user: user.toJSON(), token };
};

// Login user
const login = async ({ email, password }) => {
  //TODO: remove later
  console.log("===================login=======================");
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  // TODO: Remove detailed logging before production
  console.log("++++++✅ LOGIN: Password match, updating user data++++++");

  user.lastLogin = new Date();
  user.refreshToken = generateRefreshToken({
    userId: user._id,
    role: user.role,
  });

  await user.save();

  const token = generateToken({ userId: user._id, role: user.role });

  // TODO: Remove detailed logging before production
  console.log("✅ LOGIN: Login successful for user:", user._id);

  return { user: user.toJSON(), token, refreshToken: user.refreshToken };
};

// =============== PROFILE MANAGEMENT ===============

// Get user profile
const getProfile = async (userId) => {
  //TODO: remove later
  console.log("===================getProfile=======================");
  const user = await User.findById(userId).select(
    "-password -resetPasswordToken -resetPasswordExpires -refreshToken"
  );
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  //TODO: remove later
  console.log("++++++✅ GET PROFILE: User profile retrieved ++++++");
  return user;
};

// Update user profile
const updateProfile = async (userId, updateData) => {
  //TODO: remove later
  console.log("===================updateProfile=======================");

  // Check email uniqueness if email is being updated
  if (updateData.email) {
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: userId },
    });
    if (existingUser) throw new ConflictError("Email déjà utilisé");
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select(
    "-password -resetPasswordToken -resetPasswordExpires -refreshToken"
  );
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  //TODO: remove later
  console.log("++++++✅ UPDATE PROFILE: User profile updated ++++++");
  return user;
};

// Update personal information
const updatePersonalInfo = async (userId, personalInfoData) => {
  console.log("===================updatePersonalInfo=======================");

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");

  // Check email uniqueness if email is being updated
  if (personalInfoData.email && personalInfoData.email !== user.email) {
    const existingUser = await User.findOne({ email: personalInfoData.email });
    if (existingUser) throw new ConflictError("Email déjà utilisé");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: personalInfoData },
    { new: true, runValidators: true }
  ).select("-password -resetPasswordToken -resetPasswordExpires -refreshToken");

  if (!updatedUser)
    throw new NotFoundError("Utilisateur non trouvé après mise à jour");

  console.log("++++++✅ UPDATE PERSONAL INFO: Personal info updated ++++++");
  return updatedUser;
};

// Update notification preferences
const updateNotifications = async (userId, { notifications }) => {
  console.log("===================updateNotifications=======================");

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");

  const updatedUser = await User.findByIdAndUpdate(
        userId,
    {
      $set: {
        "notifications.dailyReminders": notifications.dailyReminders,
        "notifications.progressUpdates": notifications.progressUpdates,
        "notifications.examAlerts": notifications.examAlerts,
      },
    },
    { new: true, runValidators: true }
  ).select("-password -resetPasswordToken -resetPasswordExpires -refreshToken");

  if (!updatedUser)
    throw new NotFoundError("Utilisateur non trouvé après mise à jour");

  console.log("++++++✅ UPDATE NOTIFICATIONS: Notifications updated ++++++");
  return updatedUser;
};

// Delete user
const deleteUser = async (userId) => {
  //TODO: remove later
  console.log("===================deleteUser=======================");
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  console.log("++++++✅ DELETE USER: User deleted ++++++");
};

// =============== ONBOARDING ===============

// Complete onboarding process
const completeOnboarding = async (userId, onboardingData) => {
  console.log("===================completeOnboarding=======================");

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");

  // Update user with onboarding data
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...onboardingData,
        onboardingCompleted: true,
      },
    },
    { new: true, runValidators: true }
  ).select("-password -resetPasswordToken -resetPasswordExpires -refreshToken");

  if (!updatedUser)
    throw new NotFoundError("Utilisateur non trouvé après mise à jour");

  console.log("++++++✅ COMPLETE ONBOARDING: Onboarding completed ++++++");
  return updatedUser;
};

// Check onboarding status
const checkOnboardingStatus = async (userId) => {
  console.log(
    "===================checkOnboardingStatus======================="
  );

  const user = await User.findById(userId).select(
    "onboardingCompleted country examType educationLevel"
  );
  if (!user) throw new NotFoundError("Utilisateur non trouvé");

  const isComplete =
    user.onboardingCompleted &&
    user.country &&
    user.examType &&
    user.educationLevel;

  console.log("++++++✅ CHECK ONBOARDING: Status checked ++++++");
  return {
    onboardingCompleted: isComplete,
    hasCountry: !!user.country,
    hasExamType: !!user.examType,
    hasEducationLevel: !!user.educationLevel,
    requiresOnboarding: !isComplete,
  };
};

// =============== PASSWORD MANAGEMENT ===============

// Change password
const changePassword = async (userId, { currentPassword, newPassword }) => {
  console.log("===================changePassword=======================");

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new BadRequestError("Mot de passe actuel incorrect");

  // Update password (will be hashed by pre-save middleware)
  user.password = newPassword;
  await user.save();

  console.log("++++++✅ CHANGE PASSWORD: Password changed ++++++");
};

// Request password reset
const requestPasswordReset = async (email) => {
  console.log("===================requestPasswordReset=======================");

  const user = await User.findOne({ email });
  if (!user) return; // Silent fail for security

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // TODO: Implement email service to send reset link with token
  console.log("++++++✅ REQUEST PASSWORD RESET: Reset token created ++++++");
  return resetToken; // Return for testing; remove in production
};

// Reset password
const resetPassword = async (token, password) => {
  console.log("===================resetPassword=======================");

  const resetTokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user)
    throw new BadRequestError("Lien de réinitialisation invalide ou expiré");

  user.password = password; // Will be hashed by pre-save middleware
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  console.log("++++++✅ RESET PASSWORD: Password reset ++++++");
};

// =============== TOKEN MANAGEMENT ===============

// Refresh token
const refreshToken = async (refreshToken) => {
  try {
    // TODO: Remove detailed logging before production
    console.log("🔄 REFRESH: Starting token refresh process");

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    console.log(
      "🔍 REFRESH: Refresh token verified, finding user:",
      payload.userId
    );

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      // TODO: Remove detailed logging before production
      console.log("❌ REFRESH: Invalid refresh token or user not found");
      throw new UnauthorizedError("Token de rafraîchissement invalide");
    }

    const newToken = generateToken({ userId: user._id, role: user.role });

    // TODO: Remove detailed logging before production
    console.log("✅ REFRESH: New token generated successfully");
    console.log("✅ REFRESH: New token length:", newToken.length);

    return { token: newToken };
  } catch (error) {
    // TODO: Remove detailed logging before production
    console.error("❌ REFRESH: Token refresh failed:", error.message);
    throw new UnauthorizedError("Token de rafraîchissement invalide");
  }
};

// Log out user
const logOut = async (userId) => {
  //TODO: remove later
  console.log("===================logOut=======================");
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  user.refreshToken = undefined; // Clear refresh token
  await user.save();
  console.log("++++++✅ LOG OUT: User logged out ++++++");
};

// =============== USER SEARCH & DISCOVERY ===============

// Search users with Africa-specific filters
const searchUsers = async (searchQuery, page = 1, limit = 10, filters = {}) => {
  console.log("===================searchUsers=======================");

  try {
    const skip = (page - 1) * limit;

    // Create a case-insensitive search regex
    const searchRegex = new RegExp(searchQuery, "i");

    // Base query with search across relevant fields
    const query = {
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { schoolName: searchRegex },
      ],
    };

    // Add Africa-specific filters
    if (filters.country) {
      query.country = filters.country;
    }
    if (filters.examType) {
      query.examType = filters.examType;
    }
    if (filters.educationLevel) {
      query.educationLevel = filters.educationLevel;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select(
          "name email country examType educationLevel schoolName preferredLanguage stats.averageScore createdAt"
        )
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 }),
      User.countDocuments(query),
    ]);

    console.log("++++++✅ SEARCH USERS: Users found ++++++");
    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error searching users: ${error.message}`);
  }
};

// Get user by ID with simplified visibility
const getUserById = async (userId, authUser) => {
  //TODO: remove later
  console.log("===================getUserById=======================");

  const user = await User.findById(userId).select(
    "name email country examType educationLevel schoolName preferredLanguage stats onboardingCompleted createdAt"
  );

  if (!user) throw new NotFoundError("Utilisateur non trouvé");

  // Simple visibility: users can see basic info of other users
  // Admin can see everything
  if (authUser.role !== "admin" && authUser.userId !== userId) {
    // Return limited public profile for non-admin, non-self requests
    return {
      _id: user._id,
      name: user.name,
      country: user.country,
      examType: user.examType,
      educationLevel: user.educationLevel,
      preferredLanguage: user.preferredLanguage,
      createdAt: user.createdAt,
    };
  }

  console.log("++++++✅ GET USER BY ID: User retrieved ++++++");
  return user;
};

// Block friend
const blockFriend = async (userId, friendId) => {
  try {
    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(friendId)
    ) {
      throw new BadRequestError("Format d'ID utilisateur invalide");
    }

    // Prevent self-blocking
    if (userId === friendId) {
      throw new BadRequestError("Vous ne pouvez pas vous bloquer vous-même");
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      throw new NotFoundError("Utilisateur non trouvé");
    }

    // Check if already blocked
    if (user.blockedUsers.includes(friendId)) {
      throw new ConflictError("Cet utilisateur est déjà bloqué");
    }

    // Add to blocked users
    user.blockedUsers.push(friendId);

    // Remove from friends if they were friends
    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter(
        (f) => f.toString() !== friendId.toString()
      );
    }

    await user.save();

    // Create notification for the blocked user
    await notificationService.createNotification({
      userId: friendId,
      type: "user_blocked",
      title: "Utilisateur bloqué",
      message: `${user.name} vous a bloqué`,
      priority: "high",
      actionUrl: `/profile/${userId}`,
      metadata: {
        blockedById: userId,
        blockedByName: user.name,
      },
    });

    logger.info(`L'utilisateur ${userId} a bloqué ${friendId}`);
    return user;
  } catch (error) {
    logger.error(`Erreur lors du blocage d'un utilisateur: ${error.message}`);
    throw error;
  }
};

// Unblock friend
const unblockFriend = async (userId, friendId) => {
  try {
    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(friendId)
    ) {
      throw new BadRequestError("Format d'ID utilisateur invalide");
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      throw new NotFoundError("Utilisateur non trouvé");
    }

    // Check if user is blocked
    if (!user.blockedUsers.includes(friendId)) {
      throw new NotFoundError("Cet utilisateur n'est pas bloqué");
    }

    // Remove from blocked users
    user.blockedUsers = user.blockedUsers.filter(
      (f) => f.toString() !== friendId.toString()
    );

    // Add back to friends list if they were friends before and not already in the list
    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
    }

    // Only add to friend's list if not already there
    if (!friend.friends.includes(userId)) {
      friend.friends.push(userId);
    }

    // Save both users
    await Promise.all([user.save(), friend.save()]);

    // Create notification for the unblocked user
    await notificationService.createNotification({
      userId: friendId,
      type: "friend_request",
      title: "Ami débloqué",
      message: `${user.name} vous a débloqué et ajouté comme ami`,
      priority: "medium",
      actionUrl: `/profile/${userId}`,
      metadata: {
        unblockedById: userId,
        unblockedByName: user.name,
      },
    });

    logger.info(`L'utilisateur ${userId} a débloqué ${friendId}`);
    return user;
  } catch (error) {
    logger.error(`Erreur lors du déblocage d'un utilisateur: ${error.message}`);
    throw error;
  }
};

// Updates only the user's bio (part of socialProfile)
// @param {string} userId - ID of the user
// @param {object} bioData - Data containing the bio field
// @returns {object} Updated user object with sensitive fields excluded
async function updateBio(userId, bioData) {
  // TODO: Remove console.log before production
  console.log(`Updating bio for user ${userId}`);

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("Utilisateur non trouvé");
  }

  // Update bio using $set to target specific field
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { "socialProfile.bio": bioData.bio } },
    { new: true, runValidators: true }
  ).select(
    "-password -refreshToken -phoneVerificationToken -resetPasswordToken"
  );

  if (!updatedUser) {
    throw new NotFoundError("Utilisateur non trouvé après mise à jour");
  }

  return updatedUser;
}

// Updates personal information fields
// @param {string} userId - ID of the user
// @param {object} personalInfoData - Data containing personal info fields
// @returns {object} Updated user object with sensitive fields excluded
async function updatePersonalInfo(userId, personalInfoData) {
  // TODO: Remove console.log before production
  console.log(`Updating personal info for user ${userId}`);

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("Utilisateur non trouvé");
  }

  // Map input fields to MongoDB fields using $set
  const updateFields = {};
  for (const [key, value] of Object.entries(personalInfoData)) {
    updateFields[key] = value;
  }

  // Check for email uniqueness if email is being updated
  if (personalInfoData.email && personalInfoData.email !== user.email) {
    const existingUser = await User.findOne({ email: personalInfoData.email });
    if (existingUser) {
      throw new BadRequestError("Cet email est déjà utilisé");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select(
    "-password -refreshToken -phoneVerificationToken -resetPasswordToken"
  );

  if (!updatedUser) {
    throw new NotFoundError("Utilisateur non trouvé après mise à jour");
  }

  return updatedUser;
}

// Updates education information fields
// @param {string} userId - ID of the user
// @param {object} educationData - Data containing education fields
// @returns {object} Updated user object with sensitive fields excluded
// user.service.js (updated updateEducation)
async function updateEducation(userId, educationData) {
  console.log(`Updating education for user ${userId}`, educationData);

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("Utilisateur non trouvé");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        schoolName: educationData.schoolName,
        gradeLevel: educationData.gradeLevel,
        "preferences.studyField": educationData.studyField, // ✅ Correct path
        "preferences.studyHours": educationData.studyHours, // ✅ Correct path
      },
    },
    { new: true, runValidators: true }
  ).select(
    "-password -refreshToken -phoneVerificationToken -resetPasswordToken"
  );

  if (!updatedUser) {
    throw new NotFoundError("Utilisateur non trouvé après mise à jour");
  }

  console.log(`Updated education for user ${userId}`, {
    schoolName: updatedUser.schoolName,
    gradeLevel: updatedUser.gradeLevel,
    "preferences.studyField": educationData.studyField, // ✅ Correct path
    "preferences.studyHours": educationData.studyHours, // ✅ Correct path
  });

  return updatedUser;
}

// Updates exam preparation fields (progress-related)
// @param {string} userId - ID of the user
// @param {object} examPrepData - Data containing exam preparation fields
// @returns {object} Updated user object with sensitive fields excluded
async function updateExamPreparation(userId, examPrepData) {
  // TODO: Remove console.log before production
  console.log(`Updating exam preparation for user ${userId}`);

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("Utilisateur non trouvé");
  }

  // Map input fields to MongoDB fields using $set
  const updateFields = {};
  for (const [key, value] of Object.entries(examPrepData)) {
    updateFields[`progress.${key}`] = value;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select(
    "-password -refreshToken -phoneVerificationToken -resetPasswordToken"
  );

  if (!updatedUser) {
    throw new NotFoundError("Utilisateur non trouvé après mise à jour");
  }

  return updatedUser;
}

// COMPLETELY NEW APPROACH: Updates a single preference using direct MongoDB operations
// @param {string} userId - ID of the user
// @param {string} key - Preference key (e.g., notifications.general, autoPlayAudio)
// @param {any} value - New value for the preference
// @returns {object} Updated user object with sensitive fields excluded
async function updateSinglePreference(userId, key, value) {
  console.log(
    `🔧 SERVICE: Starting single preference update for user ${userId}`
  );
  console.log(`🔧 SERVICE: Key: "${key}", Value:`, value, `(${typeof value})`);

  try {
    // Find user first
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("Utilisateur non trouvé");
    }

    console.log(
      `🔧 SERVICE: User found, current preferences:`,
      JSON.stringify(user.preferences, null, 2)
    );

    // Build the update object based on key type
    let updateObject = {};

    if (key.includes(".")) {
      // Handle nested keys like "notifications.general"
      const dotNotationKey = `preferences.${key}`;
      updateObject[dotNotationKey] = value;
      console.log(
        `🔧 SERVICE: Using dot notation update for nested key: ${dotNotationKey}`
      );
    } else {
      // Handle direct keys like "autoPlayAudio"
      const directKey = `preferences.${key}`;
      updateObject[directKey] = value;
      console.log(`🔧 SERVICE: Using direct update for key: ${directKey}`);
    }

    console.log(
      `🔧 SERVICE: Update object:`,
      JSON.stringify(updateObject, null, 2)
    );

    // Use findByIdAndUpdate with $set operator
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateObject },
      {
        new: true,
        runValidators: true,
        // Ensure we get the updated document
        returnDocument: "after",
      }
    ).select(
      "-password -refreshToken -phoneVerificationToken -resetPasswordToken"
    );

    if (!updatedUser) {
      throw new NotFoundError("Utilisateur non trouvé après mise à jour");
    }

    console.log(`✅ SERVICE: Preference update successful`);
    console.log(
      `✅ SERVICE: Updated preferences:`,
      JSON.stringify(updatedUser.preferences, null, 2)
    );

    return updatedUser;
  } catch (error) {
    console.error(`❌ SERVICE: Error in updateSinglePreference:`, error);

    // Re-throw known errors
    if (error instanceof NotFoundError) {
      throw error;
    }

    // Wrap unknown errors
    throw new BadRequestError(
      `Erreur lors de la mise à jour de la préférence: ${error.message}`
    );
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  deleteUser,
  getAllUsers,
  updateAllPreferences,
  updatePreferenceType,
  updateMultiplePreferences,
  updateProgress,
  addFriend,
  removeFriend,
  blockFriend,
  unblockFriend,
  verifyPhone,
  requestPhoneVerification,
  updateSubscription,
  getUserById,
  logOut,
  requestPasswordReset,
  resetPassword,
  refreshToken,
  searchUsers,
  updateSocialProfile,
  updateBio,
  updatePersonalInfo,
  updateEducation,
  updateExamPreparation,
  updateSinglePreference,
};