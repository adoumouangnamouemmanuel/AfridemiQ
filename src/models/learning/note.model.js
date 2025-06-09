const { Schema, model, Types } = require("mongoose");
const {
  NOTE_TYPES,
  NOTE_STATUSES,
  NOTE_PRIVACY_LEVELS,
  MEDIA_TYPES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for note types, statuses, and media types.
 * @see module:constants/index
 */

// =============== SUBSCHEMAS =============
/**
 * Subschema for note attachments.
 * @module AttachmentSubSchema
 */
const AttachmentSchema = new Schema({
  type: {
    type: String,
    enum: {
      values: MEDIA_TYPES,
      message: "{VALUE} n'est pas un type de média valide",
    },
    required: [true, "Le type de pièce jointe est requis"],
  },
  url: {
    type: String,
    required: [true, "L'URL de la pièce jointe est requise"],
    trim: true,
  },
  filename: {
    type: String,
    required: [true, "Le nom du fichier est requis"],
    trim: true,
    maxlength: [255, "Le nom du fichier ne peut pas dépasser 255 caractères"],
  },
  size: {
    type: Number,
    min: [0, "La taille du fichier ne peut pas être négative"],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Subschema for note tags and categorization.
 * @module TagSubSchema
 */
const TagSchema = new Schema({
  name: {
    type: String,
    required: [true, "Le nom du tag est requis"],
    trim: true,
    maxlength: [50, "Le nom du tag ne peut pas dépasser 50 caractères"],
  },
  color: {
    type: String,
    default: "#0066cc",
    validate: {
      validator: function (v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: "Format de couleur invalide (utilisez #RRGGBB ou #RGB)",
    },
  },
});

/**
 * Subschema for note sharing settings.
 * @module SharingSubSchema
 */
const SharingSchema = new Schema({
  isShared: {
    type: Boolean,
    default: false,
  },
  sharedWith: {
    type: [{ type: Types.ObjectId, ref: "User" }],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 50;
      },
      message: "Trop d'utilisateurs partagés (maximum 50)",
    },
  },
  privacyLevel: {
    type: String,
    enum: {
      values: NOTE_PRIVACY_LEVELS,
      message: "{VALUE} n'est pas un niveau de confidentialité valide",
    },
    default: "private",
  },
  allowComments: {
    type: Boolean,
    default: false,
  },
  allowEditing: {
    type: Boolean,
    default: false,
  },
  sharedAt: {
    type: Date,
  },
});

/**
 * Subschema for note metadata.
 * @module MetadataSubSchema
 */
const MetadataSchema = new Schema({
  wordCount: {
    type: Number,
    default: 0,
    min: [0, "Le nombre de mots ne peut pas être négatif"],
  },
  readingTime: {
    type: Number,
    default: 0,
    min: [0, "Le temps de lecture ne peut pas être négatif"],
  },
  version: {
    type: Number,
    default: 1,
    min: [1, "La version doit être au moins 1"],
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  viewCount: {
    type: Number,
    default: 0,
    min: [0, "Le nombre de vues ne peut pas être négatif"],
  },
  favoriteCount: {
    type: Number,
    default: 0,
    min: [0, "Le nombre de favoris ne peut pas être négatif"],
  },
});

// ==================== SCHEMA ==================
/**
 * Mongoose schema for notes, managing user study notes and annotations.
 * @module NoteSchema
 */
const NoteSchema = new Schema(
  {
    // Note identification
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID de l'utilisateur est requis"],
      index: true,
    },
    topicId: {
      type: Types.ObjectId,
      ref: "Topic",
      required: [true, "L'ID du sujet est requis"],
      index: true,
    },
    series: {
      type: [String],
      default: ["D"],
      validate: {
        validator: function (arr) {
          return arr.every((s) => s && s.trim().length > 0);
        },
        message: "Toutes les séries doivent avoir au moins 1 caractère",
      },
    },
    // Note content
    title: {
      type: String,
      required: [true, "Le titre est requis"],
      trim: true,
      maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Le contenu est requis"],
      maxlength: [10000, "Le contenu ne peut pas dépasser 10000 caractères"],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [500, "Le résumé ne peut pas dépasser 500 caractères"],
    },
    // Note categorization
    type: {
      type: String,
      enum: {
        values: NOTE_TYPES,
        message: "{VALUE} n'est pas un type de note valide",
      },
      default: "personal",
    },
    status: {
      type: String,
      enum: {
        values: NOTE_STATUSES,
        message: "{VALUE} n'est pas un statut de note valide",
      },
      default: "draft",
    },
    tags: {
      type: [TagSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: "Trop de tags (maximum 20)",
      },
    },
    // Note enhancements
    attachments: {
      type: [AttachmentSchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "Trop de pièces jointes (maximum 10)",
      },
    },
    relatedNotes: {
      type: [{ type: Types.ObjectId, ref: "Note" }],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 15;
        },
        message: "Trop de notes liées (maximum 15)",
      },
    },
    // Note settings
    sharing: {
      type: SharingSchema,
      default: () => ({}),
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    reminderDate: {
      type: Date,
    },
    // Note metadata
    metadata: {
      type: MetadataSchema,
      default: () => ({}),
    },
    // Note status
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
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

// =============== INDEXES =================
NoteSchema.index({ userId: 1, topicId: 1 });
NoteSchema.index({ userId: 1, series: 1 });
NoteSchema.index({ type: 1, status: 1 });
NoteSchema.index({ "tags.name": 1 }, { sparse: true });
NoteSchema.index({ title: "text", content: "text", summary: "text" });
NoteSchema.index({ createdAt: -1 });
NoteSchema.index({ isPinned: 1, isFavorite: 1 });
NoteSchema.index({ "sharing.privacyLevel": 1 });
NoteSchema.index({ isActive: 1, isArchived: 1 });

// =============== VIRTUALS =============
/**
 * Virtual field for estimated reading time in minutes.
 * @returns {number} Estimated reading time based on word count.
 */
NoteSchema.virtual("estimatedReadingTime").get(function () {
  const wordsPerMinute = 200;
  const wordCount = this.metadata?.wordCount || 0;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
});

/**
 * Virtual field for total number of attachments.
 * @returns {number} Number of attachments.
 */
NoteSchema.virtual("totalAttachments").get(function () {
  return (this.attachments ?? []).length;
});

/**
 * Virtual field for total number of tags.
 * @returns {number} Number of tags.
 */
NoteSchema.virtual("totalTags").get(function () {
  return (this.tags ?? []).length;
});

/**
 * Virtual field for note popularity score.
 * @returns {number} Calculated popularity based on views and favorites.
 */
NoteSchema.virtual("popularityScore").get(function () {
  const viewCount = this.metadata?.viewCount || 0;
  const favoriteCount = this.metadata?.favoriteCount || 0;
  return viewCount + favoriteCount * 5;
});

/**
 * Virtual field to check if note has been recently updated.
 * @returns {boolean} True if updated within last 7 days.
 */
NoteSchema.virtual("isRecentlyUpdated").get(function () {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.metadata?.lastModified > sevenDaysAgo;
});

/**
 * Virtual field for content preview (first 150 characters).
 * @returns {string} Truncated content for preview.
 */
NoteSchema.virtual("preview").get(function () {
  const content = this.content || "";
  return content.length > 150 ? content.substring(0, 150) + "..." : content;
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to validate references and update metadata.
 * @param {Function} next - Callback to proceed with save.
 */
NoteSchema.pre("save", async function (next) {
  try {
    // Validate user and topic references
    const [user, topic] = await Promise.all([
      model("User").findById(this.userId),
      model("Topic").findById(this.topicId),
    ]);

    if (!user) {
      return next(new Error("ID utilisateur invalide"));
    }
    if (!topic) {
      return next(new Error("ID de sujet invalide"));
    }

    // Validate related notes
    if (this.relatedNotes?.length > 0) {
      const relatedNotesExist = await model("Note").find({
        _id: { $in: this.relatedNotes },
      });
      if (relatedNotesExist.length !== this.relatedNotes.length) {
        return next(new Error("Une ou plusieurs notes liées invalides"));
      }
    }

    // Update word count and reading time
    if (this.isModified("content")) {
      const wordCount = this.content
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      this.metadata.wordCount = wordCount;
      this.metadata.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    // Update metadata
    if (this.isModified() && !this.isNew) {
      this.metadata.version += 1;
      this.metadata.lastModified = new Date();
    }

    // Normalize tags
    if (this.tags?.length > 0) {
      this.tags = this.tags.map((tag) => ({
        ...tag,
        name: tag.name.toLowerCase().trim(),
      }));

      // Remove duplicate tags
      const uniqueTags = [];
      const seenNames = new Set();
      for (const tag of this.tags) {
        if (!seenNames.has(tag.name)) {
          seenNames.add(tag.name);
          uniqueTags.push(tag);
        }
      }
      this.tags = uniqueTags;
    }

    // Auto-generate title if not provided
    if (!this.title && this.content) {
      this.title =
        this.content.substring(0, 50).trim() +
        (this.content.length > 50 ? "..." : "");
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-save middleware to update sharing timestamp.
 * @param {Function} next - Callback to proceed with save.
 */
NoteSchema.pre("save", function (next) {
  if (
    this.isModified("sharing.isShared") &&
    this.sharing.isShared &&
    !this.sharing.sharedAt
  ) {
    this.sharing.sharedAt = new Date();
  }
  next();
});

// =============== METHODS =============
/**
 * Add a tag to the note.
 * @param {Object} tagData - Tag data object.
 * @returns {Promise<Document>} Updated note document.
 */
NoteSchema.methods.addTag = function (tagData) {
  const existingTag = this.tags.find(
    (tag) => tag.name === tagData.name.toLowerCase().trim()
  );
  if (existingTag) {
    throw new Error("Ce tag existe déjà");
  }

  this.tags.push({
    name: tagData.name.toLowerCase().trim(),
    color: tagData.color || "#0066cc",
  });

  return this.save();
};

/**
 * Remove a tag from the note.
 * @param {string} tagName - Name of the tag to remove.
 * @returns {Promise<Document>} Updated note document.
 */
NoteSchema.methods.removeTag = function (tagName) {
  this.tags = this.tags.filter(
    (tag) => tag.name !== tagName.toLowerCase().trim()
  );
  return this.save();
};

/**
 * Share the note with specific users.
 * @param {Array} userIds - Array of user IDs to share with.
 * @param {Object} options - Sharing options.
 * @returns {Promise<Document>} Updated note document.
 */
NoteSchema.methods.shareWith = function (userIds, options = {}) {
  this.sharing.isShared = true;
  this.sharing.sharedWith = [
    ...new Set([...this.sharing.sharedWith, ...userIds]),
  ];
  this.sharing.allowComments = options.allowComments ?? false;
  this.sharing.allowEditing = options.allowEditing ?? false;
  this.sharing.privacyLevel = options.privacyLevel || "friends";

  return this.save();
};

/**
 * Archive the note.
 * @returns {Promise<Document>} Updated note document.
 */
NoteSchema.methods.archive = function () {
  this.isArchived = true;
  this.isActive = false;
  this.status = "archived";

  return this.save();
};

/**
 * Toggle favorite status.
 * @returns {Promise<Document>} Updated note document.
 */
NoteSchema.methods.toggleFavorite = function () {
  this.isFavorite = !this.isFavorite;

  if (this.isFavorite) {
    this.metadata.favoriteCount += 1;
  } else {
    this.metadata.favoriteCount = Math.max(0, this.metadata.favoriteCount - 1);
  }

  return this.save();
};

/**
 * Increment view count.
 * @returns {Promise<Document>} Updated note document.
 */
NoteSchema.methods.incrementViewCount = function () {
  this.metadata.viewCount += 1;
  return this.save();
};

/**
 * Get note statistics.
 * @returns {Object} Note statistics object.
 */
NoteSchema.methods.getStatistics = function () {
  return {
    wordCount: this.metadata?.wordCount || 0,
    readingTime: this.estimatedReadingTime,
    totalAttachments: this.totalAttachments,
    totalTags: this.totalTags,
    viewCount: this.metadata?.viewCount || 0,
    favoriteCount: this.metadata?.favoriteCount || 0,
    popularityScore: this.popularityScore,
    isShared: this.sharing?.isShared || false,
    sharedWithCount: this.sharing?.sharedWith?.length || 0,
  };
};

/**
 * Note model for interacting with the Note collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Note: model("Note", NoteSchema),
};
