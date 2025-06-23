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

// =============== ADMIN FUNCTIONS ===============

// Get all users (admin only)
const getAllUsers = async (query) => {
  //TODO: remove later
  console.log("===================getAllUsers=======================");

  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    role,
    country,
    examType,
  } = query;

  const filter = {};
  if (role) filter.role = role;
  if (country) filter.country = country;
  if (examType) filter.examType = examType;

  const users = await User.find(filter)
    .select("-password -resetPasswordToken -resetPasswordExpires -refreshToken")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const count = await User.countDocuments(filter);

  console.log("++++++✅ GET ALL USERS: Users retrieved ++++++");
  return { users, count };
};

module.exports = {
  // Core auth (100% intact)
  register,
  login,

  // Profile management
  getProfile,
  updateProfile,
  updatePersonalInfo,
  deleteUser,

  // Onboarding
  completeOnboarding,
  checkOnboardingStatus,

  // Password management
  changePassword,
  requestPasswordReset,
  resetPassword,

  // Token management
  refreshToken,
  logOut,

  // User search & discovery
  searchUsers,
  getUserById,

  // Admin
  getAllUsers,
};
