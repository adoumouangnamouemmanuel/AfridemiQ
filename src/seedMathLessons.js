const mongoose = require("mongoose");
const { Lesson } = require("./models/learning/lesson/lesson.base.model");
const { MathLesson } = require("./models/learning/lesson/lesson.math.model");

// Connect to MongoDB
const MONGO_URI = "mongodb://localhost:27017/AfricaExamPrep";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion:", err));

// Import required models to register them
const { Topic } = require("./models/learning/topic.model");
const { Subject } = require("./models/learning/subject.model");

// Mock User model registration
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    role: String,
  },
  { timestamps: true }
);

// Mock Exercise model registration
const ExerciseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    type: String,
    difficulty: String,
  },
  { timestamps: true }
);

// Mock Quiz model registration
const QuizSchema = new mongoose.Schema(
  {
    title: String,
    questions: [String],
    type: String,
  },
  { timestamps: true }
);

// Mock Resource model registration
const ResourceSchema = new mongoose.Schema(
  {
    title: String,
    type: String,
    url: String,
  },
  { timestamps: true }
);

// Register models if not already registered
let User, Exercise, Quiz, Resource;
try {
  User = mongoose.model("User");
} catch (error) {
  User = mongoose.model("User", UserSchema);
}

try {
  Exercise = mongoose.model("Exercise");
} catch (error) {
  Exercise = mongoose.model("Exercise", ExerciseSchema);
}

try {
  Quiz = mongoose.model("Quiz");
} catch (error) {
  Quiz = mongoose.model("Quiz", QuizSchema);
}

