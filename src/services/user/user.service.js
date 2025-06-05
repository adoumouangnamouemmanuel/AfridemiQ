// This file defines the Mongoose schemas for various educational exercises
const { User } = require("../../modesls/index");
const { generateToken } = require("../utils/jwt.utils");
const BadRequestError = require("../../errors/badRequestError");
const NotFoundError = require("../../errors/notFoundError");
const UnauthorizedError = require("../../errors/unauthorizedError")
const ConflictError = require("../errors/conflictError");

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
};
