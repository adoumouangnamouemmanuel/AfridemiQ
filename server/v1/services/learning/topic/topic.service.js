const { Topic } = require("../../../models/learning/topic.model");
const { Subject } = require("../../../models/learning/subject.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const ConflictError = require("../../../errors/conflictError");
const createLogger = require("../../logging.service");

const logger = createLogger("TopicService");

// =============== CREATE TOPIC ===============
const createTopic = async (topicData) => {
  logger.info("===================createTopic=======================");

  // Verify subject exists
  const subject = await Subject.findById(topicData.subjectId);
  if (!subject) {
    throw new NotFoundError("Matière non trouvée");
  }

  // Check if topic with same name exists for this subject
  const existingTopic = await Topic.findOne({
    name: { $regex: new RegExp(`^${topicData.name}$`, "i") },
    subjectId: topicData.subjectId,
  });
  if (existingTopic) {
    throw new ConflictError(
      "Un sujet avec ce nom existe déjà pour cette matière"
    );
  }

  const topic = new Topic(topicData);
  await topic.save();

  // Populate subject information
  await topic.populate("subjectId", "name code");

  logger.info("++++++✅ CREATE TOPIC: Topic created successfully ++++++");
  return topic;
};

// =============== GET ALL TOPICS ===============
const getTopics = async (query) => {
  logger.info("===================getTopics=======================");

  const {
    page = 1,
    limit = 10,
    subjectId,
    difficulty,
    isActive,
    isPremium,
    isPopular,
    hasQuestions,
    hasResources,
    search,
    sortBy = "order",
    sortOrder = "asc",
  } = query;

  // Build filter object
  const filter = { status: "active" };

  if (subjectId) filter.subjectId = subjectId;
  if (difficulty) filter.difficulty = difficulty;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (isPremium !== undefined) filter.isPremium = isPremium === "true";
  if (isPopular !== undefined) filter.isPopular = isPopular === "true";
  if (hasQuestions !== undefined) filter.hasQuestions = hasQuestions === "true";
  if (hasResources !== undefined) filter.hasResources = hasResources === "true";

  // Add search functionality
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { keywords: { $in: [search.toLowerCase()] } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query with pagination
  const [topics, total] = await Promise.all([
    Topic.find(filter)
      .populate("subjectId", "name code")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Topic.countDocuments(filter),
  ]);

  const pagination = {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    totalCount: total,
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };

  logger.info("++++++✅ GET TOPICS: Topics retrieved successfully ++++++");
  return { topics, pagination };
};

// =============== GET TOPIC BY ID ===============
const getTopicById = async (topicId) => {
  logger.info("===================getTopicById=======================");

  const topic = await Topic.findById(topicId).populate(
    "subjectId",
    "name code"
  );
  if (!topic) {
    throw new NotFoundError("Sujet non trouvé");
  }

  logger.info("++++++✅ GET TOPIC BY ID: Topic retrieved successfully ++++++");
  return topic;
};

// =============== UPDATE TOPIC ===============
const updateTopic = async (topicId, updateData) => {
  logger.info("===================updateTopic=======================");

  // Check if topic exists
  const existingTopic = await Topic.findById(topicId);
  if (!existingTopic) {
    throw new NotFoundError("Sujet non trouvé");
  }

  // If updating subjectId, verify it exists
  if (updateData.subjectId) {
    const subject = await Subject.findById(updateData.subjectId);
    if (!subject) {
      throw new NotFoundError("Matière non trouvée");
    }
  }

  // Check for duplicate name if name is being updated
  if (updateData.name && updateData.name !== existingTopic.name) {
    const duplicateName = await Topic.findOne({
      name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
      subjectId: updateData.subjectId || existingTopic.subjectId,
      _id: { $ne: topicId },
    });
    if (duplicateName) {
      throw new ConflictError(
        "Un sujet avec ce nom existe déjà pour cette matière"
      );
    }
  }

  const topic = await Topic.findByIdAndUpdate(
    topicId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate("subjectId", "name code");

  logger.info("++++++✅ UPDATE TOPIC: Topic updated successfully ++++++");
  return topic;
};

// =============== DELETE TOPIC ===============
const deleteTopic = async (topicId) => {
  logger.info("===================deleteTopic=======================");

  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new NotFoundError("Sujet non trouvé");
  }

  // Soft delete - just mark as inactive
  await Topic.findByIdAndUpdate(topicId, {
    isActive: false,
    status: "inactive",
  });

  logger.info("++++++✅ DELETE TOPIC: Topic deleted successfully ++++++");
};

// =============== GET TOPICS BY SUBJECT ===============
const getTopicsBySubject = async (subjectId, options = {}) => {
  logger.info("===================getTopicsBySubject=======================");

  // Verify subject exists
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new NotFoundError("Matière non trouvée");
  }

  const topics = await Topic.findBySubject(subjectId, options);

  logger.info(
    "++++++✅ GET TOPICS BY SUBJECT: Topics retrieved successfully ++++++"
  );
  return topics;
};

// =============== GET TOPICS BY DIFFICULTY ===============
const getTopicsByDifficulty = async (difficulty, subjectId = null) => {
  logger.info(
    "===================getTopicsByDifficulty======================="
  );

  if (!difficulty) {
    throw new BadRequestError("Difficulté requise");
  }

  const topics = await Topic.findByDifficulty(difficulty, subjectId);

  logger.info(
    "++++++✅ GET TOPICS BY DIFFICULTY: Topics retrieved successfully ++++++"
  );
  return topics;
};

// =============== GET POPULAR TOPICS ===============
const getPopularTopics = async (limit = 10, subjectId = null) => {
  logger.info("===================getPopularTopics=======================");

  const topics = await Topic.getPopular(limit, subjectId);

  logger.info("++++++✅ GET POPULAR TOPICS: Popular topics retrieved ++++++");
  return topics;
};

// =============== SEARCH TOPICS ===============
const searchTopics = async (searchTerm, filters = {}) => {
  logger.info("===================searchTopics=======================");

  if (!searchTerm || searchTerm.trim().length < 2) {
    throw new BadRequestError(
      "Le terme de recherche doit contenir au moins 2 caractères"
    );
  }

  const { subjectId } = filters;
  const topics = await Topic.searchByKeyword(searchTerm.trim(), subjectId);

  logger.info("++++++✅ SEARCH TOPICS: Search completed successfully ++++++");
  return topics;
};

// =============== UPDATE TOPIC STATS ===============
const updateTopicStats = async (topicId, field, increment = 1) => {
  logger.info("===================updateTopicStats=======================");

  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new NotFoundError("Sujet non trouvé");
  }

  await topic.updateStats(field, increment);

  logger.info("++++++✅ UPDATE TOPIC STATS: Stats updated successfully ++++++");
  return topic;
};

// =============== ADD STUDENT TO TOPIC ===============
const addStudentToTopic = async (topicId) => {
  logger.info("===================addStudentToTopic=======================");

  const topic = await Topic.findById(topicId);
  if (!topic) {
    throw new NotFoundError("Sujet non trouvé");
  }

  await topic.addStudent();

  logger.info(
    "++++++✅ ADD STUDENT TO TOPIC: Student added successfully ++++++"
  );
  return topic;
};

module.exports = {
  createTopic,
  getTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
  getTopicsBySubject,
  getTopicsByDifficulty,
  getPopularTopics,
  searchTopics,
  updateTopicStats,
  addStudentToTopic,
};
