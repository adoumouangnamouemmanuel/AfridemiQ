const mongoose = require("mongoose");
const {
  FrenchExercise,
  Subject,
  Topic,
} = require("./models/AfricaExamPrepMongoSchema"); // Adjust path as needed

// MongoDB connection URL (update if different)
// const MONGO_URI = "mongodb://localhost:27017/AfricaExamPrep";

// Sample data for French exercises
const frenchExercises = [
  {
    type: "practice",
    title: "Grammar: Conjugation of Regular -ER Verbs",
    description: "Practice conjugating regular -ER verbs in the present tense.",
    difficulty: "beginner",
    timeLimit: 15,
    points: 10,
    instructions:
      "Conjugate the given verbs in the present tense for the specified subject.",
    topic: "grammar",
    content: {
      grammarExercises: [
        {
          statement: 'Conjugate "parler" for "je".',
          questionType: "fill_in_the_blank",
        },
        {
          statement: 'Conjugate "manger" for "nous".',
          questionType: "fill_in_the_blank",
        },
      ],
    },
    solution: {
      answers: [
        { answer: "parle", problemIndex: 0 },
        { answer: "mangeons", problemIndex: 1 },
      ],
      modelAnswer: "1. je parle\n2. nous mangeons",
      guidelines: [
        "Ensure correct subject-verb agreement.",
        "Use present tense.",
      ],
    },
    metadata: {
      tags: ["grammar", "verbs", "conjugation"],
      accessibility: { hasAudioVersion: true },
    },
  },
  {
    type: "quiz",
    title: "Text Analysis: Les Misérables Excerpt",
    description: "Analyze a short excerpt from Victor Hugo’s Les Misérables.",
    difficulty: "intermediate",
    timeLimit: 30,
    points: 20,
    instructions: "Answer questions based on the provided text excerpt.",
    topic: "text_analysis",
    content: {
      textAnalysis: {
        text: "Jean Valjean, après avoir passé dix-neuf ans au bagne, retrouve la liberté...",
        questions: [
          {
            question: "What is the main theme of this excerpt?",
            questionType: "multiple_choice",
          },
          {
            question: "Describe Jean Valjean’s emotional state.",
            questionType: "short_answer",
          },
        ],
      },
    },
    solution: {
      answers: [
        { answer: "Redemption", problemIndex: 0 },
        { answer: "Hopeful yet burdened", problemIndex: 1 },
      ],
      modelAnswer:
        "1. Redemption\n2. Jean Valjean feels hopeful but burdened by his past.",
      guidelines: [
        "Refer to the text for evidence.",
        "Use complete sentences for short answers.",
      ],
    },
    metadata: {
      tags: ["literature", "text_analysis", "victor_hugo"],
      accessibility: { hasBrailleVersion: true },
    },
  },
  {
    type: "assignment",
    title: "Composition: Writing a Formal Letter",
    description: "Write a formal letter requesting a scholarship.",
    difficulty: "advanced",
    timeLimit: 60,
    points: 30,
    instructions:
      "Follow the formal letter structure: salutation, body, closing.",
    topic: "composition",
    content: {
      textAnalysis: {
        text: "",
        questions: [
          {
            question:
              "Write a formal letter to a university requesting a scholarship.",
            questionType: "essay",
          },
        ],
      },
    },
    solution: {
      answers: [{ answer: "Model letter provided", problemIndex: 0 }],
      modelAnswer:
        "Dear Sir/Madam,\nI am writing to apply for the scholarship offered by your university...\nSincerely,\n[Your Name]",
      guidelines: ["Use formal language.", "Include all letter components."],
    },
    metadata: {
      tags: ["writing", "formal_letter", "composition"],
      accessibility: { hasAudioVersion: false },
    },
  },
  {
    type: "practice",
    title: "Vocabulary: Synonyms and Antonyms",
    description: "Identify synonyms and antonyms for given French words.",
    difficulty: "beginner",
    timeLimit: 10,
    points: 10,
    instructions: "Choose the correct synonym or antonym for each word.",
    topic: "grammar",
    content: {
      grammarExercises: [
        {
          statement: 'Find a synonym for "grand".',
          questionType: "multiple_choice",
        },
        {
          statement: 'Find an antonym for "petit".',
          questionType: "multiple_choice",
        },
      ],
    },
    solution: {
      answers: [
        { answer: "vaste", problemIndex: 0 },
        { answer: "grand", problemIndex: 1 },
      ],
      modelAnswer: "1. vaste\n2. grand",
      guidelines: [
        "Choose words with similar or opposite meanings.",
        "Check context.",
      ],
    },
    metadata: {
      tags: ["vocabulary", "synonyms", "antonyms"],
      accessibility: { hasAudioVersion: true },
    },
  },
  {
    type: "exam",
    title: "Text Analysis: Poème de Rimbaud",
    description:
      "Analyze a poem by Arthur Rimbaud and answer related questions.",
    difficulty: "advanced",
    timeLimit: 45,
    points: 25,
    instructions: "Read the poem and respond to the analysis questions.",
    topic: "text_analysis",
    content: {
      textAnalysis: {
        text: "Le dormeur du val, c’est un soldat jeune et beau...",
        questions: [
          {
            question: "What imagery is used in the poem?",
            questionType: "short_answer",
          },
          {
            question: "Explain the poem’s tone.",
            questionType: "essay",
          },
        ],
      },
    },
    solution: {
      answers: [
        { answer: "Nature and war imagery", problemIndex: 0 },
        { answer: "The tone is ironic and melancholic.", problemIndex: 1 },
      ],
      modelAnswer:
        "1. Nature and war imagery\n2. The tone is ironic, contrasting the beauty of nature with the tragedy of death.",
      guidelines: [
        "Use textual evidence.",
        "Provide detailed analysis for essays.",
      ],
    },
    metadata: {
      tags: ["poetry", "rimbaud", "text_analysis"],
      accessibility: { hasBrailleVersion: true },
    },
  },
];

