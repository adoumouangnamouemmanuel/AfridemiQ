// This file defines the Mongoose schemas for various educational exercises
const { User } = require("../../models/index");
const { generateToken } = require("../../utils/jwt.utils");
const BadRequestError = require("../../errors/badRequestError");
const NotFoundError = require("../../errors/notFoundError");
const UnauthorizedError = require("../../errors/unauthorizedError");
const ConflictError = require("../../errors/conflictError");
const redis = require("redis");

// Redis client for token blacklisting
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient
  .connect()
  .catch((err) => console.error("Redis connection error:", err));

// Register a new user
const register = async (userData) => {
  const { email, password } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ConflictError("Email déjà utilisé");
  userData.password = await bcrypt.hash(password, 10);
  const user = await User.create(userData);
  const token = generateToken({ userId: user._id, role: user.role });
  return { user: user.toJSON(), token };
};

// Login user
const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new UnauthorizedError("Email ou mot de passe incorrect");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new UnauthorizedError("Email ou mot de passe incorrect");
  user.lastLogin = new Date();
  await user.save();
  const token = generateToken({ userId: user._id, role: user.role });
  return { user: user.toJSON(), token };
};

// Get user profile
const getProfile = async (userId) => {
  const user = await User.findById(userId).select(
    "-password -phoneVerificationCode -phoneVerificationExpires"
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
  }).select("-password -phoneVerificationCode -phoneVerificationExpires");
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
    .select("-password -phoneVerificationCode -phoneVerificationExpires")
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
    { new: true, runValidators: true }
  ).select("-password -phoneVerificationCode -phoneVerificationExpires");
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  return user;
};

// Update progress
const updateProgress = async (userId, progress) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { progress },
    { new: true, runValidators: true }
  ).select("-password -phoneVerificationCode -phoneVerificationExpires");
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  return user;
};

// Add friend
const addFriend = async (userId, friendId) => {
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
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  if (!user.friends.includes(friendId))
    throw new NotFoundError("Cet utilisateur n’est pas un ami");
  user.friends = user.friends.filter((f) => f.toString() !== friendId);
  await user.save();
  return user;
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
    "-password -phoneVerificationCode -phoneVerificationExpires"
  );
  if (!user) throw new NotFoundError("Utilisateur non trouvé");
  if (authUser.role !== "admin" && authUser._id !== userId) {
    if (
      user.socialProfile.visibility === "private" &&
      !user.friends.includes(authUser._id)
    ) {
      throw new ForbiddenError("Accès au profil non autorisé");
    }
    if (
      user.socialProfile.visibility === "friends" &&
      !user.friends.includes(authUser._id)
    ) {
      throw new ForbiddenError("Accès au profil réservé aux amis");
    }
  }
  return user;
};

// Log out user
const logOut = async (userId, token) => {
  // Blacklist token in Redis with remaining TTL
  const decoded = jwt.decode(token);
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
  if (expiresIn > 0) {
    await redisClient.setEx(`blacklist:${token}`, expiresIn, "1");
  }
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
  // TODO: Implement email service to send reset link
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
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) throw new UnauthorizedError("Utilisateur non trouvé");
    const isBlacklisted = await redisClient.get(`blacklist:${refreshToken}`);
    if (isBlacklisted) throw new UnauthorizedError("Token révoqué");
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

// Update social profile
const updateSocialProfile = async (userId, socialProfile) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { socialProfile },
    { new: true, runValidators: true }
  ).select("-password -phoneVerificationCode -phoneVerificationExpires");
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