try {
  Resource = mongoose.model("Resource");
} catch (error) {
  Resource = mongoose.model("Resource", ResourceSchema);
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

// Function to get User ID (mock user for metadata)
function getMockUserId() {
  return new mongoose.Types.ObjectId("6840c7494a8d3286ee2f7e7d");
}

// Complete math lesson data with all base fields included
const getCompleteMathLessonData = (topicId, userId) => ({
  // Base lesson fields (required by the discriminator)
  topicId: topicId,
  title: "Introduction aux fonctions quadratiques",
  series: ["D"],
  overview:
    "Cette leçon introduit les concepts fondamentaux des fonctions quadratiques, leur représentation graphique et leurs applications pratiques.",
  objectives: [
    "Comprendre la définition d'une fonction quadratique",
    "Identifier les éléments caractéristiques d'une parabole",
    "Résoudre des équations du second degré",
    "Appliquer les fonctions quadratiques à des problèmes concrets",
  ],
  keyPoints: [
    "Forme générale : f(x) = ax² + bx + c",
    "Le discriminant détermine le nombre de solutions",
    "Le sommet de la parabole a pour coordonnées (-b/2a, f(-b/2a))",
    "Les applications incluent la trajectoire des projectiles et l'optimisation",
  ],
  duration: 90, // 90 minutes
  resourceIds: [],
  exerciseIds: [],
  interactivityLevel: "high",
  offlineAvailable: true,
  premiumOnly: false,
  metadata: {
    createdBy: userId,
    updatedBy: userId,
  },
  progressTracking: {
    totalAttempts: 0,
    totalCompletions: 0,
    averageCompletionTime: 0,
    completionRate: 0,
    averageScore: 0,
    totalStudyTime: 0,
    completedBy: [],
    difficultyRating: 0,
    averageHintsUsed: 0,
  },
  feedback: [],

  // Math-specific fields
  introduction: {
    text: "Les fonctions quadratiques sont omniprésentes dans notre quotidien, de la trajectoire d'un ballon à l'optimisation des profits d'une entreprise. Cette leçon vous permettra de maîtriser ces concepts essentiels.",
    videoUrl: "https://example.com/videos/fonctions-quadratiques-intro.mp4",
    transcript:
      "Dans cette vidéo, nous découvrirons ensemble les fonctions quadratiques...",
    accessibility: {
      hasSubtitles: true,
      hasAudioDescription: false,
    },
  },
  concepts: [
    {
      name: "Fonction quadratique",
      definition:
        "Une fonction quadratique est une fonction polynomiale de degré 2, de la forme f(x) = ax² + bx + c où a ≠ 0.",
      topic: "algebra",
      explanation:
        "Le terme quadratique vient du latin 'quadratus' qui signifie carré, en référence au terme x².",
      difficultyLevel: "intermediate",
      examples: [
        {
          expression: "f(x) = 2x² - 3x + 1",
          explanation:
            "Ici, a = 2, b = -3, c = 1. La parabole s'ouvre vers le haut car a > 0.",
          steps: [
            "Identifier les coefficients : a = 2, b = -3, c = 1",
            "Déterminer le sens d'ouverture : a > 0 donc ouverture vers le haut",
            "Calculer le discriminant : Δ = b² - 4ac = 9 - 8 = 1",
          ],
        },
      ],
      formulas: [
        {
          formula: "f(x) = ax² + bx + c",
          useCase: "Forme générale d'une fonction quadratique",
          derivationSteps: [
            "Polynôme de degré 2",
            "Coefficient dominant a ≠ 0",
          ],
        },
      ],
      visualAid: {
        mediaType: "image",
        url: "https://example.com/images/parabole-generale.png",
        altText:
          "Graphique d'une parabole montrant l'axe de symétrie et le sommet",
      },
    },
    {
      name: "Discriminant",
      definition:
        "Le discriminant d'une équation quadratique ax² + bx + c = 0 est Δ = b² - 4ac.",
      topic: "algebra",
      explanation:
        "Le discriminant permet de déterminer le nombre et la nature des solutions de l'équation.",
      difficultyLevel: "intermediate",
      examples: [
        {
          expression: "x² - 5x + 6 = 0",
          explanation:
            "Δ = 25 - 24 = 1 > 0, donc deux solutions réelles distinctes.",
          steps: [
            "Identifier a = 1, b = -5, c = 6",
            "Calculer Δ = (-5)² - 4(1)(6) = 25 - 24 = 1",
            "Δ > 0 : deux solutions réelles distinctes",
          ],
        },
      ],
      formulas: [
        {
          formula: "Δ = b² - 4ac",
          useCase:
            "Déterminer le nombre de solutions d'une équation quadratique",
          derivationSteps: [
            "Provient de la forme canonique",
            "Analyse du terme sous la racine",
          ],
        },
      ],
    },
  ],
  theorems: [
    {
      title: "Théorème de Viète",
      statement:
        "Pour une équation ax² + bx + c = 0 ayant deux racines x₁ et x₂, on a : x₁ + x₂ = -b/a et x₁ × x₂ = c/a",
      proof: [
        "Soit f(x) = ax² + bx + c avec racines x₁ et x₂",
        "Alors f(x) = a(x - x₁)(x - x₂)",
        "En développant : f(x) = a(x² - (x₁ + x₂)x + x₁x₂)",
        "Par identification : -(x₁ + x₂) = b/a et x₁x₂ = c/a",
      ],
      applications: [
        "Vérification de solutions",
        "Construction d'équations à partir de leurs racines",
        "Simplification de calculs",
      ],
    },
  ],
  workedExamples: [
    {
      problem: "Résoudre l'équation 2x² - 7x + 3 = 0",
      solutionSteps: [
        "Identifier les coefficients : a = 2, b = -7, c = 3",
        "Calculer le discriminant : Δ = (-7)² - 4(2)(3) = 49 - 24 = 25",
        "Δ > 0, donc deux solutions réelles",
        "x₁ = (7 + √25)/(2×2) = (7 + 5)/4 = 3",
        "x₂ = (7 - √25)/(2×2) = (7 - 5)/4 = 1/2",
      ],
      answer: "Les solutions sont x = 3 et x = 1/2",
      difficultyLevel: "intermediate",
    },
  ],
  practiceExercises: [
    {
      exerciseId: new mongoose.Types.ObjectId(),
      type: "practice",
      description: "Exercices sur la résolution d'équations quadratiques",
      difficultyLevel: "intermediate",
    },
  ],
  interactiveElements: [
    {
      elementType: "geogebra",
      url: "https://www.geogebra.org/m/fonction-quadratique",
      instructions:
        "Manipulez les curseurs pour voir l'effet des paramètres a, b et c sur la parabole.",
      offlineAvailable: false,
    },
  ],
  summary: {
    keyTakeaways: [
      "Les fonctions quadratiques ont une représentation graphique en forme de parabole",
      "Le discriminant détermine le nombre de solutions de l'équation associée",
      "Le sommet de la parabole est un point d'optimisation important",
    ],
    suggestedNextTopics: [],
  },
  prerequisites: [],
  learningObjectives: [
    "Maîtriser la forme générale des fonctions quadratiques",
    "Savoir calculer et interpréter le discriminant",
    "Résoudre des équations du second degré",
    "Comprendre la représentation graphique des paraboles",
  ],
  gamification: {
    badges: ["Expert en équations", "Maître des paraboles"],
    points: 150,
  },
  accessibilityOptions: {
    hasBraille: false,
    hasSignLanguage: false,
    languages: ["français"],
  },
  premiumOnly: false,
});

// Function to seed math lessons
async function seedMathLessons() {
  try {
    // Get topic ID for "Fonctions et équations"
    const topicId = await getTopicIdByName("Fonctions et équations");
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

    // Create mock exercise for practiceExercises validation
    const mockExerciseId = new mongoose.Types.ObjectId();
    const existingExercise = await Exercise.findById(mockExerciseId);
    if (!existingExercise) {
      await Exercise.create({
        _id: mockExerciseId,
        title: "Exercices sur les fonctions quadratiques",
        description:
          "Série d'exercices pour pratiquer la résolution d'équations quadratiques",
        type: "practice",
        difficulty: "intermediate",
      });
      console.log("Exercice mock créé avec l'ID:", mockExerciseId);
    }

    // Delete existing lessons for this topic
    const deleteResult = await MathLesson.deleteMany({
      topicId: topicId,
      title: "Introduction aux fonctions quadratiques",
    });
    console.log(`${deleteResult.deletedCount} leçons existantes supprimées`);

    // Get complete math lesson data and update exerciseId
    const mathLessonData = getCompleteMathLessonData(topicId, userId);
    mathLessonData.practiceExercises[0].exerciseId = mockExerciseId;

    // Create complete math lesson with validation disabled temporarily
    const mathLesson = new MathLesson(mathLessonData);
    await mathLesson.save({ validateBeforeSave: false });
    console.log("Leçon de mathématiques créée :", mathLesson._id);

    // Display summary
    console.log("\n=== RÉSUMÉ DE L'ENSEMENCEMENT ===");
    console.log("Topic :", "Fonctions et équations");
    console.log("Titre de la leçon :", mathLesson.title);
    console.log("Série :", mathLesson.series.join(", "));
    console.log("Durée estimée :", mathLesson.duration, "minutes");
    console.log("Niveau d'interactivité :", mathLesson.interactivityLevel);
    console.log("Nombre de concepts :", mathLesson.concepts.length);
    console.log("Nombre de théorèmes :", mathLesson.theorems.length);
    console.log("Nombre d'exemples :", mathLesson.workedExamples.length);
    console.log(
      "Nombre d'exercices pratiques :",
      mathLesson.practiceExercises.length
    );
    console.log(
      "Éléments interactifs :",
      mathLesson.interactiveElements.length
    );

    // Display concepts
    console.log("\n=== CONCEPTS COUVERTS ===");
    mathLesson.concepts.forEach((concept, index) => {
      console.log(`${index + 1}. ${concept.name} (${concept.difficultyLevel})`);
      console.log(
        `   - Définition : ${concept.definition.substring(0, 80)}...`
      );
      console.log(`   - Exemples : ${concept.examples.length}`);
      console.log(`   - Formules : ${concept.formulas.length}`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log("\nConnexion MongoDB fermée");
  } catch (err) {
    console.error("Erreur lors de l'ensemencement :", err);
    process.exit(1);
  }
}

// Execute seeding function
seedMathLessons();
