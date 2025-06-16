const mongoose = require("mongoose");
const { Topic } = require("./models/learning/topic.model");

// Connecter à MongoDB
const MONGO_URI = "mongodb://localhost:27017/AfricaExamPrep";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion:", err));

// Nom de la matière pour laquelle créer les topics
const subjectName = "Mathématiques";

// Fonction pour récupérer l'ID de la matière Mathématiques
async function getMathSubjectId() {
  const { Subject } = require("./models/learning/subject.model");
  const mathSubject = await Subject.findOne({ name: subjectName }).select(
    "_id name"
  );

  if (!mathSubject) {
    throw new Error(`Erreur : La matière "${subjectName}" n'a pas été trouvée`);
  }

  console.log("Matière trouvée :", mathSubject.name, "- ID:", mathSubject._id);
  return mathSubject._id;
}

// Données des topics de mathématiques
const getTopicsData = (subjectId) => [
  {
    name: "Fonctions et équations",
    subjectId: subjectId,
    series: ["D"],
    description:
      "Étude des fonctions linéaires, quadratiques et exponentielles. Résolution d'équations du premier et second degré.",
    difficulty: "intermediate",
    estimatedTime: 120, // en minutes
    estimatedCompletionDate: new Date("2026-10-15"),
    relatedTopics: ["Dérivées", "Limites"],
    hasPractice: true,
    hasNote: true,
    hasStudyMaterial: true,
    prerequisites: ["Algèbre de base", "Nombres réels"],
    learningObjectives: [
      "Comprendre le concept de fonction",
      "Résoudre des équations du second degré",
      "Tracer des graphiques de fonctions",
      "Analyser le comportement des fonctions",
    ],
    estimatedTimeToMaster: 180, // en minutes
    resourceIds: [],
    assessmentCriteria: {
      minimumScore: 70,
      requiredPracticeQuestions: 25,
      masteryThreshold: 85,
    },
  },
  {
    name: "Géométrie analytique",
    subjectId: subjectId,
    series: ["D"],
    description:
      "Étude de la géométrie dans le plan cartésien. Droites, cercles, paraboles et leurs équations.",
    difficulty: "intermediate",
    estimatedTime: 100,
    estimatedCompletionDate: new Date("2026-11-30"),
    relatedTopics: ["Trigonométrie", "Vecteurs"],
    hasPractice: true,
    hasNote: true,
    hasStudyMaterial: true,
    prerequisites: ["Coordonnées cartésiennes", "Fonctions et équations"],
    learningObjectives: [
      "Maîtriser les équations de droites",
      "Comprendre les propriétés des cercles",
      "Résoudre des problèmes de distances et d'angles",
      "Appliquer les transformations géométriques",
    ],
    estimatedTimeToMaster: 150,
    resourceIds: [],
    assessmentCriteria: {
      minimumScore: 75,
      requiredPracticeQuestions: 20,
      masteryThreshold: 80,
    },
  },
  {
    name: "Statistiques et probabilités",
    subjectId: subjectId,
    series: ["D"],
    description:
      "Introduction aux concepts de base en statistiques descriptives et calcul des probabilités.",
    difficulty: "beginner",
    estimatedTime: 90,
    estimatedCompletionDate: new Date("2026-12-20"),
    relatedTopics: ["Analyse de données", "Combinatoire"],
    hasPractice: true,
    hasNote: true,
    hasStudyMaterial: true,
    prerequisites: ["Calculs de base", "Fractions et pourcentages"],
    learningObjectives: [
      "Calculer des moyennes et médianes",
      "Comprendre les concepts de probabilité",
      "Interpréter des graphiques statistiques",
      "Résoudre des problèmes de dénombrement simple",
    ],
    estimatedTimeToMaster: 120,
    resourceIds: [],
    assessmentCriteria: {
      minimumScore: 65,
      requiredPracticeQuestions: 15,
      masteryThreshold: 75,
    },
  },
];

// Fonction pour ensemencer les topics
async function seedTopics() {
  try {
    // Récupérer l'ID de la matière Mathématiques
    const mathSubjectId = await getMathSubjectId();
    console.log("ID de la matière Mathématiques récupéré :", mathSubjectId);

    // Préparer les données des topics avec l'ID de la matière
    const topicsData = getTopicsData(mathSubjectId);

    // Supprimer les topics existants pour la matière Mathématiques, série D
    const deleteResult = await Topic.deleteMany({
      subjectId: mathSubjectId,
      series: "D",
    });
    console.log(
      `${deleteResult.deletedCount} topics existants pour Mathématiques, série D supprimés`
    );

    // Insérer les nouveaux topics
    const insertedTopics = await Topic.insertMany(topicsData);
    console.log(`${insertedTopics.length} topics créés avec succès`);

    // Afficher le résumé
    console.log("\n=== RÉSUMÉ DE L'ENSEMENCEMENT DES TOPICS ===");
    console.log("Matière :", subjectName);
    console.log("Série :", "D");
    console.log("Nombre de topics créés :", insertedTopics.length);

    insertedTopics.forEach((topic, index) => {
      console.log(`\n${index + 1}. ${topic.name}`);
      console.log(`   - Difficulté : ${topic.difficulty}`);
      console.log(`   - Temps estimé : ${topic.estimatedTime} minutes`);
      console.log(
        `   - Objectifs d'apprentissage : ${topic.learningObjectives.length}`
      );
      console.log(`   - Prérequis : ${topic.prerequisites.length}`);
      console.log(`   - ID : ${topic._id}`);
    });

    // Afficher les statistiques
    const difficulties = insertedTopics.reduce((acc, topic) => {
      acc[topic.difficulty] = (acc[topic.difficulty] || 0) + 1;
      return acc;
    }, {});

    console.log("\n=== STATISTIQUES ===");
    console.log("Répartition par difficulté :");
    Object.entries(difficulties).forEach(([level, count]) => {
      console.log(`   - ${level} : ${count} topic(s)`);
    });

    const totalEstimatedTime = insertedTopics.reduce(
      (sum, topic) => sum + topic.estimatedTime,
      0
    );
    console.log(
      `Temps total estimé : ${totalEstimatedTime} minutes (${Math.round(
        totalEstimatedTime / 60
      )} heures)`
    );

    // Fermer la connexion
    await mongoose.connection.close();
    console.log("\nConnexion MongoDB fermée");
  } catch (err) {
    console.error("Erreur lors de l'ensemencement :", err);
    process.exit(1);
  }
}

// Exécuter la fonction d'ensemencement
seedTopics();
