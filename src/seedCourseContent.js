const mongoose = require("mongoose");
const { CourseContent } = require("./models/learning/course.content.model");

// Connect to MongoDB
// const MONGO_URI = "mongodb://localhost:27017/AfricaExamPrep";
MONGO_URI="mongodb+srv://adoumouangnamouemmanuel:LEgraoe90062033?@africa-exam-prep.rcj7p7m.mongodb.net/AfricaExamPrep"
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion:", err));

// Import required models to register them
const { Topic } = require("./models/learning/topic.model");
const { Subject } = require("./models/learning/subject.model");
const { Lesson } = require("./models/learning/lesson/lesson.base.model");
const { MathLesson } = require("./models/learning/lesson/lesson.math.model");

// Mock User model registration
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    role: String,
  },
  { timestamps: true }
);

// Mock Exam model registration
const ExamSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    series: [String],
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  },
  { timestamps: true }
);

// Register models if not already registered
let User, Exam;
try {
  User = mongoose.model("User");
} catch (error) {
  User = mongoose.model("User", UserSchema);
}

try {
  Exam = mongoose.model("Exam");
} catch (error) {
  Exam = mongoose.model("Exam", ExamSchema);
}

// Function to get Subject ID by name
async function getSubjectIdByName(subjectName) {
  const subject = await Subject.findOne({ name: subjectName }).select(
    "_id name"
  );

  if (!subject) {
    throw new Error(`Erreur : La matière "${subjectName}" n'a pas été trouvée`);
  }

  console.log("Matière trouvée :", subject.name, "- ID:", subject._id);
  return subject._id;
}

// Function to get Topic ID by name
async function getTopicIdByName(topicName) {
  const topic = await Topic.findOne({ name: topicName }).select("_id name");

  if (!topic) {
    throw new Error(`Erreur : Le topic "${topicName}" n'a pas été trouvé`);
  }

  console.log("Topic trouvé :", topic.name, "- ID:", topic._id);
  return topic._id;
}

// Function to get Math Lesson ID by title
async function getMathLessonIdByTitle(lessonTitle) {
  const lesson = await MathLesson.findOne({ title: lessonTitle }).select(
    "_id title"
  );

  if (!lesson) {
    throw new Error(`Erreur : La leçon "${lessonTitle}" n'a pas été trouvée`);
  }

  console.log("Leçon trouvée :", lesson.title, "- ID:", lesson._id);
  return lesson._id;
}

// Function to get User ID (mock user for metadata)
function getMockUserId() {
  return new mongoose.Types.ObjectId("6840c7494a8d3286ee2f7e7d");
}

// Function to create or get mock exam
async function getOrCreateMockExam(subjectId) {
  let exam = await Exam.findOne({ name: "Baccalauréat Série D" });

  if (!exam) {
    exam = await Exam.create({
      name: "Baccalauréat Série D",
      type: "baccalaureat",
      series: ["D"],
      subjects: [subjectId],
    });
    console.log("Examen mock créé avec l'ID:", exam._id);
  } else {
    console.log("Examen existant trouvé avec l'ID:", exam._id);
  }

  return exam._id;
}

// Complete course content data
const getCompleteCourseContentData = (
  subjectId,
  topicId,
  examId,
  lessonId,
  userId
) => ({
  // Course identification
  examId: [examId],
  subjectId: subjectId,
  topicId: [topicId],
  series: ["D"],

  // Course details
  title: "Cours complet : Fonctions Quadratiques - Série D",
  description:
    "Cours complet sur les fonctions quadratiques pour la série D. Ce cours couvre tous les aspects fondamentaux des fonctions du second degré, de leur définition à leurs applications pratiques, en passant par la résolution d'équations et l'analyse graphique.",
  level: "intermediate",

  // Course structure
  modules: [
    {
      id: "module_1",
      title: "Introduction aux fonctions quadratiques",
      description:
        "Découverte des concepts fondamentaux des fonctions quadratiques et de leurs propriétés de base.",
      order: 1,
      series: "D",
      lessons: [lessonId],
      exerciseIds: [],
      assessment: null,
      progressTracking: {
        completedLessons: 0,
        totalLessons: 1,
      },
      estimatedDuration: 90,
      prerequisites: ["Algèbre de base", "Fonctions linéaires"],
      isLocked: false,
      unlockConditions: {
        requiredModules: [],
        minimumScore: 0,
      },
    },
    {
      id: "module_2",
      title: "Résolution d'équations quadratiques",
      description:
        "Techniques de résolution des équations du second degré et utilisation du discriminant.",
      order: 2,
      series: "D",
      lessons: [],
      exerciseIds: [],
      assessment: null,
      progressTracking: {
        completedLessons: 0,
        totalLessons: 0,
      },
      estimatedDuration: 75,
      prerequisites: ["Introduction aux fonctions quadratiques"],
      isLocked: true,
      unlockConditions: {
        requiredModules: ["module_1"],
        minimumScore: 70,
      },
    },
    {
      id: "module_3",
      title: "Applications pratiques",
      description:
        "Applications des fonctions quadratiques dans des problèmes concrets et d'optimisation.",
      order: 3,
      series: "D",
      lessons: [],
      exerciseIds: [],
      assessment: null,
      progressTracking: {
        completedLessons: 0,
        totalLessons: 0,
      },
      estimatedDuration: 60,
      prerequisites: ["Résolution d'équations quadratiques"],
      isLocked: true,
      unlockConditions: {
        requiredModules: ["module_1", "module_2"],
        minimumScore: 75,
      },
    },
  ],

  prerequisites: [
    "Maîtrise de l'algèbre de base",
    "Connaissance des fonctions linéaires",
    "Notions de géométrie analytique",
  ],
  estimatedDuration: 225, // 3h45 au total

  // Progress tracking
  progressTracking: {
    completedLessons: 0,
    totalLessons: 1,
    lastAccessedAt: null,
    averageCompletionTime: 0,
  },

  // Course settings
  accessibilityOptions: {
    languages: ["french"],
    formats: ["text", "video", "interactive"],
    accommodations: [],
    hasAudioVersion: false,
    hasBrailleVersion: false,
    screenReaderFriendly: true,
  },
  premiumOnly: false,
  accessType: "free",

  // Analytics and engagement
  analytics: {
    enrollmentCount: 0,
    completionRate: 0,
    averageRating: 0,
    totalViews: 0,
    lastViewedAt: null,
  },

  // Course metadata
  metadata: {
    createdBy: userId,
    updatedBy: userId,
    lastModified: new Date(),
    tags: [
      "mathématiques",
      "fonctions",
      "quadratiques",
      "série d",
      "baccalauréat",
      "algèbre",
      "équations",
    ],
    version: 1,
    status: "published",
    publishedAt: new Date(),
    lastReviewDate: new Date(),
    reviewNotes: "Cours validé et prêt pour la publication",
  },

  // Course status
  isActive: true,
  isArchived: false,
});

