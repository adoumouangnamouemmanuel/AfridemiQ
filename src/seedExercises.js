const mongoose = require("mongoose");
const {
  FrenchExercise,
  Subject,
  Topic,
} = require("./models/AfricaExamPrepMongoSchema"); // Adjust path as needed

// MongoDB connection URL (update if different)
const MONGO_URI = "mongodb://localhost:27017/AfricaExamPrep";

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
          translations: {
            statement: {
              fr: 'Conjuguez "parler" pour "je".',
              en: 'Conjugate "parler" for "je".',
            },
          },
        },
        {
          statement: 'Conjugate "manger" for "nous".',
          questionType: "fill_in_the_blank",
          translations: {
            statement: {
              fr: 'Conjuguez "manger" pour "nous".',
              en: 'Conjugate "manger" for "nous".',
            },
          },
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
      translations: {
        modelAnswer: {
          fr: "1. je parle\n2. nous mangeons",
          en: "1. I speak\n2. we eat",
        },
        guidelines: [
          {
            fr: "Assurez-vous de l’accord sujet-verbe.",
            en: "Ensure correct subject-verb agreement.",
          },
          { fr: "Utilisez le présent.", en: "Use present tense." },
        ],
      },
    },
    translations: {
      title: {
        fr: "Grammaire : Conjugaison des verbes en -ER",
        en: "Grammar: Conjugation of -ER Verbs",
      },
      description: {
        fr: "Pratiquez la conjugaison des verbes réguliers en -ER au présent.",
        en: "Practice conjugating regular -ER verbs in the present tense.",
      },
      instructions: {
        fr: "Conjuguez les verbes donnés au présent pour le sujet spécifié.",
        en: "Conjugate the given verbs in the present tense for the specified subject.",
      },
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
            translations: {
              question: {
                fr: "Quel est le thème principal de cet extrait ?",
                en: "What is the main theme of this excerpt?",
              },
            },
          },
          {
            question: "Describe Jean Valjean’s emotional state.",
            questionType: "short_answer",
            translations: {
              question: {
                fr: "Décrivez l’état émotionnel de Jean Valjean.",
                en: "Describe Jean Valjean’s emotional state.",
              },
            },
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
      translations: {
        modelAnswer: {
          fr: "1. Rédemption\n2. Jean Valjean se sent plein d’espoir mais accablé par son passé.",
          en: "1. Redemption\n2. Jean Valjean feels hopeful but burdened by his past.",
        },
        guidelines: [
          {
            fr: "Référez-vous au texte pour des preuves.",
            en: "Refer to the text for evidence.",
          },
          {
            fr: "Utilisez des phrases complètes pour les réponses courtes.",
            en: "Use complete sentences for short answers.",
          },
        ],
      },
    },
    translations: {
      title: {
        fr: "Analyse de texte : Extrait des Misérables",
        en: "Text Analysis: Les Misérables Excerpt",
      },
      description: {
        fr: "Analysez un court extrait des Misérables de Victor Hugo.",
        en: "Analyze a short excerpt from Victor Hugo’s Les Misérables.",
      },
      instructions: {
        fr: "Répondez aux questions en vous basant sur l’extrait fourni.",
        en: "Answer questions based on the provided text excerpt.",
      },
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
            translations: {
              question: {
                fr: "Rédigez une lettre formelle à une université pour demander une bourse.",
                en: "Write a formal letter to a university requesting a scholarship.",
              },
            },
          },
        ],
      },
    },
    solution: {
      answers: [{ answer: "Model letter provided", problemIndex: 0 }],
      modelAnswer:
        "Dear Sir/Madam,\nI am writing to apply for the scholarship offered by your university...\nSincerely,\n[Your Name]",
      guidelines: ["Use formal language.", "Include all letter components."],
      translations: {
        modelAnswer: {
          fr: "Monsieur/Madame,\nJe vous écris pour postuler à la bourse offerte par votre université...\nCordialement,\n[Votre Nom]",
          en: "Dear Sir/Madam,\nI am writing to apply for the scholarship offered by your university...\nSincerely,\n[Your Name]",
        },
        guidelines: [
          { fr: "Utilisez un langage formel.", en: "Use formal language." },
          {
            fr: "Incluez tous les composants de la lettre.",
            en: "Include all letter components.",
          },
        ],
      },
    },
    translations: {
      title: {
        fr: "Rédaction : Écrire une lettre formelle",
        en: "Composition: Writing a Formal Letter",
      },
      description: {
        fr: "Rédigez une lettre formelle pour demander une bourse.",
        en: "Write a formal letter requesting a scholarship.",
      },
      instructions: {
        fr: "Suivez la structure de la lettre formelle : salutation, corps, conclusion.",
        en: "Follow the formal letter structure: salutation, body, closing.",
      },
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
          translations: {
            statement: {
              fr: 'Trouvez un synonyme pour "grand".',
              en: 'Find a synonym for "grand".',
            },
          },
        },
        {
          statement: 'Find an antonym for "petit".',
          questionType: "multiple_choice",
          translations: {
            statement: {
              fr: 'Trouvez un antonyme pour "petit".',
              en: 'Find an antonym for "petit".',
            },
          },
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
      translations: {
        modelAnswer: { fr: "1. vaste\n2. grand", en: "1. vast\n2. big" },
        guidelines: [
          {
            fr: "Choisissez des mots avec des significations similaires ou opposées.",
            en: "Choose words with similar or opposite meanings.",
          },
          { fr: "Vérifiez le contexte.", en: "Check context." },
        ],
      },
    },
    translations: {
      title: {
        fr: "Vocabulaire : Synonymes et antonymes",
        en: "Vocabulary: Synonyms and Antonyms",
      },
      description: {
        fr: "Identifiez les synonymes et antonymes des mots français donnés.",
        en: "Identify synonyms and antonyms for given French words.",
      },
      instructions: {
        fr: "Choisissez le synonyme ou l’antonyme correct pour chaque mot.",
        en: "Choose the correct synonym or antonym for each word.",
      },
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
            translations: {
              question: {
                fr: "Quelle imagerie est utilisée dans le poème ?",
                en: "What imagery is used in the poem?",
              },
            },
          },
          {
            question: "Explain the poem’s tone.",
            questionType: "essay",
            translations: {
              question: {
                fr: "Expliquez le ton du poème.",
                en: "Explain the poem’s tone.",
              },
            },
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
      translations: {
        modelAnswer: {
          fr: "1. Imagerie de la nature et de la guerre\n2. Le ton est ironique, contrastant la beauté de la nature avec la tragédie de la mort.",
          en: "1. Nature and war imagery\n2. The tone is ironic, contrasting the beauty of nature with the tragedy of death.",
        },
        guidelines: [
          {
            fr: "Utilisez des preuves textuelles.",
            en: "Use textual evidence.",
          },
          {
            fr: "Fournissez une analyse détaillée pour les essais.",
            en: "Provide detailed analysis for essays.",
          },
        ],
      },
    },
    translations: {
      title: {
        fr: "Analyse de texte : Poème de Rimbaud",
        en: "Text Analysis: Rimbaud’s Poem",
      },
      description: {
        fr: "Analysez un poème d’Arthur Rimbaud et répondez aux questions associées.",
        en: "Analyze a poem by Arthur Rimbaud and answer related questions.",
      },
      instructions: {
        fr: "Lisez le poème et répondez aux questions d’analyse.",
        en: "Read the poem and respond to the analysis questions.",
      },
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
        translations: {
          name: { fr: "Français", en: "French" },
          description: {
            fr: "Langue et littérature française",
            en: "French language and literature",
          },
        },
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
          translations: {
            name: {
              fr:
                t.name === "Grammar"
                  ? "Grammaire"
                  : t.name === "Text Analysis"
                  ? "Analyse de texte"
                  : "Rédaction",
              en: t.name,
            },
            description: {
              fr: `Étude de ${t.name.toLowerCase()} en français.`,
              en: `Study of ${t.name.toLowerCase()} in French.`,
            },
          },
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
