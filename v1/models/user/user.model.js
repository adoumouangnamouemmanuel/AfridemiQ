const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
  {
    // =============== INFORMATIONS DE BASE ===============
    name: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Veuillez fournir un email valide",
      ],
    },
    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"],
    },

    // =============== INSCRIPTION SPÉCIFIQUE À L'AFRIQUE ===============
    country: {
      type: String,
      enum: {
        values: ["nigeria", "ghana", "kenya", "cameroon", "senegal", "chad"],
        message:
          "Le pays doit être l'un des suivants : Nigeria, Ghana, Kenya, Cameroun, Sénégal, Tchad",
      },
      required: [true, "Le pays est requis"],
    },
    examType: {
      type: String,
      enum: {
        values: ["WAEC", "NECO", "JAMB", "KCSE", "BAC", "BEPC"],
        message:
          "Le type d'examen doit être l'un des suivants : WAEC, NECO, JAMB, KCSE, BAC, BEPC",
      },
      required: [true, "Le type d'examen est requis"],
    },
    educationLevel: {
      type: String,
      enum: {
        values: ["secondary", "university"],
        message: "Le niveau d'éducation doit être : secondaire ou université",
      },
      required: [true, "Le niveau d'éducation est requis"],
    },

    // =============== INFORMATIONS PERSONNELLES OPTIONNELLES ===============
    dateOfBirth: {
      type: Date,
      validate: {
        validator: (v) => !v || v <= new Date(),
        message: "La date de naissance ne peut pas être dans le futur",
      },
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "prefer_not_to_say"],
        message: "Le genre doit être : homme, femme ou préfère ne pas dire",
      },
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: (v) => !v || /^\+?[1-9]\d{1,14}$/.test(v),
        message: "Veuillez fournir un numéro de téléphone valide",
      },
    },

    // =============== CONTEXTE ÉDUCATIF ===============
    schoolName: {
      type: String,
      trim: true,
      maxlength: [200, "Le nom de l'école ne peut pas dépasser 200 caractères"],
    },
    gradeLevel: {
      type: String,
      trim: true,
    },
    targetExamYear: {
      type: Number,
      min: [2024, "L'année d'examen doit être actuelle ou future"],
      max: [2030, "L'année d'examen ne peut pas dépasser 2030"],
    },

    // =============== PRÉFÉRENCES DE BASE ===============
    preferredLanguage: {
      type: String,
      enum: {
        values: ["english", "french"],
        message: "La langue préférée doit être : anglais ou français",
      },
      default: "french",
    },

    // Préférences de notification simples
    notifications: {
      dailyReminders: { type: Boolean, default: true },
      progressUpdates: { type: Boolean, default: true },
      examAlerts: { type: Boolean, default: true },
    },

    // =============== SUIVI DE PROGRESSION DE BASE ===============
    stats: {
      totalQuizzesTaken: {
        type: Number,
        default: 0,
        min: [0, "Le nombre total de quiz ne peut pas être négatif"],
      },
      totalQuestionsAnswered: {
        type: Number,
        default: 0,
        min: [0, "Le nombre total de questions ne peut pas être négatif"],
      },
      averageScore: {
        type: Number,
        default: 0,
        min: [0, "Le score moyen ne peut pas être négatif"],
        max: [100, "Le score moyen ne peut pas dépasser 100"],
      },
      currentStreak: {
        type: Number,
        default: 0,
        min: [0, "La série actuelle ne peut pas être négative"],
      },
      longestStreak: {
        type: Number,
        default: 0,
        min: [0, "La plus longue série ne peut pas être négative"],
      },
      lastStudyDate: { type: Date },
    },

    // =============== GESTION UTILISATEUR ===============
    role: {
      type: String,
      enum: {
        values: ["student", "admin"],
        message: "Le rôle doit être : étudiant ou administrateur",
      },
      default: "student",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },

    // =============== AUTHENTIFICATION ===============
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        // Supprimer les champs sensibles de la sortie JSON
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.refreshToken;
        return ret;
      },
    },
  }
);

// =============== INDEX ===============
UserSchema.index({ country: 1, examType: 1 });
UserSchema.index({ lastLogin: -1 });
UserSchema.index({ "stats.averageScore": -1 });

// =============== MIDDLEWARE ===============
// Hacher le mot de passe avant sauvegarde
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await bcrypt.hash(this.password, 12);
    } catch (error) {
      return next(error);
    }
  }

  // Logique de mise à jour de la série
  if (this.isModified("stats.lastStudyDate")) {
    this.updateStreak();
  }

  next();
});

// =============== MÉTHODES ===============
// Comparer le mot de passe
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Mettre à jour la série d'étude
UserSchema.methods.updateStreak = function () {
  const today = new Date();
  const lastStudy = this.stats.lastStudyDate;

  if (!lastStudy) {
    this.stats.currentStreak = 1;
  } else {
    const daysDiff = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Jour consécutif
      this.stats.currentStreak += 1;
      if (this.stats.currentStreak > this.stats.longestStreak) {
        this.stats.longestStreak = this.stats.currentStreak;
      }
    } else if (daysDiff > 1) {
      // Série interrompue
      this.stats.currentStreak = 1;
    }
  }

  this.stats.lastStudyDate = today;
};

// Mettre à jour les statistiques de quiz
UserSchema.methods.updateQuizStats = function (score) {
  this.stats.totalQuizzesTaken += 1;

  // Recalculer le score moyen
  const totalScore =
    this.stats.averageScore * (this.stats.totalQuizzesTaken - 1) + score;
  this.stats.averageScore = Math.round(
    totalScore / this.stats.totalQuizzesTaken
  );

  // Mettre à jour la date d'étude et la série
  this.stats.lastStudyDate = new Date();
  this.updateStreak();
};

// =============== VIRTUELS ===============
UserSchema.virtual("fullName").get(function () {
  return this.name;
});

UserSchema.virtual("isNewUser").get(function () {
  const daysSinceJoined = Math.floor(
    (new Date() - this.createdAt) / (1000 * 60 * 60 * 24)
  );
  return daysSinceJoined <= 7;
});

module.exports = { User: model("User", UserSchema) };