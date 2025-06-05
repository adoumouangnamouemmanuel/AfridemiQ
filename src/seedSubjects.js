const mongoose = require('mongoose');
const { Subject } = require('./models/AfricaExamPrepMongoSchema'); // Adjust path to your Subject model

// Connect to MongoDB
// MongoDB connection URL (update if different)
const MONGO_URI = "mongodb://localhost:27017/AfricaExamPrep";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB')).catch(err => console.error('Connection error:', err));

// Subject data for exams across African countries
const subjects = [
  {
    name: 'Français',
    icon: '📘',
    color: '#0000FF',
    description: 'Étude de la langue et littérature française, incluant grammaire, analyse de textes et expression écrite/orale.',
    examIds: [],
    series: ['A', 'C', 'D', 'E', 'F', 'G', 'TI'], // For BAC in Francophone countries
  },
  {
    name: 'Mathématiques',
    icon: '➗',
    color: '#FF0000',
    description: 'Couvre l’algèbre, la géométrie, les probabilités et l’analyse, adapté aux séries scientifiques et économiques.',
    examIds: [],
    series: ['C', 'D', 'E', 'TI'], // For BAC, also applicable to BEPC, WASSCE, etc.
  },
  {
    name: 'Physique-Chimie',
    icon: '⚗️',
    color: '#008000',
    description: 'Étude des lois physiques et chimiques, incluant mécanique, électricité et réactions chimiques.',
    examIds: [],
    series: ['C', 'D', 'TI'], // For BAC, BEPC
  },
  {
    name: 'Sciences de la Vie et de la Terre',
    icon: '🌱',
    color: '#00FF00',
    description: 'Biologie et géologie, couvrant écosystèmes, génétique et sciences de la Terre.',
    examIds: [],
    series: ['C', 'D'], // For BAC, BEPC
  },
  {
    name: 'Histoire-Géographie',
    icon: '🌍',
    color: '#FFA500',
    description: 'Analyse des événements historiques et dynamiques géographiques, incluant l’histoire africaine et mondiale.',
    examIds: [],
    series: ['A', 'C', 'D', 'E'], // For BAC, BEPC
  },
  {
    name: 'Philosophie',
    icon: '🤔',
    color: '#800080',
    description: 'Réflexion sur les concepts philosophiques, la logique et l’argumentation.',
    examIds: [],
    series: ['A', 'C', 'D'], // For BAC
  },
  {
    name: 'Anglais',
    icon: '🇬🇧',
    color: '#FFC0CB',
    description: 'Compétences en langue anglaise, incluant compréhension écrite, orale et expression.',
    examIds: [],
    series: ['A', 'C', 'D', 'E', 'F', 'G', 'TI'], // For BAC, WASSCE, GCE, etc.
  },
  {
    name: 'Éducation Civique et Morale',
    icon: '⚖️',
    color: '#A52A2A',
    description: 'Étude des valeurs citoyennes, des institutions et de l’éthique.',
    examIds: [],
    series: [], // For BEPC, BFEM, DEF
  },
  {
    name: 'Économie',
    icon: '💰',
    color: '#FFD700',
    description: 'Principes économiques, gestion et analyse des systèmes économiques.',
    examIds: [],
    series: ['E'], // For BAC
  },
  {
    name: 'Sciences Économiques et Sociales',
    icon: '📊',
    color: '#4682B4',
    description: 'Étude des phénomènes sociaux et économiques, incluant sociologie et statistiques.',
    examIds: [],
    series: ['E'], // For BAC
  },
  {
    name: 'Technologie',
    icon: '🔧',
    color: '#808080',
    description: 'Concepts techniques et pratiques pour séries technologiques et professionnelles.',
    examIds: [],
    series: ['F', 'G', 'TI'], // For BAC, CAP, BTS
  },
  {
    name: 'Informatique',
    icon: '💻',
    color: '#00CED1',
    description: 'Initiation à l’informatique, programmation et utilisation des outils numériques.',
    examIds: [],
    series: ['F', 'TI'], // For BAC, WASSCE
  },
  {
    name: 'Éducation Physique et Sportive',
    icon: '🏃',
    color: '#FF4500',
    description: 'Activités physiques et sportives, évaluées dans le cadre du contrôle continu.',
    examIds: [],
    series: ['A', 'C', 'D', 'E'], // For BAC, BEPC
  },
  {
    name: 'Commerce',
    icon: '🛒',
    color: '#228B22',
    description: 'Étude des principes commerciaux, gestion des entreprises et marketing.',
    examIds: [],
    series: [], // For WASSCE, GCE
  },
  {
    name: 'Arabe',
    icon: '📜',
    color: '#8B008B',
    description: 'Étude de la langue et littérature arabes, incluant grammaire et textes.',
    examIds: [],
    series: [], // For exams in Arabic-speaking countries (e.g., Thanaweya Amma, BAC in Algeria)
  },
  {
    name: 'Sciences',
    icon: '🔬',
    color: '#20B2AA',
    description: 'Cours intégré de sciences, incluant biologie, physique et chimie pour les examens généraux.',
    examIds: [],
    series: [], // For WASSCE, KCSE, NSC, etc.
  },
];

// Function to seed subjects
async function seedSubjects() {
  try {
    // Clear existing subjects
    await Subject.deleteMany({});
    console.log('Cleared existing subjects');

    // Insert new subjects
    await Subject.insertMany(subjects);
    console.log('Successfully seeded subjects');

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error seeding subjects:', err);
  }
}

// Run the seed function
seedSubjects();