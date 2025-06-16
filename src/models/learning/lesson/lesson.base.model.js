const mongoose = require("mongoose");
const { Schema } = mongoose;

// Shared constants
const INTERACTIVITY_LEVELS = ["low", "medium", "high"];

// Shared Feedback Subschema
const FeedbackSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Identifiant d'utilisateur requis"],
  },
  rating: {
    type: Number,
    min: [0, "La note doit être au moins 0"],
    max: [10, "La note ne peut dépasser 10"],
    required: [true, "Note requise"],
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [500, "Commentaires trop longs (max 500 caractères)"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Lesson Tracking Subschema for aggregate statistics
const LessonTrackingSchema = new Schema({
  totalAttempts: {
    type: Number,
    default: 0,
    min: [0, "Total attempts cannot be negative"],
  },
  totalCompletions: {
    type: Number,
    default: 0,
    min: [0, "Total completions cannot be negative"],
  },
  averageCompletionTime: {
    type: Number,
    default: 0,
    min: [0, "Average completion time cannot be negative"],
  },
  completionRate: {
    type: Number,
    default: 0,
    min: [0, "Completion rate cannot be negative"],
    max: [100, "Completion rate cannot exceed 100"],
  },
  averageScore: {
    type: Number,
    default: 0,
    min: [0, "Average score cannot be negative"],
    max: [100, "Average score cannot exceed 100"],
  },
  totalStudyTime: {
    type: Number,
    default: 0,
    min: [0, "Total study time cannot be negative"],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  completedBy: [{ 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  }],
  difficultyRating: {
    type: Number,
    default: 0,
    min: [0, "Difficulty rating cannot be negative"],
    max: [10, "Difficulty rating cannot exceed 10"],
  },
  averageHintsUsed: {
    type: Number,
    default: 0,
    min: [0, "Average hints used cannot be negative"],
  },
});

// Lesson Base Schema
const LessonBaseSchema = new Schema(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: [true, "Identifiant du sujet requis"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Titre requis"],
      minlength: [3, "Titre trop court (min 3 caractères)"],
      maxlength: [100, "Titre trop long (max 100 caractères)"],
    },
    series: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (v) => v.every((s) => s.length >= 1),
        message: "Les séries ne peuvent pas être vides",
      },
    },
    overview: {
      type: String,
      trim: true,
      maxlength: [1000, "Résumé trop long (max 1000 caractères)"],
    },
    objectives: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (v) => v.every((o) => o.length >= 1),
        message: "Les objectifs ne peuvent pas être vides",
      },
    },
    keyPoints: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (v) => v.every((k) => k.length >= 1),
        message: "Les points clés ne peuvent pas être vides",
      },
    },
    duration: {
      type: Number,
      required: [true, "Durée requise"],
      min: [5, "La durée doit être d'au moins 5 minutes"],
    },
    resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
    exerciseIds: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
    interactivityLevel: {
      type: String,
      enum: {
        values: INTERACTIVITY_LEVELS,
        message: "Niveau d'interactivité invalide",
      },
      required: [true, "Niveau d'interactivité requis"],
    },
    offlineAvailable: {
      type: Boolean,
      default: false,
    },
    premiumOnly: {
      type: Boolean,
      default: false,
    },
    // Lesson tracking for aggregate statistics
    progressTracking: {
      type: LessonTrackingSchema,
      default: () => ({}),
    },
    feedback: [FeedbackSchema],
    metadata: {
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Créateur requis"],
      },
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  {
    timestamps: true,
    discriminatorKey: "subjectType",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
LessonBaseSchema.index({ topicId: 1 });
LessonBaseSchema.index({ resourceIds: 1 });
LessonBaseSchema.index({ exerciseIds: 1 });
LessonBaseSchema.index({ "progressTracking.completionRate": -1 });
LessonBaseSchema.index({ "progressTracking.averageScore": -1 });
LessonBaseSchema.index({ "progressTracking.completedBy": 1 });

// Instance methods for tracking updates
LessonBaseSchema.methods.updateProgressTracking = async function(userProgress) {
  try {
    const tracking = this.progressTracking;
    
    // Update completion tracking
    if (userProgress.isCompleted && !tracking.completedBy.includes(userProgress.userId)) {
      tracking.completedBy.push(userProgress.userId);
      tracking.totalCompletions += 1;
    }
    
    // Update attempts
    if (userProgress.isNewAttempt) {
      tracking.totalAttempts += 1;
    }
    
    // Recalculate averages based on all user progress for this lesson
    const UserProgress = mongoose.model('UserProgress');
    const allProgress = await UserProgress.find({
      'lessonProgress.lessonId': this._id,
      'lessonProgress.status': { $in: ['completed', 'mastered'] }
    });
    
    if (allProgress.length > 0) {
      const lessonProgressData = allProgress.flatMap(up => 
        up.lessonProgress.filter(lp => 
          lp.lessonId.toString() === this._id.toString() && 
          (lp.status === 'completed' || lp.status === 'mastered')
        )
      );
      
      if (lessonProgressData.length > 0) {
        // Calculate average score
        const validScores = lessonProgressData.filter(lp => lp.score !== undefined);
        if (validScores.length > 0) {
          tracking.averageScore = Math.round(
            validScores.reduce((sum, lp) => sum + lp.score, 0) / validScores.length
          );
        }
        
        // Calculate average completion time
        const validTimes = lessonProgressData.filter(lp => lp.timeSpent > 0);
        if (validTimes.length > 0) {
          tracking.averageCompletionTime = Math.round(
            validTimes.reduce((sum, lp) => sum + lp.timeSpent, 0) / validTimes.length
          );
        }
        
        // Calculate total study time
        tracking.totalStudyTime = lessonProgressData.reduce((sum, lp) => sum + (lp.timeSpent || 0), 0);
        
        // Calculate average hints used
        const validHints = lessonProgressData.filter(lp => lp.hintsUsed !== undefined);
        if (validHints.length > 0) {
          tracking.averageHintsUsed = Math.round(
            (validHints.reduce((sum, lp) => sum + lp.hintsUsed, 0) / validHints.length) * 10
          ) / 10; // Round to 1 decimal place
        }
      }
    }
    
    // Calculate completion rate
    tracking.completionRate = tracking.totalAttempts > 0 
      ? Math.round((tracking.totalCompletions / tracking.totalAttempts) * 100)
      : 0;
    
    tracking.lastUpdated = new Date();
    
    return this.save();
  } catch (error) {
    console.error('Error updating lesson progress tracking:', error);
    throw error;
  }
};

LessonBaseSchema.methods.addUserCompletion = function(userId) {
  if (!this.progressTracking.completedBy.includes(userId)) {
    this.progressTracking.completedBy.push(userId);
    this.progressTracking.totalCompletions += 1;
    this.progressTracking.lastUpdated = new Date();
    
    // Recalculate completion rate
    if (this.progressTracking.totalAttempts > 0) {
      this.progressTracking.completionRate = Math.round(
        (this.progressTracking.totalCompletions / this.progressTracking.totalAttempts) * 100
      );
    }
  }
  return this;
};

LessonBaseSchema.methods.incrementAttempts = function() {
  this.progressTracking.totalAttempts += 1;
  this.progressTracking.lastUpdated = new Date();
  
  // Recalculate completion rate
  this.progressTracking.completionRate = Math.round(
    (this.progressTracking.totalCompletions / this.progressTracking.totalAttempts) * 100
  );
  
  return this;
};

// Pre-save hook for validation
LessonBaseSchema.pre("save", async function (next) {
  try {
    // Validate topic
    const topic = await mongoose.model("Topic").findById(this.topicId);
    if (!topic) return next(new Error("Identifiant du sujet invalide"));

    // Validate resources
    if (this.resourceIds.length > 0) {
      const validResources = await mongoose
        .model("Resource")
        .countDocuments({ _id: { $in: this.resourceIds } });
      if (validResources !== this.resourceIds.length)
        return next(new Error("Identifiants de ressources invalides"));
    }

    // Validate exercises
    if (this.exerciseIds.length > 0) {
      const validExercises = await mongoose
        .model("Exercise")
        .countDocuments({ _id: { $in: this.exerciseIds } });
      if (validExercises !== this.exerciseIds.length)
        return next(new Error("Identifiants d'exercices invalides"));
    }

    // Validate users
    const user = await mongoose.model("User").findById(this.metadata.createdBy);
    if (!user) return next(new Error("Identifiant du créateur invalide"));
    if (this.metadata.updatedBy) {
      const updatedUser = await mongoose
        .model("User")
        .findById(this.metadata.updatedBy);
      if (!updatedUser)
        return next(new Error("Identifiant du modificateur invalide"));
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for completion status
LessonBaseSchema.virtual("completionStatus").get(function () {
  // Example logic based on progress tracking
  if (!this.progressTracking) return "not_started";
  const completion = this.progressTracking.completionRate;
  if (completion >= 100) return "completed";
  if (completion > 0) return "in_progress";
  return "not_started";
});

// Virtual for difficulty assessment
LessonBaseSchema.virtual("difficultyAssessment").get(function () {
  const tracking = this.progressTracking;
  if (!tracking || tracking.totalCompletions < 5) return "insufficient_data";
  
  if (tracking.completionRate >= 80 && tracking.averageScore >= 75) return "easy";
  if (tracking.completionRate >= 60 && tracking.averageScore >= 60) return "moderate";
  if (tracking.completionRate >= 40 && tracking.averageScore >= 45) return "challenging";
  return "difficult";
});

// Virtual for popularity score
LessonBaseSchema.virtual("popularityScore").get(function () {
  const tracking = this.progressTracking;
  if (!tracking) return 0;
  
  const completionWeight = tracking.totalCompletions * 2;
  const ratingWeight = tracking.averageScore / 10;
  const engagementWeight = tracking.totalStudyTime / 3600; // hours
  
  return Math.round((completionWeight + ratingWeight + engagementWeight) * 10) / 10;
});

module.exports = {
  Lesson: mongoose.model("Lesson", LessonBaseSchema),
};