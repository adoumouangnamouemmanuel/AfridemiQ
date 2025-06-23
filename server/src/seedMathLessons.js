const mongoose = require("mongoose");
const { Lesson } = require("./models/learning/lesson/lesson.base.model");
const { MathLesson } = require("./models/learning/lesson/lesson.math.model");

// Connect to MongoDB
// const MONGO_URI = "mongodb://localhost:27017/AfricaExamPrep";
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

// Second math lesson data with all base fields included
const getSecondMathLessonData = (topicId, userId) => ({
  // Base lesson fields (required by the discriminator)
  topicId: topicId,
  title: "Résolution graphique et algébrique des équations",
  series: ["D"],
  overview:
    "Cette leçon approfondit les méthodes de résolution des équations du premier et second degré, en combinant les approches graphiques et algébriques pour une compréhension complète.",
  objectives: [
    "Maîtriser la résolution graphique des équations",
    "Comparer les méthodes algébriques et graphiques",
    "Interpréter graphiquement les solutions d'une équation",
    "Résoudre des systèmes d'équations par substitution et élimination",
  ],
  keyPoints: [
    "Une équation f(x) = 0 a pour solutions les abscisses des points d'intersection avec l'axe des x",
    "Les équations f(x) = g(x) ont pour solutions les abscisses des points d'intersection des courbes",
    "La méthode graphique donne une approximation, la méthode algébrique donne la valeur exacte",
    "Les systèmes d'équations peuvent être résolus par plusieurs méthodes",
  ],
  duration: 75, // 75 minutes
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
    text: "La résolution d'équations est une compétence fondamentale en mathématiques. Cette leçon vous permettra de maîtriser les différentes approches, graphiques et algébriques, pour résoudre efficacement tout type d'équation.",
    videoUrl: "https://example.com/videos/resolution-equations-intro.mp4",
    transcript:
      "Dans cette vidéo, nous explorerons les différentes méthodes pour résoudre des équations...",
    accessibility: {
      hasSubtitles: true,
      hasAudioDescription: false,
    },
  },
  concepts: [
    {
      name: "Résolution graphique",
      definition:
        "La résolution graphique consiste à trouver les solutions d'une équation en analysant la représentation graphique des fonctions concernées.",
      topic: "algebra",
      explanation:
        "Cette méthode permet de visualiser les solutions et de comprendre leur signification géométrique.",
      difficultyLevel: "intermediate",
      examples: [
        {
          expression: "x² - 2x - 3 = 0",
          explanation:
            "Graphiquement, on cherche les points où la parabole y = x² - 2x - 3 coupe l'axe des x.",
          steps: [
            "Tracer la courbe y = x² - 2x - 3",
            "Identifier les points d'intersection avec l'axe des x",
            "Lire les abscisses de ces points : x = -1 et x = 3",
          ],
        },
      ],
      formulas: [
        {
          formula: "f(x) = 0 ⟺ Courbe coupe l'axe des x",
          useCase: "Résolution graphique d'équations",
          derivationSteps: [
            "Représenter graphiquement f(x)",
            "Trouver les intersections avec l'axe des x",
          ],
        },
      ],
      visualAid: {
        mediaType: "image",
        url: "https://example.com/images/resolution-graphique.png",
        altText:
          "Graphique montrant l'intersection d'une parabole avec l'axe des x",
      },
    },
    {
      name: "Systèmes d'équations linéaires",
      definition:
        "Un système d'équations linéaires est un ensemble d'équations du premier degré à résoudre simultanément.",
      topic: "algebra",
      explanation:
        "Les systèmes peuvent être résolus par substitution, élimination ou méthodes graphiques.",
      difficultyLevel: "intermediate",
      examples: [
        {
          expression: "{ 2x + y = 5 ; x - y = 1 }",
          explanation:
            "Par addition : (2x + y) + (x - y) = 5 + 1, donc 3x = 6, x = 2, puis y = 1.",
          steps: [
            "Méthode par élimination : additionner les équations",
            "3x = 6, donc x = 2",
            "Substituer dans la première : 2(2) + y = 5, donc y = 1",
            "Vérifier : 2(2) + 1 = 5 ✓ et 2 - 1 = 1 ✓",
          ],
        },
      ],
      formulas: [
        {
          formula: "{ ax + by = c ; dx + ey = f }",
          useCase: "Forme générale d'un système linéaire 2×2",
          derivationSteps: [
            "Méthode de substitution",
            "Méthode d'élimination",
            "Méthode graphique",
          ],
        },
      ],
    },
    {
      name: "Équations du second degré",
      definition:
        "Une équation du second degré est de la forme ax² + bx + c = 0 où a ≠ 0.",
      topic: "algebra",
      explanation:
        "Ces équations peuvent être résolues par factorisation, complétion du carré ou formule quadratique.",
      difficultyLevel: "advanced",
      examples: [
        {
          expression: "x² - 5x + 6 = 0",
          explanation:
            "Par factorisation : (x - 2)(x - 3) = 0, donc x = 2 ou x = 3.",
          steps: [
            "Chercher deux nombres qui multipliés donnent 6 et additionnés donnent -5",
            "Ces nombres sont -2 et -3",
            "Factoriser : x² - 5x + 6 = (x - 2)(x - 3)",
            "Solutions : x = 2 et x = 3",
          ],
        },
      ],
      formulas: [
        {
          formula: "x = (-b ± √(b² - 4ac)) / (2a)",
          useCase: "Formule quadratique pour résoudre ax² + bx + c = 0",
          derivationSteps: [
            "Complétion du carré",
            "Isolation de x",
            "Simplification",
          ],
        },
      ],
    },
    {
      name: "Méthodes de résolution comparées",
      definition:
        "Comparaison entre les méthodes graphiques et algébriques pour choisir l'approche la plus adaptée.",
      topic: "algebra",
      explanation:
        "Chaque méthode a ses avantages selon le contexte et la précision requise.",
      difficultyLevel: "intermediate",
      examples: [
        {
          expression: "x² - 4x + 3 = 0",
          explanation:
            "Méthode graphique : approximation visuelle. Méthode algébrique : solutions exactes x = 1 et x = 3.",
          steps: [
            "Graphique : tracer y = x² - 4x + 3 et lire les intersections",
            "Algébrique : factoriser (x-1)(x-3) = 0",
            "Comparer : graphique donne ≈1 et ≈3, algébrique donne exactement 1 et 3",
          ],
        },
      ],
      formulas: [
        {
          formula: "Précision graphique ≈ ; Précision algébrique =",
          useCase: "Choisir la méthode selon le besoin de précision",
          derivationSteps: [
            "Évaluer le contexte du problème",
            "Déterminer la précision requise",
          ],
        },
      ],
    },
  ],
  theorems: [
    {
      title: "Théorème fondamental de l'algèbre (cas particulier)",
      statement:
        "Toute équation polynomiale de degré n à coefficients complexes admet exactement n solutions (comptées avec multiplicité) dans ℂ.",
      proof: [
        "Pour le cas du second degré : ax² + bx + c = 0",
        "Le discriminant Δ = b² - 4ac détermine la nature des solutions",
        "Si Δ ≥ 0 : deux solutions réelles",
        "Si Δ < 0 : deux solutions complexes conjuguées",
      ],
      applications: [
        "Garantit l'existence de solutions",
        "Détermine le nombre maximum de solutions",
        "Justifie les méthodes de résolution",
      ],
    },
    {
      title: "Théorème de compatibilité des systèmes linéaires",
      statement:
        "Un système d'équations linéaires est compatible si et seulement si le rang de la matrice des coefficients est égal au rang de la matrice augmentée.",
      proof: [
        "Pour un système 2×2 : { ax + by = c ; dx + ey = f }",
        "Le déterminant principal est Δ = ae - bd",
        "Si Δ ≠ 0 : solution unique",
        "Si Δ = 0 : soit aucune solution, soit infinité de solutions",
      ],
      applications: [
        "Déterminer l'existence de solutions",
        "Classifier les systèmes",
        "Choisir la méthode de résolution appropriée",
      ],
    },
  ],
  workedExamples: [
    {
      problem: "Résoudre graphiquement et algébriquement : x² - x - 2 = 0",
      solutionSteps: [
        "Méthode algébrique par factorisation :",
        "Chercher deux nombres qui multipliés donnent -2 et additionnés donnent -1",
        "Ces nombres sont -2 et +1",
        "Factorisation : x² - x - 2 = (x - 2)(x + 1)",
        "Solutions algébriques : x = 2 et x = -1",
        "Méthode graphique :",
        "Tracer la parabole y = x² - x - 2",
        "Identifier les intersections avec l'axe des x",
        "Lecture graphique : x ≈ -1 et x ≈ 2",
        "Vérification : les deux méthodes concordent",
      ],
      answer:
        "Les solutions sont x = -1 et x = 2 (confirmées par les deux méthodes)",
      difficultyLevel: "intermediate",
    },
    {
      problem: "Résoudre le système : { 3x + 2y = 12 ; x - y = 1 }",
      solutionSteps: [
        "Méthode par substitution :",
        "De la seconde équation : x = y + 1",
        "Substituer dans la première : 3(y + 1) + 2y = 12",
        "Développer : 3y + 3 + 2y = 12",
        "Simplifier : 5y = 9, donc y = 9/5",
        "Calculer x : x = 9/5 + 1 = 14/5",
        "Vérification : 3(14/5) + 2(9/5) = 42/5 + 18/5 = 60/5 = 12 ✓",
        "Vérification : 14/5 - 9/5 = 5/5 = 1 ✓",
      ],
      answer: "La solution est x = 14/5 et y = 9/5",
      difficultyLevel: "intermediate",
    },
    {
      problem: "Résoudre graphiquement : 2x - 1 = x² - 3x + 2",
      solutionSteps: [
        "Reformuler comme intersection de deux courbes :",
        "y₁ = 2x - 1 (droite)",
        "y₂ = x² - 3x + 2 (parabole)",
        "Tracer les deux courbes sur le même graphique",
        "Identifier les points d'intersection",
        "Lecture graphique des abscisses : x ≈ 1 et x ≈ 3",
        "Vérification algébrique : x² - 3x + 2 = 2x - 1",
        "Simplifier : x² - 5x + 3 = 0",
        "Solutions exactes : x = (5 ± √13)/2",
      ],
      answer:
        "Solutions approximatives : x ≈ 1 et x ≈ 3 ; Solutions exactes : x = (5 ± √13)/2",
      difficultyLevel: "advanced",
    },
  ],
  practiceExercises: [
    {
      exerciseId: new mongoose.Types.ObjectId(),
      type: "practice",
      description: "Exercices de résolution d'équations mixtes",
      difficultyLevel: "intermediate",
    },
    {
      exerciseId: new mongoose.Types.ObjectId(),
      type: "application",
      description: "Problèmes appliqués avec systèmes d'équations",
      difficultyLevel: "advanced",
    },
    {
      exerciseId: new mongoose.Types.ObjectId(),
      type: "comparison",
      description: "Comparaison des méthodes graphiques et algébriques",
      difficultyLevel: "intermediate",
    },
  ],
  interactiveElements: [
    {
      elementType: "desmos",
      url: "https://www.desmos.com/calculator/resolution-equations",
      instructions:
        "Utilisez le graphique interactif pour visualiser les solutions des équations en temps réel.",
      offlineAvailable: false,
    },
    {
      elementType: "simulation",
      url: "https://example.com/simulation/systemes-equations",
      instructions:
        "Manipulez les coefficients pour voir l'effet sur les solutions du système.",
      offlineAvailable: false,
    },
    {
      elementType: "quiz",
      url: "https://example.com/quiz/methods-comparison",
      instructions:
        "Quiz interactif pour tester votre capacité à choisir la bonne méthode.",
      offlineAvailable: true,
    },
  ],
  summary: {
    keyTakeaways: [
      "La résolution graphique offre une visualisation des solutions",
      "La résolution algébrique donne des valeurs exactes",
      "Les systèmes d'équations nécessitent des méthodes spécifiques",
      "La vérification des solutions est toujours recommandée",
      "Le choix de la méthode dépend du contexte et de la précision requise",
    ],
    suggestedNextTopics: [],
  },
  prerequisites: [],
  learningObjectives: [
    "Résoudre graphiquement des équations du premier et second degré",
    "Maîtriser les méthodes algébriques de résolution",
    "Résoudre des systèmes d'équations linéaires",
    "Comparer et valider les solutions obtenues par différentes méthodes",
    "Choisir la méthode de résolution la plus appropriée selon le contexte",
  ],
  gamification: {
    badges: [
      "Détective d'équations",
      "Maître des systèmes",
      "Expert en méthodes",
    ],
    points: 120,
  },
  accessibilityOptions: {
    hasBraille: false,
    hasSignLanguage: false,
    languages: ["français"],
  },
  premiumOnly: false,
});