// Function to seed course content
async function seedCourseContent() {
  try {
    // Get references to existing entities
    const subjectId = await getSubjectIdByName("Mathématiques");
    const topicId = await getTopicIdByName("Fonctions et équations");
    const lessonId = await getMathLessonIdByTitle(
      "Introduction aux fonctions quadratiques"
    );
    const userId = getMockUserId();

    // Create mock user if it doesn't exist
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      await User.create({
        _id: userId,
        name: "System User",
        email: "system@africaexamprep.com",
        role: "admin",
      });
      console.log("Utilisateur mock créé avec l'ID:", userId);
    } else {
      console.log("Utilisateur existant trouvé avec l'ID:", userId);
    }

    // Create or get mock exam
    const examId = await getOrCreateMockExam(subjectId);

    // Delete existing course content for this topic and series
    const deleteResult = await CourseContent.deleteMany({
      subjectId: subjectId,
      topicId: { $in: [topicId] },
      series: { $in: ["D"] },
      title: "Cours complet : Fonctions Quadratiques - Série D",
    });
    console.log(
      `${deleteResult.deletedCount} contenu de cours existant supprimé`
    );

    // Get complete course content data
    const courseContentData = getCompleteCourseContentData(
      subjectId,
      topicId,
      examId,
      lessonId,
      userId
    );

    // Create course content
    const courseContent = new CourseContent(courseContentData);
    await courseContent.save();
    console.log("Contenu de cours créé :", courseContent._id);

    // Display summary
    console.log("\n=== RÉSUMÉ DE L'ENSEMENCEMENT ===");
    console.log("Matière :", "Mathématiques");
    console.log("Topic :", "Fonctions et équations");
    console.log("Série :", courseContent.series.join(", "));
    console.log("Titre du cours :", courseContent.title);
    console.log("Niveau :", courseContent.level);
    console.log("Durée estimée :", courseContent.estimatedDuration, "minutes");
    console.log("Nombre de modules :", courseContent.modules.length);
    console.log("Type d'accès :", courseContent.accessType);
    console.log("Statut :", courseContent.metadata.status);

    // Display modules
    console.log("\n=== MODULES DU COURS ===");
    courseContent.modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.title}`);
      console.log(`   - ID : ${module.id}`);
      console.log(`   - Ordre : ${module.order}`);
      console.log(`   - Durée estimée : ${module.estimatedDuration} minutes`);
      console.log(`   - Leçons : ${module.lessons.length}`);
      console.log(`   - Verrouillé : ${module.isLocked ? "Oui" : "Non"}`);
      console.log(`   - Prérequis : ${module.prerequisites.join(", ")}`);
    });

    // Display statistics
    console.log("\n=== STATISTIQUES ===");
    console.log(
      "Total des leçons :",
      courseContent.progressTracking.totalLessons
    );
    console.log(
      "Leçons complétées :",
      courseContent.progressTracking.completedLessons
    );
    console.log(
      "Pourcentage de complétion :",
      courseContent.completionPercentage,
      "%"
    );
    console.log("Nombre de tags :", courseContent.metadata.tags.length);
    console.log("Tags :", courseContent.metadata.tags.join(", "));

    // Display virtual fields
    console.log("\n=== CHAMPS VIRTUELS ===");
    console.log("Total modules :", courseContent.totalModules);
    console.log("Total exercices :", courseContent.totalExercises);
    console.log("Heures estimées :", courseContent.estimatedHours);
    console.log("Cours terminé :", courseContent.isCompleted ? "Oui" : "Non");
    console.log(
      "Complétion moyenne modules :",
      courseContent.averageModuleCompletion,
      "%"
    );

    // Close connection
    await mongoose.connection.close();
    console.log("\nConnexion MongoDB fermée");
  } catch (err) {
    console.error("Erreur lors de l'ensemencement :", err);
    process.exit(1);
  }
}

// Execute seeding function
seedCourseContent();
