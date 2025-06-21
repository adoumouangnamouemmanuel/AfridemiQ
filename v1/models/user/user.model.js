const { Schema, model, Types } = require("mongoose");
const {
  COUNTRIES,
  EXAM_TYPES,
  EDUCATION_LEVELS,
  LANGUAGES,
  USER_ROLES,
} = require("../../constants");
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
        values: COUNTRIES,
        message:
          "Le pays doit être l'un des suivants : Nigeria, Ghana, Kenya, Cameroun, Sénégal, Tchad",
      },
      required: [true, "Le pays est requis"],
    },
    examType: {
      type: String,
      enum: {
        values: EXAM_TYPES,
        message:
          "Le type d'examen doit être l'un des suivants : WAEC, NECO, JAMB, KCSE, BAC, BEPC",
      },
      required: [true, "Le type d'examen est requis"],
    },
    educationLevel: {
      type: String,
      enum: {
        values: EDUCATION_LEVELS,
        message: "Le niveau d'éducation doit être : secondaire ou université",
      },
      required: [true, "Le niveau d'éducation est requis"],
    },

    // =============== ONBOARDING STATUS ===============
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // =============== PRÉFÉRENCES DE BASE ===============
    preferredLanguage: {
      type: String,
      enum: {
        values: LANGUAGES,
        message: "La langue préférée doit être : anglais ou français",
      },
      default: "french",
    },

    // =============== SUIVI DE PROGRESSION DE BASE ===============
    progress: {
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
    },

    // =============== GESTION UTILISATEUR ===============
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
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
UserSchema.index({ "progress.averageScore": -1 });

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
  next();
});

// =============== MÉTHODES ===============
// Comparer le mot de passe
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Mettre à jour les statistiques de quiz
UserSchema.methods.updateQuizStats = function (score) {
  this.progress.totalQuizzesTaken += 1;
  this.progress.totalQuestionsAnswered += 1; // Assuming one question per quiz for simplicity
  const totalScore =
    this.progress.averageScore * (this.progress.totalQuizzesTaken - 1) + score;
  this.progress.averageScore = Math.round(
    totalScore / this.progress.totalQuizzesTaken
  );
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
