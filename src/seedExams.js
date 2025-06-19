const mongoose = require('mongoose');
const { Exam, Subject } = require('./models/AfricaExamPrepMongoSchema'); // Adjust path to your models

// MongoDB connection URL
// const MONGO_URI = 'mongodb://localhost:27017/AfricaExamPrep';
MONGO_URI="mongodb+srv://adoumouangnamouemmanuel:LEgraoe90062033?@africa-exam-prep.rcj7p7m.mongodb.net/AfricaExamPrep"
mongoose.connect(MONGO_URI).then(() => console.log('Connected to MongoDB')).catch(err => console.error('Connection error:', err));

// Function to fetch subject IDs from the database
async function fetchSubjectIds() {
  try {
    const subjects = await Subject.find({}).select('name _id');
    const subjectIds = {};
    subjects.forEach(subject => {
      subjectIds[subject.name] = subject._id;
    });
    console.log('Fetched subject IDs:', subjectIds);
    return subjectIds;
  } catch (err) {
    console.error('Error fetching subject IDs:', err);
    throw err;
  }
}

// Function to seed exams
async function seedExams() {
  try {
    // Verify Exam schema
    console.log('Exam schema importantDates:', Exam.schema.paths.importantDates.instance);

    // Fetch subject IDs
    const subjectIds = await fetchSubjectIds();

    // Exam data for BAC (Chad) and BEPC (Cameroon)
    const examData = [
      {
        name: 'Baccalauréat (BAC)',
        description: 'Examen de fin d’études secondaires au Tchad, permettant l’accès à l’enseignement supérieur.',
        icon: '🎓',
        color: '#2E8B57',
        duration: '4h',
        country: 'Tchad',
        levels: ['Terminale'],
        series: [
          {
            id: 'A',
            name: 'Série A',
            subjects: [
              subjectIds['Français'],
              subjectIds['Histoire-Géographie'],
              subjectIds['Philosophie'],
              subjectIds['Anglais'],
              subjectIds['Éducation Physique et Sportive'],
            ],
            description: 'Série littéraire axée sur les lettres et sciences humaines.',
          },
          {
            id: 'C',
            name: 'Série C',
            subjects: [
              subjectIds['Mathématiques'],
              subjectIds['Physique-Chimie'],
              subjectIds['Sciences de la Vie et de la Terre'],
              subjectIds['Français'],
              subjectIds['Histoire-Géographie'],
              subjectIds['Philosophie'],
              subjectIds['Anglais'],
              subjectIds['Éducation Physique et Sportive'],
            ],
            description: 'Série scientifique axée sur les mathématiques et sciences physiques.',
          },
          {
            id: 'D',
            name: 'Série D',
            subjects: [
              subjectIds['Sciences de la Vie et de la Terre'],
              subjectIds['Mathématiques'],
              subjectIds['Physique-Chimie'],
              subjectIds['Français'],
              subjectIds['Histoire-Géographie'],
              subjectIds['Philosophie'],
              subjectIds['Anglais'],
              subjectIds['Éducation Physique et Sportive'],
            ],
            description: 'Série scientifique avec un accent sur la biologie.',
          },
        ],
        curriculumId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439030'),
        examFormat: 'paper',
        accessibilityOptions: ['Temps supplémentaire', 'Impression en gros caractères'],
        importantDates: [
          'Inscription: 2025-03-01',
          'Examen: 2025-06-15',
        ],
        registrationRequirements: {
          minimumAge: 17,
          requiredDocuments: ['Carte d’identité', 'Certificat de scolarité'],
          fees: { amount: 50000, currency: 'XAF' },
        },
        examCenters: [
          {
            id: 'TD001',
            name: 'Lycée Félix Éboué',
            location: 'N’Djaména, Tchad',
            capacity: 450,
          },
          {
            id: 'TD002',
            name: 'Collège d’Enseignement Général',
            location: 'Abéché, Tchad',
            capacity: 300,
          },
        ],
        pastPapers: [
          {
            year: 2023,
            url: 'http://example.com/bac_chad_2023.pdf',
            solutions: 'http://example.com/bac_chad_2023_solutions.pdf',
            series: 'A',
          },
          {
            year: 2024,
            url: 'http://example.com/bac_chad_2024.pdf',
            solutions: 'http://example.com/bac_chad_2024_solutions.pdf',
            series: 'C',
          },
        ],
        statistics: [
          {
            passRate: 64.0,
            averageScore: 12.3,
            totalCandidates: 12000,
            series: 'A',
          },
          {
            passRate: 68.5,
            averageScore: 12.8,
            totalCandidates: 18000,
            series: 'C',
          },
        ],
      },
      {
        name: 'Brevet d’Études du Premier Cycle (BEPC)',
        description: 'Examen de fin du premier cycle secondaire au Cameroun, marquant la fin du collège.',
        icon: '📚',
        color: '#4682B4',
        duration: '2h',
        country: 'Cameroun',
        levels: ['3ème'],
        series: [],
        subjects: [
          subjectIds['Français'],
          subjectIds['Mathématiques'],
          subjectIds['Physique-Chimie'],
          subjectIds['Sciences de la Vie et de la Terre'],
          subjectIds['Histoire-Géographie'],
          subjectIds['Anglais'],
          subjectIds['Éducation Civique et Morale'],
          subjectIds['Éducation Physique et Sportive'],
        ],
        curriculumId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439031'),
        examFormat: 'paper',
        accessibilityOptions: ['Temps supplémentaire', 'Assistance orale'],
        importantDates: [
          'Inscription: 2025-04-01',
          'Examen: 2025-07-10',
        ],
        registrationRequirements: {
          minimumAge: 14,
          requiredDocuments: ['Extrait de naissance', 'Certificat de scolarité'],
          fees: { amount: 30000, currency: 'XAF' },
        },
        examCenters: [
          {
            id: 'CM001',
            name: 'Lycée Général Leclerc',
            location: 'Yaoundé, Cameroun',
            capacity: 600,
          },
          {
            id: 'CM002',
            name: 'Collège de la Retraite',
            location: 'Douala, Cameroun',
            capacity: 400,
          },
        ],
        pastPapers: [
          {
            year: 2023,
            url: 'http://example.com/bepc_cameroon_2023.pdf',
            solutions: 'http://example.com/bepc_cameroon_2023_solutions.pdf',
            series: '',
          },
          {
            year: 2024,
            url: 'http://example.com/bepc_cameroon_2024.pdf',
            solutions: 'http://example.com/bepc_cameroon_2024_solutions.pdf',
            series: '',
          },
        ],
        statistics: [
          {
            passRate: 61.2,
            averageScore: 11.9,
            totalCandidates: 30000,
            series: '',
          },
          {
            passRate: 63.8,
            averageScore: 12.1,
            totalCandidates: 32000,
            series: '',
          },
        ],
      },
    ];

    // Clear existing exams
    await Exam.deleteMany({});
    console.log('Cleared existing exams');

    // Insert new exams
    await Exam.insertMany(examData);
    console.log('Successfully seeded exams');

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error seeding exams:', err);
  }
}

// Run the seed function
seedExams();