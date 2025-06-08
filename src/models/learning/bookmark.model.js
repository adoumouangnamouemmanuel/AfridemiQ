const { Schema, model, Types } = require("mongoose");
const {
  BOOKMARK_CONTENT_TYPES,
} = require("../../constants");

// =============== CONSTANTS =============
/**
 * Imported constants for bookmark content types.
 * @see module:constants/index
 */

// ==================== SCHEMA ==================
/**
 * Mongoose schema for bookmarks, allowing users to save content for later reference.
 * @module BookmarkSchema
 */
const BookmarkSchema = new Schema(
  {
    // User and content references
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "L'ID de l'utilisateur est requis"],
      index: true,
    },
    contentType: {
      type: String,
      enum: {
        values: BOOKMARK_CONTENT_TYPES,
        message: "{VALUE} n'est pas un type de contenu valide",
      },
      required: [true, "Le type de contenu est requis"],
    },
    contentId: {
      type: Types.ObjectId,
      required: [true, "L'ID du contenu est requis"],
      refPath: "contentType",
    },
    // Bookmark details
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Les notes ne peuvent pas dépasser 1000 caractères"],
    },
    // Organization
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(arr) {
          return arr.length <= 10;
        },
        message: "Trop de tags (maximum 10)",
      },
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, "La catégorie ne peut pas dépasser 50 caractères"],
    },
    priority: {
      type: Number,
      default: 1,
      min: [1, "La priorité doit être au moins 1"],
      max: [5, "La priorité ne peut pas dépasser 5"],
    },
    color: {
      type: String,
      trim: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "La couleur doit être un code hexadécimal valide"],
    },
    // Status tracking
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastAccessed: {
      type: Date,
    },
    accessCount: {
      type: Number,
      default: 0,
      min: [0, "Le nombre d'accès ne peut pas être négatif"],
    },
    // Reminder settings
    reminder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      date: {
        type: Date,
      },
      frequency: {
        type: String,
        enum: ["once", "daily", "weekly", "monthly"],
        default: "once",
      },
      lastNotified: {
        type: Date,
      },
    },
    // Metadata
    metadata: {
      version: { type: Number, default: 1 },
      source: {
        type: String,
        trim: true,
        maxlength: [100, "La source ne peut pas dépasser 100 caractères"],
      },
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
      },
      estimatedReadTime: {
        type: Number,
        min: [0, "Le temps de lecture estimé ne peut pas être négatif"],
      },
      contentPreview: {
        type: String,
        trim: true,
        maxlength: [300, "L'aperçu du contenu ne peut pas dépasser 300 caractères"],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =============== INDEXES =================
BookmarkSchema.index({ userId: 1, contentType: 1, contentId: 1 }, { unique: true });
BookmarkSchema.index({ userId: 1, isArchived: 1 });
BookmarkSchema.index({ userId: 1, priority: -1 });
BookmarkSchema.index({ userId: 1, category: 1 }, { sparse: true });
BookmarkSchema.index({ userId: 1, tags: 1 }, { sparse: true });
BookmarkSchema.index({ "reminder.enabled": 1, "reminder.date": 1 }, { sparse: true });
BookmarkSchema.index({ lastAccessed: -1 }, { sparse: true });
BookmarkSchema.index({ createdAt: -1 });

// =============== VIRTUALS =============
/**
 * Virtual field to check if the bookmark reminder is due.
 * @returns {boolean} True if reminder is enabled and due date has passed.
 */
BookmarkSchema.virtual("isReminderDue").get(function () {
  if (!this.reminder?.enabled || !this.reminder?.date) return false;
  return new Date() >= this.reminder.date;
});

/**
 * Virtual field for days since last access.
 * @returns {number} Number of days since last accessed.
 */
BookmarkSchema.virtual("daysSinceLastAccess").get(function () {
  if (!this.lastAccessed) return null;
  const diffTime = Math.abs(new Date() - this.lastAccessed);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

/**
 * Virtual field for bookmark age in days.
 * @returns {number} Number of days since bookmark was created.
 */
BookmarkSchema.virtual("ageInDays").get(function () {
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

/**
 * Virtual field for formatted content type.
 * @returns {string} Human-readable content type in French.
 */
BookmarkSchema.virtual("formattedContentType").get(function () {
  const typeMap = {
    question: "Question",
    resource: "Ressource",
    course: "Cours",
    topic: "Sujet",
    quiz: "Quiz",
  };
  return typeMap[this.contentType] || this.contentType;
});

// =============== MIDDLEWARE =============
/**
 * Pre-save middleware to validate references and update metadata.
 * @param {Function} next - Callback to proceed with save.
 */
BookmarkSchema.pre("save", async function (next) {
  try {
    // Validate user exists
    const user = await model("User").findById(this.userId);
    if (!user) {
      return next(new Error("ID utilisateur invalide"));
    }

    // Validate content exists
    const modelName = {
      question: "Question",
      resource: "Resource",
      course: "CourseContent",
      topic: "Topic",
      quiz: "Quiz",
    }[this.contentType];

    const content = await model(modelName).findById(this.contentId);
    if (!content) {
      return next(new Error(`ID de ${this.contentType} invalide`));
    }

    // Auto-populate title if not provided
    if (!this.title && content.title) {
      this.title = content.title;
    }

    // Auto-populate content preview if not provided
    if (!this.metadata.contentPreview && content.description) {
      this.metadata.contentPreview = content.description.substring(0, 300);
    }

    // Update metadata version
    if (this.isModified() && !this.isNew) {
      this.metadata.version += 1;
    }

    // Normalize tags to lowercase
    if (this.tags && this.tags.length > 0) {
      this.tags = this.tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
      // Remove duplicates
      this.tags = [...new Set(this.tags)];
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-save middleware to handle reminder validation.
 * @param {Function} next - Callback to proceed with save.
 */
BookmarkSchema.pre("save", function (next) {
  // Validate reminder date if enabled
  if (this.reminder?.enabled && this.reminder?.date) {
    if (this.reminder.date <= new Date()) {
      return next(new Error("La date de rappel doit être dans le futur"));
    }
  }

  // Clear reminder date if disabled
  if (!this.reminder?.enabled) {
    this.reminder = {
      enabled: false,
      date: undefined,
      frequency: "once",
      lastNotified: undefined,
    };
  }

  next();
});

// =============== METHODS =============
/**
 * Mark bookmark as accessed and increment access count.
 * @returns {Promise<Document>} Updated bookmark document.
 */
BookmarkSchema.methods.markAsAccessed = function () {
  this.lastAccessed = new Date();
  this.accessCount += 1;
  return this.save();
};

/**
 * Add tags to the bookmark.
 * @param {string[]} newTags - Array of tags to add.
 * @returns {Promise<Document>} Updated bookmark document.
 */
BookmarkSchema.methods.addTags = function (newTags) {
  if (!Array.isArray(newTags)) return Promise.resolve(this);
  
  const normalizedTags = newTags
    .map(tag => tag.toLowerCase().trim())
    .filter(tag => tag.length > 0 && !this.tags.includes(tag));
  
  this.tags.push(...normalizedTags);
  
  // Limit to 10 tags
  if (this.tags.length > 10) {
    this.tags = this.tags.slice(0, 10);
  }
  
  return this.save();
};

/**
 * Remove tags from the bookmark.
 * @param {string[]} tagsToRemove - Array of tags to remove.
 * @returns {Promise<Document>} Updated bookmark document.
 */
BookmarkSchema.methods.removeTags = function (tagsToRemove) {
  if (!Array.isArray(tagsToRemove)) return Promise.resolve(this);
  
  const normalizedTagsToRemove = tagsToRemove.map(tag => tag.toLowerCase().trim());
  this.tags = this.tags.filter(tag => !normalizedTagsToRemove.includes(tag));
  
  return this.save();
};

/**
 * Archive or unarchive the bookmark.
 * @param {boolean} archived - Whether to archive the bookmark.
 * @returns {Promise<Document>} Updated bookmark document.
 */
BookmarkSchema.methods.setArchived = function (archived = true) {
  this.isArchived = archived;
  return this.save();
};

/**
 * Set reminder for the bookmark.
 * @param {Date} reminderDate - Date for the reminder.
 * @param {string} frequency - Frequency of the reminder.
 * @returns {Promise<Document>} Updated bookmark document.
 */
BookmarkSchema.methods.setReminder = function (reminderDate, frequency = "once") {
  if (reminderDate <= new Date()) {
    throw new Error("La date de rappel doit être dans le futur");
  }
  
  this.reminder = {
    enabled: true,
    date: reminderDate,
    frequency,
    lastNotified: undefined,
  };
  
  return this.save();
};

/**
 * Clear reminder for the bookmark.
 * @returns {Promise<Document>} Updated bookmark document.
 */
BookmarkSchema.methods.clearReminder = function () {
  this.reminder = {
    enabled: false,
    date: undefined,
    frequency: "once",
    lastNotified: undefined,
  };
  
  return this.save();
};

/**
 * Get bookmark statistics for the user.
 * @param {string} userId - User ID to get statistics for.
 * @returns {Promise<Object>} Bookmark statistics.
 */
BookmarkSchema.statics.getBookmarkStats = function (userId) {
  return this.aggregate([
    { $match: { userId: Types.ObjectId(userId), isActive: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        archived: { $sum: { $cond: ["$isArchived", 1, 0] } },
        withReminders: { $sum: { $cond: ["$reminder.enabled", 1, 0] } },
        byContentType: {
          $push: "$contentType"
        },
        avgAccessCount: { $avg: "$accessCount" },
        totalAccessCount: { $sum: "$accessCount" },
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        active: { $subtract: ["$total", "$archived"] },
        archived: 1,
        withReminders: 1,
        avgAccessCount: { $round: ["$avgAccessCount", 2] },
        totalAccessCount: 1,
        contentTypeDistribution: {
          $reduce: {
            input: "$byContentType",
            initialValue: {},
            in: {
              $mergeObjects: [
                "$$value",
                { $arrayToObject: [[ { k: "$$this", v: { $add: [{ $ifNull: [{ $getField: { field: "$$this", input: "$$value" } }, 0] }, 1] } } ]] }
              ]
            }
          }
        }
      }
    }
  ]);
};

/**
 * Bookmark model for interacting with the Bookmark collection.
 * @type {mongoose.Model}
 */
module.exports = {
  Bookmark: model("Bookmark", BookmarkSchema),
};