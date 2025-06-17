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
const mongoose = require("mongoose");
const notificationService = require("./notification/notification.service");
const createLogger = require("../logging.service");
const { LIMIT, PAGE } = require("../../constants/index");

const logger = createLogger("UserService");

// Register a new user
const register = async (data) => {
  // console.log("Register: Checking email:", data.email);
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) throw new ConflictError("Email déjà utilisé");
  // console.log("Register: Creating user");
  const user = await User.create(data); // Rely on pre("save") for hashing
  console.log("Register: User created:", user._id);
  const token = generateToken({ userId: user._id, role: user.role });
  return { user: user.toJSON(), token };
};

// Login user
const login = async ({ email, password }) => {
  // TODO: Remove detailed logging before production
  console.log("🔐 LOGIN: Attempting login for email:", email);

  const user = await User.findOne({ email });
  if (!user) {
    // TODO: Remove detailed logging before production
    console.log("❌ LOGIN: User not found for email:", email);
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  // TODO: Remove detailed logging before production
  console.log("🔍 LOGIN: User found, comparing passwords");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // TODO: Remove detailed logging before production
    console.log("❌ LOGIN: Password mismatch for email:", email);
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }

  // TODO: Remove detailed logging before production
  console.log("✅ LOGIN: Password match, updating user data");

  user.lastLogin = new Date();
  user.refreshToken = generateRefreshToken({
    userId: user._id,
    role: user.role,
  });

  await user.save();

  const token = generateToken({ userId: user._id, role: user.role });

  // TODO: Remove detailed logging before production
  console.log("✅ LOGIN: Login successful for user:", user._id);
  console.log("✅ LOGIN: Generated token length:", token.length);
  console.log(
    "✅ LOGIN: Generated refresh token length:",
    user.refreshToken.length
  );

  return { user: user.toJSON(), token, refreshToken: user.refreshToken };
};

// Get user profile
const getProfile = async (userId) => {
  const user = await User.findById(userId).select(
    "-password -phoneVerificationCode -phoneVerificationExpires -resetPasswordToken -resetPasswordExpires -refreshToken"
  );
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  return user;
};

// Update user profile
const updateProfile = async (userId, updateData) => {
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
    "-password -phoneVerificationCode -phoneVerificationExpires -resetPasswordToken -resetPasswordExpires -refreshToken"
  );
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  return user;
};

// Delete user
const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
};

// Get all users (admin only)
const getAllUsers = async (query) => {
  const { page = 1, limit = 10, role, country } = query;
  const filter = {};
  if (role) filter.role = role;
  if (country) filter.country = country;
  const users = await User.find(filter)
    .select(
      "-password -phoneVerificationCode -phoneVerificationExpires -resetPasswordToken -resetPasswordExpires -refreshToken"
    )
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const count = await User.countDocuments(filter);
  return { users, count };
};

// Update all preferences
const updateAllPreferences = async (userId, { preferences }) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");

  // Update preferences
  user.preferences = {
    ...user.preferences,
    ...preferences,
  };

  // Save the user document
  await user.save();

  // Return user without sensitive fields
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.phoneVerificationCode;
  delete userResponse.phoneVerificationExpires;
  delete userResponse.resetPasswordToken;
  delete userResponse.resetPasswordExpires;
  delete userResponse.refreshToken;
  return userResponse;
};

// Update specific preference type
const updatePreferenceType = async (userId, type, { value }) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");

  // Handle nested preferences (like notifications)
  if (type === "notifications") {
    user.preferences.notifications = {
      ...user.preferences.notifications,
      ...value,
    };
  } else {
    user.preferences[type] = value;
  }

  // Save the user document
  await user.save();

  // Return user without sensitive fields
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.phoneVerificationCode;
  delete userResponse.phoneVerificationExpires;
  delete userResponse.resetPasswordToken;
  delete userResponse.resetPasswordExpires;
  delete userResponse.refreshToken;
  return userResponse;
};

// Update multiple preference types
const updateMultiplePreferences = async (userId, { preferences }) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");

  // Update each specified preference type
  Object.entries(preferences).forEach(([type, value]) => {
    if (type === "notifications") {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...value,
      };
    } else {
      user.preferences[type] = value;
    }
  });

  // Save the user document
  await user.save();

  // Return user without sensitive fields
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.phoneVerificationCode;
  delete userResponse.phoneVerificationExpires;
  delete userResponse.resetPasswordToken;
  delete userResponse.resetPasswordExpires;
  delete userResponse.refreshToken;
  return userResponse;
};