// Seed function
async function seedFrenchExercises() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Find or create a Subject for French
    let frenchSubject = await Subject.findOne({ name: "French" });
    if (!frenchSubject) {
      frenchSubject = await Subject.create({
        name: "French",
        icon: "french_icon.png",
        color: "#2196F3",
        description: "Study of French language and literature.",
        series: ["D"],
      });
      console.log("Created French Subject");
    }

    // Find or create Topics for French
    const topics = [
      { name: "Grammar", topicName: "grammar" },
      { name: "Text Analysis", topicName: "text_analysis" },
      { name: "Composition", topicName: "composition" },
    ];
    const topicMap = {};

    for (const t of topics) {
      let topic = await Topic.findOne({
        name: t.name,
        subjectId: frenchSubject._id,
      });
      if (!topic) {
        topic = await Topic.create({
          name: t.name,
          subjectId: frenchSubject._id,
          series: "D",
          description: `Study of ${t.name.toLowerCase()} in French.`,
          difficulty: "beginner",
          estimatedTime: 60,
          estimatedTimeToMaster: 120,
        });
        console.log(`Created Topic: ${t.name}`);
      }
      topicMap[t.topicName] = topic._id;
    }

    // Clear existing French exercises (optional, comment out if not desired)
    await FrenchExercise.deleteMany({});
    console.log("Cleared existing French exercises");

    // Create French exercises
    for (const exercise of frenchExercises) {
      const newExercise = await FrenchExercise.create({
        ...exercise,
        subjectId: frenchSubject._id,
        topicId: topicMap[exercise.topic],
        series: "D",
        metadata: {
          ...exercise.metadata,
          createdBy: null, // Set to a valid User ID if available
          createdAt: new Date(),
          updatedBy: null,
          lastModified: new Date(),
        },
      });
      console.log(`Created French Exercise: ${newExercise.title}`);
    }

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the seed function
seedFrenchExercises();
