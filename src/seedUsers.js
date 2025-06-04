const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User } = require('./models/AfricaExamPrepMongoSchema');

// Load .env from parent directory
dotenv.config({ path: '../.env' });

// Check if MONGODB_URI is defined
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function seedUsers() {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Generate temporary ObjectIds
    const tempNonPremiumId = new mongoose.Types.ObjectId();
    const tempPremiumId = new mongoose.Types.ObjectId();

    // Non-premium user (Chad, Bac Series D)
    const nonPremiumUser = new User({
      _id: tempNonPremiumId,
      name: 'Adoum Emmanuel',
      email: 'adoum@example.com',
      country: 'Chad',
      timeZone: 'Africa/Ndjamena',
      preferredLanguage: 'French',
      schoolName: 'Lycée de N’Djaména',
      gradeLevel: 'Terminale',
      parentEmail: 'parent.adoum@example.com',
      createdAt: new Date(),
      isPremium: false,
      subscription: {
        type: 'free',
        startDate: new Date(),
        paymentStatus: 'active',
        trialPeriod: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
        },
        features: ['basicContent', 'freeQuizzes'],
        accessLevel: 'basic',
      },
      preferences: {
        notifications: {
          general: true,
          dailyReminderTime: '18:00',
          challengeNotifications: false,
          progressUpdates: true,
        },
        darkMode: false,
        fontSize: 'medium',
        preferredContentFormat: 'text',
        enableHints: true,
        autoPlayAudio: false,
        showStepSolutions: true,
        leaderboardVisibility: true,
        allowFriendRequests: true,
        multilingualSupport: ['French'],
      },
      settings: {
        learningStyle: 'visual',
        motivation: 'Pass Baccalauréat Series D',
        preferredStudySessionLength: 45,
      },
      progress: {
        selectedExam: 'bac-001',
        selectedSeries: 'Bac_D',
        selectedLevel: 'Terminale',
        xp: 0,
        level: 1,
        streak: {
          current: 0,
          longest: 0,
        },
        goalDate: new Date('2025-06-30'),
        totalQuizzes: 0,
        averageScore: 0,
        completedTopics: [],
        weakSubjects: ['Math_Limits', 'French_Dissertation'],
        badges: [],
        achievements: [],
        progressSummary: {
          completedPercentage: 0,
          remainingTopics: 20,
        },
      },
      socialProfile: {
        userId: tempNonPremiumId, // Set to match _id
        bio: 'Student preparing for Bac Series D in Chad',
        publicAchievements: [],
        visibility: 'public',
        socialLinks: [],
      },
    });

    // Premium user (Cameroon, Bac Series D)
    const premiumUser = new User({
      _id: tempPremiumId,
      name: 'Marie Ngo',
      email: 'marie@example.com',
      country: 'Cameroon',
      timeZone: 'Africa/Douala',
      preferredLanguage: 'French',
      schoolName: 'Lycée de Douala',
      gradeLevel: 'Terminale',
      parentEmail: 'parent.marie@example.com',
      createdAt: new Date(),
      isPremium: true,
      subscription: {
        type: 'premium',
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1-year subscription
        paymentStatus: 'active',
        features: ['premiumContent', 'unlimitedQuizzes', 'peerTutoring', 'offlineAccess'],
        accessLevel: 'premium',
      },
      preferences: {
        notifications: {
          general: true,
          dailyReminderTime: '19:00',
          challengeNotifications: true,
          progressUpdates: true,
        },
        darkMode: true,
        fontSize: 'large',
        preferredContentFormat: 'video',
        enableHints: true,
        autoPlayAudio: true,
        showStepSolutions: true,
        leaderboardVisibility: false,
        allowFriendRequests: false,
        multilingualSupport: ['French', 'English'],
      },
      settings: {
        learningStyle: 'auditory',
        motivation: 'Excel in Baccalauréat Series D',
        preferredStudySessionLength: 60,
      },
      progress: {
        selectedExam: 'bac-001',
        selectedSeries: 'Bac_D',
        selectedLevel: 'Terminale',
        xp: 100,
        level: 2,
        streak: {
          current: 3,
          longest: 3,
          lastStudyDate: new Date(),
        },
        goalDate: new Date('2025-06-30'),
        totalQuizzes: 5,
        averageScore: 85,
        completedTopics: ['Math_Limits_Intro'],
        weakSubjects: ['French_Dissertation'],
        badges: ['FirstQuiz', 'ThreeDayStreak'],
        achievements: ['Completed First Topic'],
        progressSummary: {
          completedPercentage: 5,
          remainingTopics: 19,
        },
      },
      socialProfile: {
        userId: tempPremiumId, // Set to match _id
        bio: 'Premium student aiming for top Bac Series D results in Cameroon',
        publicAchievements: ['Completed First Topic'],
        visibility: 'friends',
        socialLinks: [{ platform: 'LinkedIn', url: 'https://linkedin.com/in/marie-ngo' }],
      },
    });

    // Save users
    const savedNonPremium = await nonPremiumUser.save();
    const savedPremium = await premiumUser.save();

    console.log('Seeded users:');
    console.log('Non-Premium User:', savedNonPremium.email);
    console.log('Premium User:', savedPremium.email);

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding users:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedUsers();