const { Schema, model, Types } = require("mongoose");
const {
  MEDIA_TYPES,
  DIFFICULTY_LEVELS,
  STATUSES,
  RESOURCE_CATEGORIES,
  EXAM_SESSIONS,
} = require("../../constants");

const ResourceSchema = new Schema(
  {
    // =============== INFORMATIONS DE BASE ===============
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
    },

    description: {
      type: String,
      required: [true, "La description est requise"],
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },

    // =============== CONTENU ET FICHIER ===============
    type: {
      type: String,
      enum: {
        values: [...MEDIA_TYPES, "pdf", "link", "exercise"],
        message: "Type de ressource invalide",
      },
      required: [true, "Le type est requis"],
    },

    // Catégorie spécifique pour le contenu éducatif
    category: {
      type: String,
      enum: {
        values: RESOURCE_CATEGORIES,
        message: "Catégorie de ressource invalide",
      },
      required: [true, "La catégorie est requise"],
    },

    // URL ou chemin du fichier
    url: {
      type: String,
      required: [true, "L'URL est requise"],
      trim: true,
    },

    // Informations sur le fichier
    fileInfo: {
      size: {
        type: Number, // en bytes
        min: [0, "La taille ne peut pas être négative"],
      },
      mimeType: {
        type: String,
        trim: true,
      },
      duration: {
        type: Number, // en secondes pour audio/vidéo
        min: [0, "La durée ne peut pas être négative"],
      },
      pages: {
        type: Number, // nombre de pages pour PDF
        min: [1, "Minimum 1 page"],
      },
    },

    // =============== RELATIONS ===============
    subjectId: {
      type: Types.ObjectId,
      ref: "Subject",
      required: [true, "L'ID de la matière est requis"],
      index: true,
    },

    topicId: {
      type: Types.ObjectId,
      ref: "Topic",
      index: true,
      // Optionnel - certaines ressources peuvent être générales
    },

    // =============== MÉTADONNÉES ÉDUCATIVES ===============
    difficulty: {
      type: String,
      enum: {
        values: DIFFICULTY_LEVELS,
        message: "Niveau de difficulté invalide",
      },
      default: "medium",
    },

    // Niveau d'éducation ciblé
    targetLevel: {
      type: String,
      enum: {
        values: ["junior_secondary", "senior_secondary", "both"],
        message: "Niveau cible invalide",
      },
      default: "both",
    },

    // Année d'examen (pour les past papers)
    examYear: {
      type: Number,
      min: [2000, "Année minimum 2000"],
      max: [2030, "Année maximum 2030"],
      validate: {
        validator: function (v) {
          // Requis seulement pour les past papers
          if (this.category === "past_papers") {
            return v != null;
          }
          return true;
        },
        message: "L'année d'examen est requise pour les sujets d'examens",
      },
    },

    // Session d'examen (pour les past papers)
    examSession: {
      type: String,
      enum: EXAM_SESSIONS,
      validate: {
        validator: function (v) {
          // Requis seulement pour les past papers
          if (this.category === "past_papers") {
            return v != null;
          }
          return true;
        },
        message: "La session d'examen est requise pour les sujets d'examens",
      },
    },

    // =============== TAGS ET MOTS-CLÉS ===============
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, "Le tag ne peut pas dépasser 30 caractères"],
      },
    ],

    keywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [50, "Le mot-clé ne peut pas dépasser 50 caractères"],
      },
    ],

    // =============== INFORMATIONS D'AUTEUR ===============
    author: {
      name: {
        type: String,
        trim: true,
        maxlength: [
          100,
          "Le nom de l'auteur ne peut pas dépasser 100 caractères",
        ],
      },
      institution: {
        type: String,
        trim: true,
        maxlength: [
          150,
          "Le nom de l'institution ne peut pas dépasser 150 caractères",
        ],
      },
    },

    source: {
      type: String,
      trim: true,
      maxlength: [200, "La source ne peut pas dépasser 200 caractères"],
    },

    // =============== CONTRÔLE D'ACCÈS ===============
    isPublic: {
      type: Boolean,
      default: true,
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    requiresDownload: {
      type: Boolean,
      default: false,
    },

    // =============== STATISTIQUES ===============
    stats: {
      views: {
        type: Number,
        default: 0,
        min: [0, "Ne peut pas être négatif"],
      },
      downloads: {
        type: Number,
        default: 0,
        min: [0, "Ne peut pas être négatif"],
      },
      rating: {
        average: {
          type: Number,
          default: 0,
          min: [0, "Rating minimum 0"],
          max: [5, "Rating maximum 5"],
        },
        count: {
          type: Number,
          default: 0,
          min: [0, "Ne peut pas être négatif"],
        },
      },
    },

    // =============== GESTION ===============
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: "Statut invalide",
      },
      default: "active",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Vérifié par l'équipe pédagogique
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEX ===============
ResourceSchema.index({ subjectId: 1, topicId: 1 });
ResourceSchema.index({ category: 1, type: 1 });
ResourceSchema.index({ difficulty: 1, targetLevel: 1 });
ResourceSchema.index({ examYear: 1, examSession: 1 });
ResourceSchema.index({ tags: 1, keywords: 1 });
ResourceSchema.index({ isFeatured: 1, isActive: 1 });
ResourceSchema.index({ "stats.rating.average": -1 });
ResourceSchema.index({ "stats.views": -1, "stats.downloads": -1 });

// =============== VALIDATION ===============
ResourceSchema.pre("validate", function (next) {
  // Validation pour les past papers
  if (this.category === "past_papers") {
    if (!this.examYear) {
      return next(
        new Error("L'année d'examen est requise pour les sujets d'examens")
      );
    }
    if (!this.examSession) {
      return next(
        new Error("La session d'examen est requise pour les sujets d'examens")
      );
    }
  }

  // Nettoyer les tags et keywords
  if (this.tags) {
    this.tags = [...new Set(this.tags)]; // Supprimer les doublons
  }
  if (this.keywords) {
    this.keywords = [...new Set(this.keywords)]; // Supprimer les doublons
  }

  next();
});

// =============== MIDDLEWARE - UPDATE STATS ===============
ResourceSchema.post("save", async function () {
  try {
    const Subject = require("./subject.model").Subject;
    const Topic = require("./topic.model").Topic;

    // Mettre à jour les statistiques du sujet
    const totalResources = await this.constructor.countDocuments({
      subjectId: this.subjectId,
      isActive: true,
    });

    await Subject.findByIdAndUpdate(this.subjectId, {
      "stats.totalResources": totalResources,
    });

    // Mettre à jour les statistiques du topic si applicable
    if (this.topicId) {
      const topicResources = await this.constructor.countDocuments({
        topicId: this.topicId,
        isActive: true,
      });

      await Topic.findByIdAndUpdate(this.topicId, {
        "stats.totalResources": topicResources,
        hasResources: topicResources > 0,
      });
    }
  } catch (error) {
    console.error("Error updating resource stats:", error);
  }
});

// =============== VIRTUELS ===============
ResourceSchema.virtual("fileSize").get(function () {
  if (!this.fileInfo.size) return null;

  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(this.fileInfo.size) / Math.log(1024));
  return (
    Math.round((this.fileInfo.size / Math.pow(1024, i)) * 100) / 100 +
    " " +
    sizes[i]
  );
});

ResourceSchema.virtual("durationFormatted").get(function () {
  if (!this.fileInfo.duration) return null;

  const hours = Math.floor(this.fileInfo.duration / 3600);
  const minutes = Math.floor((this.fileInfo.duration % 3600) / 60);
  const seconds = this.fileInfo.duration % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});

ResourceSchema.virtual("popularity").get(function () {
  return this.stats.views * 0.3 + this.stats.downloads * 0.7;
});

ResourceSchema.virtual("categoryIcon").get(function () {
  const icons = {
    past_papers: "📝",
    textbook: "📖",
    exercise_book: "📚",
    summary: "📄",
    video_lesson: "🎥",
    audio_lesson: "🎧",
    reference: "📋",
    worksheet: "📊",
    tutorial: "🎯",
    cheat_sheet: "🗒️",
  };
  return icons[this.category] || "📁";
});

// =============== MÉTHODES ===============
ResourceSchema.methods.incrementViews = function () {
  this.stats.views += 1;
  return this.save();
};

ResourceSchema.methods.incrementDownloads = function () {
  this.stats.downloads += 1;
  return this.save();
};

ResourceSchema.methods.addRating = function (rating) {
  const currentTotal = this.stats.rating.average * this.stats.rating.count;
  this.stats.rating.count += 1;
  this.stats.rating.average = (currentTotal + rating) / this.stats.rating.count;
  return this.save();
};

// =============== MÉTHODES STATIQUES ===============
ResourceSchema.statics.findBySubjectAndTopic = function (
  subjectId,
  topicId,
  options = {}
) {
  const query = {
    subjectId,
    isActive: true,
    status: "active",
  };

  if (topicId) query.topicId = topicId;
  if (options.category) query.category = options.category;
  if (options.type) query.type = options.type;
  if (options.difficulty) query.difficulty = options.difficulty;
  if (options.isPremium !== undefined) query.isPremium = options.isPremium;

  return this.find(query).sort({ isFeatured: -1, "stats.rating.average": -1 });
};

ResourceSchema.statics.findPastPapers = function (
  subjectId,
  examYear,
  examSession
) {
  const query = {
    subjectId,
    category: "past_papers",
    isActive: true,
    status: "active",
  };

  if (examYear) query.examYear = examYear;
  if (examSession) query.examSession = examSession;

  return this.find(query).sort({ examYear: -1, examSession: 1 });
};

ResourceSchema.statics.searchResources = function (searchTerm, filters = {}) {
  const query = {
    $or: [
      { title: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { tags: { $in: [searchTerm.toLowerCase()] } },
      { keywords: { $in: [searchTerm.toLowerCase()] } },
    ],
    isActive: true,
    status: "active",
    ...filters,
  };

  return this.find(query).sort({
    "stats.rating.average": -1,
    "stats.views": -1,
  });
};

ResourceSchema.statics.getPopular = function (limit = 10, category) {
  const query = {
    isActive: true,
    status: "active",
  };

  if (category) query.category = category;

  return this.find(query)
    .sort({ "stats.downloads": -1, "stats.rating.average": -1 })
    .limit(limit);
};

ResourceSchema.statics.getFeatured = function (limit = 6) {
  return this.find({
    isFeatured: true,
    isActive: true,
    status: "active",
  })
    .sort({ "stats.rating.average": -1 })
    .limit(limit);
};

module.exports = { Resource: model("Resource", ResourceSchema) };