// Function to seed the second math lesson
async function seedSecondMathLesson() {
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

    // Create mock exercises for practice exercises validation
    const mockExerciseIds = [
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId(),
    ];

    for (let i = 0; i < mockExerciseIds.length; i++) {
      const existingExercise = await Exercise.findById(mockExerciseIds[i]);
      if (!existingExercise) {
        const exerciseTypes = ["practice", "application", "comparison"];
        const exerciseDescriptions = [
          "Exercices de résolution d'équations mixtes",
          "Problèmes appliqués avec systèmes d'équations",
          "Comparaison des méthodes graphiques et algébriques",
        ];

        await Exercise.create({
          _id: mockExerciseIds[i],
          title: `Exercices de résolution d'équations ${i + 1}`,
          description: exerciseDescriptions[i],
          type: exerciseTypes[i],
          difficulty: i === 1 ? "advanced" : "intermediate",
        });
        console.log(
          `Exercice mock ${i + 1} créé avec l'ID:`,
          mockExerciseIds[i]
        );
      }
    }

    // Delete existing lessons with this title for this topic
    const deleteResult = await MathLesson.deleteMany({
      topicId: topicId,
      title: "Résolution graphique et algébrique des équations",
    });
    console.log(`${deleteResult.deletedCount} leçons existantes supprimées`);

    // Get complete math lesson data and update exercise IDs
    const mathLessonData = getSecondMathLessonData(topicId, userId);
    mathLessonData.practiceExercises[0].exerciseId = mockExerciseIds[0];
    mathLessonData.practiceExercises[1].exerciseId = mockExerciseIds[1];
    mathLessonData.practiceExercises[2].exerciseId = mockExerciseIds[2];

    // Create complete math lesson with validation disabled temporarily
    const mathLesson = new MathLesson(mathLessonData);
    await mathLesson.save({ validateBeforeSave: false });
    console.log("Deuxième leçon de mathématiques créée :", mathLesson._id);

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

    // Display theorems
    console.log("\n=== THÉORÈMES COUVERTS ===");
    mathLesson.theorems.forEach((theorem, index) => {
      console.log(`${index + 1}. ${theorem.title}`);
      console.log(`   - Applications : ${theorem.applications.length}`);
    });

    // Display worked examples
    console.log("\n=== EXEMPLES RÉSOLUS ===");
    mathLesson.workedExamples.forEach((example, index) => {
      console.log(`${index + 1}. ${example.problem}`);
      console.log(`   - Niveau : ${example.difficultyLevel}`);
      console.log(`   - Étapes : ${example.solutionSteps.length}`);
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
seedSecondMathLesson();