// Update progress
const updateProgress = async (userId, progress) => {
  //TODO: remove later
  console.log(`===================updateProgress=======================`);

  // First retrieve the user
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");

  // Merge the progress data instead of replacing it entirely
  user.progress = {
    ...user.progress,
    ...progress,
  };

  // Save the user document (will run all middleware)
  await user.save();

  //TODO: remove later
  console.log("++++++✅ UPDATE PROGRESS: User progress updated ++++++");

  // Return user without sensitive fields
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.resetPasswordToken;
  delete userResponse.resetPasswordExpires;
  delete userResponse.refreshToken;

  return userResponse;
};

// Add friend
const addFriend = async (userId, friendId) => {
  //TODO: remove later
  console.log(`===================addFriend=======================`);
  try {
    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(friendId)
    ) {
      throw new BadRequestError("Format d'ID utilisateur invalide");
    }

    // Prevent self-friending
    if (userId === friendId) {
      throw new BadRequestError(
        "Vous ne pouvez pas vous ajouter vous-même comme ami"
      );
    }

    // Check if users exist
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId),
    ]);

    if (!user || !friend) {
      throw new NotFoundError("Utilisateur ou ami non trouvé");
    }

    if (user.friends.includes(friendId)) {
      throw new ConflictError("Cet utilisateur est déjà un ami");
    }

    if (!friend.preferences.allowFriendRequests) {
      throw new BadRequestError("Les demandes d'amis sont désactivées");
    }

    // Check if either user has blocked the other
    if (
      user.blockedUsers.includes(friendId) ||
      friend.blockedUsers.includes(userId)
    ) {
      throw new BadRequestError(
        "Impossible d'ajouter cet utilisateur comme ami"
      );
    }

    // Update both users' friend lists using atomic operations
    await Promise.all([
      User.findByIdAndUpdate(
        userId,
        { $addToSet: { friends: friendId } },
        { new: true }
      ),
      User.findByIdAndUpdate(
        friendId,
        { $addToSet: { friends: userId } },
        { new: true }
      ),
    ]);

    // Create notification for the friend
    await notificationService.createNotification({
      userId: friendId,
      type: "friend_request",
      title: "Nouvelle demande d'ami",
      message: `${user.name} vous a ajouté comme ami`,
      priority: "medium",
      actionUrl: `/profile/${userId}`,
      metadata: {
        requesterId: userId,
        requesterName: user.name,
      },
    });

    logger.info(`L'utilisateur ${userId} a ajouté ${friendId} comme ami`);

    // Return the updated user
    return await User.findById(userId);
    //TODO: remove later
    console.log("++++++✅ ADD FRIEND: Friend added successfully ++++++");
  } catch (error) {
    logger.error(`Erreur lors de l'ajout d'un ami: ${error.message}`);
    throw error;
  }
};

// Remove friend
const removeFriend = async (userId, friendId) => {
  //TODO: remove later
  console.log(`===================removeFriend=======================`);
  try {
    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(friendId)
    ) {
      throw new BadRequestError("Format d'ID utilisateur invalide");
    }

    // Prevent self-friending
    if (userId === friendId) {
      throw new BadRequestError(
        "Vous ne pouvez pas vous retirer vous-même comme ami"
      );
    }

    // Check if users exist
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId),
    ]);

    if (!user) {
      throw new NotFoundError("Utilisateur non trouvé");
    }

    if (!user.friends.includes(friendId)) {
      throw new NotFoundError("Cet utilisateur n'est pas un ami");
    }

    // Remove from both users' friend lists using atomic operations
    await Promise.all([
      User.findByIdAndUpdate(
        userId,
        { $pull: { friends: friendId } },
        { new: true }
      ),
      User.findByIdAndUpdate(
        friendId,
        { $pull: { friends: userId } },
        { new: true }
      ),
    ]);

    // Create notification for the removed friend
    if (friend) {
      await notificationService.createNotification({
        userId: friendId,
        type: "friend_removed",
        title: "Ami retiré",
        message: `${user.name} vous a retiré de sa liste d'amis`,
        priority: "low",
        actionUrl: `/profile/${userId}`,
        metadata: {
          removedById: userId,
          removedByName: user.name,
        },
      });
    }

    //TODO: remove later
    console.log(`++++++✅ REMOVE FRIEND: ${friendId} removed from ${userId}'s friends ++++++`);
    logger.info(`L'utilisateur ${userId} a retiré ${friendId} de ses amis`);
    return await User.findById(userId);
  } catch (error) {
    logger.error(`Erreur lors du retrait d'un ami: ${error.message}`);
    throw error;
  }
};

