const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { User } = require("../../models/user/user.model"); // Corrected path
const {
  generateToken,
  generateRefreshToken,
} = require("../../utils/jwt.utils");
const BadRequestError = require("../../errors/badRequestError");
const NotFoundError = require("../../errors/notFoundError");
const UnauthorizedError = require("../../errors/unauthorizedError");
const ConflictError = require("../../errors/conflictError");

// Register a new user
const register = async (data) => {
  console.log("Register: Checking email:", data.email);
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) throw new ConflictError("Email déjà utilisé");
  console.log("Register: Creating user");
  const user = await User.create(data); // Rely on pre("save") for hashing
  console.log("Register: User created:", user._id);
  const token = generateToken({ userId: user._id, role: user.role });
  return { user: user.toJSON(), token };
};

// Login user
const login = async ({ email, password }) => {
  console.log("Login: Searching for email:", email);
  const user = await User.findOne({ email });
  if (!user) {
    console.log("Login: User not found");
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }
  console.log("Login: Comparing passwords");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log("Login: Password mismatch");
    throw new UnauthorizedError("Email ou mot de passe incorrect");
  }
  console.log("Login: Updating user");
  user.lastLogin = new Date();
  user.refreshToken = generateRefreshToken({
    userId: user._id,
    role: user.role,
  });
  await user.save();
  console.log("Login: Generating token");
  const token = generateToken({ userId: user._id, role: user.role });
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

// Update preferences
const updatePreferences = async (userId, preferences) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { preferences },
    { new: true, runValidators: true } // Fixed userId to runValidators
  ).select(
    "-password -phoneVerificationCode -phoneVerificationExpires -resetPasswordToken -resetPasswordExpires -refreshToken"
  );
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  return user;
};

// Update progress
const updateProgress = async (userId, progress) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { progress },
    { new: true, runValidators: true }
  ).select(
    "-password -phoneVerificationCode -phoneVerificationExpires -resetPasswordToken -resetPasswordExpires -refreshToken"
  );
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  return user;
};

// Add friend
const addFriend = async (userId, friendId) => {
  // Removed duplicate friendId
  const user = await User.findById(userId);
  const friend = await User.findById(friendId);
  if (!user || !friend)
    throw new NotFoundError("Utilisateur ou ami non trouvé");
  if (user.friends.includes(friendId))
    throw new ConflictError("Cet utilisateur est déjà un ami");
  if (!friend.preferences.allowFriendRequests)
    throw new BadRequestError("Les demandes d’amis sont désactivées");
  user.friends.push(friendId);
  await user.save();
  return user;
};

// Remove friend
const removeFriend = async (userId, friendId) => {
  // Removed duplicate friendId
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  if (!user.friends.includes(friendId))
    throw new NotFoundError("Cet utilisateur n’est pas un ami");
  user.friends = user.friends.filter(
    (f) => f.toString() !== friendId.toString()
  );
  await user.save();
  return user; // Return user instead of user.friends
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
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  user.subscription = { ...user.subscription, ...subscriptionData };
  user.isPremium = subscriptionData.type === "premium";
  await user.save();
  return user;
};

// Get user by ID
const getUserById = async (userId, authUser) => {
  const user = await User.findById(userId).select(
    "-password -phoneVerificationCode -phoneVerificationExpires -resetPasswordToken -resetPasswordExpires -refreshToken"
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
  return user;
};

// Log out user
const logOut = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  user.refreshToken = undefined; // Clear refresh token
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
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError("Token de rafraîchissement invalide");
    }
    const newToken = generateToken({ userId: user._id, role: user.role });
    return { token: newToken };
  } catch (error) {
    throw new UnauthorizedError("Token de rafraîchissement invalide");
  }
};

// Search users
const searchUsers = async (query, authUser) => {
  const { page = 1, limit = 10, search } = query;
  const filter = { _id: { $ne: authUser._id } };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const users = await User.find(filter)
    .select("name email socialProfile")
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const count = await User.countDocuments(filter);
  return { users, count };
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

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  deleteUser,
  getAllUsers,
  updatePreferences,
  updateProgress,
  addFriend,
  removeFriend,
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
};
