const { StatusCodes } = require("http-status-codes");
const userService = require("../services/user.service");

// Register a new user
const register = async (req, res) => {
  const { user, token } = await userService.register(req.body);
  res.status(StatusCodes.CREATED).json({
    message: "Utilisateur créé avec succès",
    data: { user, token },
  });
};

// Login user
const login = async (req, res) => {
  const { user, token } = await userService.login(req.body);
  res.status(StatusCodes.OK).json({
    message: "Connexion réussie",
    data: { user, token },
  });
};

// Get user profile
const getProfile = async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  res.status(StatusCodes.OK).json({
    message: "Profil récupéré avec succès",
    data: user,
  });
};

// Update user profile
const updateProfile = async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.status(StatusCodes.OK).json({
    message: "Profil mis à jour avec succès",
    data: user,
  });
};

// Delete user
const deleteUser = async (req, res) => {
  await userService.deleteUser(req.user._id);
  res.status(StatusCodes.OK).json({
    message: "Utilisateur supprimé avec succès",
  });
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  const { users, count } = await userService.getAllUsers(req.query);
  res.status(StatusCodes.OK).json({
    message: "Liste des utilisateurs récupérée",
    data: { users, total: count },
  });
};

// Update preferences
const updatePreferences = async (req, res) => {
  const user = await userService.updatePreferences(req.user._id, req.body);
  res.status(StatusCodes.OK).json({
    message: "Préférences mises à jour",
    data: user,
  });
};

// Update progress
const updateProgress = async (req, res) => {
  const user = await userService.updateProgress(req.user._id, req.body);
  res.status(StatusCodes.OK).json({
    message: "Progrès mis à jour",
    data: user,
  });
};

// Add friend
const addFriend = async (req, res) => {
  const user = await userService.addFriend(req.user._id, req.body.friendId);
  res.status(StatusCodes.OK).json({
    message: "Ami ajouté avec succès",
    data: user,
  });
};

// Remove friend
const removeFriend = async (req, res) => {
  const user = await userService.removeFriend(req.user._id, req.body.friendId);
  res.status(StatusCodes.OK).json({
    message: "Ami supprimé avec succès",
    data: user,
  });
};

// Verify phone
const verifyPhone = async (req, res) => {
  const user = await userService.verifyPhone(req.user._id, req.body.code);
  res.status(StatusCodes.OK).json({
    message: "Téléphone vérifié avec succès",
    data: user,
  });
};

// Request phone verification code
const requestPhoneVerification = async (req, res) => {
  await userService.requestPhoneVerification(
    req.user._id,
    req.body.phoneNumber
  );
  res.status(StatusCodes.OK).json({
    message: "Code de vérification envoyé",
  });
};

// Update subscription
const updateSubscription = async (req, res) => {
  const user = await userService.updateSubscription(req.user._id, req.body);
  res.status(StatusCodes.OK).json({
    message: "Abonnement mis à jour",
    data: user,
  });
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