// Verify phone
const verifyPhone = async (userId, code) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  if (
    user.phoneVerificationCode !== code ||
    user.phoneVerificationExpires < new Date()
  ) {
    throw new BadRequestError("Code de vérification invalide ou expiré");
  }
  user.isPhoneVerified = true;
  user.phoneVerificationCode = undefined;
  user.phoneVerificationExpires = undefined;
  await user.save();
  return user;
};


// TODO: Implement a service to send SMS verification codes
// Request phone verification code
const requestPhoneVerification = async (userId, phoneNumber) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  const existingUser = await User.findOne({
    phoneNumber,
    _id: { $ne: userId },
  });
  if (existingUser) throw new ConflictError("Numéro de téléphone déjà utilisé");
  user.phoneNumber = phoneNumber;
  user.phoneVerificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();
  // TODO: Implement SMS service to send code
};

// Update subscription
const updateSubscription = async (userId, subscriptionData) => {
  //TODO: remove later
  console.log(`===================updateSubscription=======================`);
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");

  // Update subscription data
  user.subscription = {
    ...user.subscription,
    ...subscriptionData,
    // Update accessLevel based on subscription type
    accessLevel: subscriptionData.type === "premium" ? "premium" : "basic",
  };

  // // Update isPremium flag
  // user.isPremium = subscriptionData.type === "premium";

  await user.save();
  //TODO: remove later
  console.log(`++++++✅ UPDATE SUBSCRIPTION: User subscription updated ++++++`);
  return user;
};

// Get user by ID
const getUserById = async (userId, authUser) => {
  //TODO: remove later
  console.log(`===================getUserById=======================`);
  const user = await User.findById(userId).select(
    "-password -resetPasswordToken -resetPasswordExpires -refreshToken"
  );
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  if (authUser.role !== "admin" && authUser._id.toString() !== userId) {
    if (
      user.socialProfile.visibility === "private" &&
      !user.friends.includes(authUser._id)
    ) {
      throw new UnauthorizedError("Accès au profil non autorisé");
    }
    if (
      user.socialProfile.visibility === "friends" &&
      !user.friends.includes(authUser._id)
    ) {
      throw new UnauthorizedError("Accès au profil réservé aux amis");
    }
  }
  //TODO: remove later
  console.log(`++++++✅ GET USER BY ID: User ${userId} retrieved ++++++`);
  return user;
};

// Log out user
const logOut = async (userId) => {
  //TODO: remove later
  console.log(`===================logOut=======================`);
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  user.refreshToken = undefined; // Clear refresh token
  //TODO: remove later
  console.log(`++++++✅ LOG OUT: User ${userId} logged out ++++++`);
  await user.save();
};

// Request password reset
const requestPasswordReset = async (email) => {
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
  return resetToken; // Return for testing; remove in production
};

// Reset password
const resetPassword = async (token, password) => {
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
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};

// Refresh token
const refreshToken = async (refreshToken) => {
  try {
    // TODO: Remove detailed logging before production
    console.log("🔄 REFRESH: Starting token refresh process");
    console.log("🔄 REFRESH: Refresh token length:", refreshToken.length);

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // TODO: Remove detailed logging before production
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

// Search users
const searchUsers = async (searchQuery, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    // Create a case-insensitive search regex
    const searchRegex = new RegExp(searchQuery, "i");

    // Search across multiple fields with partial matching
    const query = {
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { country: searchRegex },
        { city: searchRegex },
        { school: searchRegex },
        { grade: searchRegex },
      ],
    };

    const [users, total] = await Promise.all([
      User.find(query)
        .select(
          "-password -refreshToken -verificationToken -resetPasswordToken"
        )
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 }),
      User.countDocuments(query),
    ]);

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

const updateSocialProfile = async (
  userId,
  { bio, visibility, publicAchievements, socialLinks }
) => {
  const socialProfile = {
    bio,
    visibility,
    publicAchievements: publicAchievements || [],
    socialLinks: socialLinks || [],
  };
  const user = await User.findByIdAndUpdate(
    userId,
    { socialProfile },
    { new: true, runValidators: true }
  ).select(
    "-password -phoneVerificationCode -phoneVerificationExpires -resetPasswordToken -resetPasswordExpires -refreshToken"
  );
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
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
