const mongoose = require("mongoose");
const { Curriculum } = require("./models/learning/curriculum.model");

// Connecter à MongoDB
const MONGO_URI = "mongodb://localhost:27017/AfricaExamPrep";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion:", err));

// Liste des noms des matières à inclure
const subjectNames = [
  "Mathématiques",
  "Physique",
  "Biologie",
  "Chimie",
  "Français",
  "Anglais",
  "Philosophie",
  "Histoire",
  "Géographie",
];

// Fonction pour récupérer les IDs des matières par leurs noms
async function getSubjectIdsByName() {
  const { Subject } = require("./models/learning/subject.model");
  const subjects = await Subject.find({ name: { $in: subjectNames } }).select(
    "_id name"
  );
  if (subjects.length !== subjectNames.length) {
    const foundNames = subjects.map((s) => s.name);
    const missing = subjectNames.filter((name) => !foundNames.includes(name));
    throw new Error(
      `Erreur : Les matières suivantes n'ont pas été trouvées : ${missing.join(
        ", "
      )}`
    );
  }
  console.log(
    "Matières trouvées :",
    subjects.map((s) => s.name)
  );
  return subjects.map((subject) => subject._id);
}

// Données du curriculum
const curriculumData = {
  country: "Tchad",
  educationLevel: "secondaire",
  series: ["D"],
  subjects: [], // Rempli après récupération des IDs
  academicYear: {
    startDate: new Date("2025-09-01"),
    endDate: new Date("2026-06-30"),
    terms: [
      {
        term: 1,
        startDate: new Date("2025-09-01"),
        endDate: new Date("2025-12-31"),
        holidays: [
          {
            name: "Vacances de Toussaint",
            startDate: new Date("2025-10-30"),
            endDate: new Date("2025-11-05"),
          },
          {
            name: "Vacances de Noël",
            startDate: new Date("2025-12-20"),
            endDate: new Date("2025-12-31"),
          },
        ],
      },
      {
        term: 2,
        startDate: new Date("2026-01-07"),
        endDate: new Date("2026-03-31"),
        holidays: [
          {
            name: "Vacances de février",
            startDate: new Date("2026-02-15"),
            endDate: new Date("2026-02-22"),
          },
        ],
      },
      {
        term: 3,
        startDate: new Date("2026-04-07"),
        endDate: new Date("2026-06-30"),
        holidays: [
          {
            name: "Vacances de Pâques",
            startDate: new Date("2026-04-07"),
            endDate: new Date("2026-04-14"),
          },
        ],
      },
    ],
  },
  isActive: true,
  metadata: {
    version: 1,
    lastModified: new Date(),
    status: "draft",
  },
  createdBy: new mongoose.Types.ObjectId("6840c7494a8d3286ee2f7e7d"), // ID utilisateur fictif
  analytics: {
    enrollmentCount: 0,
    activeUsers: 0,
    completionRate: 0,
  },
};

// Fonction pour ensemencer le curriculum
async function seedCurriculum() {
  try {
    // Récupérer les IDs des matières
    curriculumData.subjects = await getSubjectIdsByName();
    console.log("IDs des matières récupérés :", curriculumData.subjects);

    // Supprimer les curricula existants pour le Tchad, série D
    await Curriculum.deleteMany({ country: "Tchad", series: "D" });
    console.log("Curricula existants pour Tchad, série D supprimés");

    // Insérer le nouveau curriculum
    const insertedCurriculum = await Curriculum.create(curriculumData);
    console.log("Curriculum créé avec succès :", insertedCurriculum._id);

    // Afficher le résumé
    console.log("\n=== RÉSUMÉ DE L'ENSEMENCEMENT ===");
    console.log("Pays :", insertedCurriculum.country);
    console.log("Niveau d'éducation :", insertedCurriculum.educationLevel);
    console.log("Série :", insertedCurriculum.series.join(", "));
    console.log("Nombre de matières :", insertedCurriculum.subjects.length);
    console.log("Matières incluses :", subjectNames.join(", "));
    console.log(
      "Année académique :",
      insertedCurriculum.academicYear.startDate.toISOString().split("T")[0],
      "au",
      insertedCurriculum.academicYear.endDate.toISOString().split("T")[0]
    );
    console.log("Statut :", insertedCurriculum.metadata.status);

    // Fermer la connexion
    await mongoose.connection.close();
    console.log("\nConnexion MongoDB fermée");
  } catch (err) {
    console.error("Erreur lors de l'ensemencement :", err);
    process.exit(1);
  }
}

// Exécuter la fonction d'ensemencement
seedCurriculum();
