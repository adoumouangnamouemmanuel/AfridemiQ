const { User } = require('../models/AfricaExamPrepMongoSchema');

// Create a user
const createUser = async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      country: 'Tchad',
      isPremium: false,
      subscription: {
        type: 'free',
        startDate: new Date(),
        paymentStatus: 'active',
        features: ['basicContent'],
        accessLevel: 'basic',
      },
      preferences: {
        notifications: { general: true, progressUpdates: true },
        fontSize: 'medium',
        preferredContentFormat: 'text',
        enableHints: true,
        showStepSolutions: true,
        leaderboardVisibility: true,
        allowFriendRequests: true,
        multilingualSupport: ['French'],
      },
      settings: {
        learningStyle: 'visual',
        preferredStudySessionLength: 45,
      },
      progress: {
        selectedExam: 'exam-001',
        selectedSeries: 'Bac_D',
        xp: 0,
        level: 1,
        streak: { current: 0, longest: 0 },
        totalQuizzes: 0,
        averageScore: 0,
      },
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a user
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('analyticsId')
      .populate('notes');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { createUser, getUser };