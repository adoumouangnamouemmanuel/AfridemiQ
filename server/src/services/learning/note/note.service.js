const { Note } = require("../../../models/learning/note.model");
const { ApiError } = require("../../../utils/ApiError");
const createLogger = require("../../logging.service");

const logger = createLogger("NoteService");

class NoteService {
  async createNote(data) {
    try {
      const note = new Note(data);
      await note.save();
      logger.info(`Created note for user: ${data.userId}`);
      return note;
    } catch (error) {
      logger.error("Error creating note:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to create note");
    }
  }

  async getNoteById(id) {
    try {
      const note = await Note.findById(id)
        .populate("userId", "name email")
        .populate("topicId", "name");
      if (!note) throw new ApiError(404, "Note not found");
      logger.info(`Retrieved note: ${id}`);
      return note;
    } catch (error) {
      logger.error("Error retrieving note:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to retrieve note");
    }
  }

  async getNotes(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;
      const query = {};
      if (filters.userId) query.userId = filters.userId;
      if (filters.topicId) query.topicId = filters.topicId;

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [notes, total] = await Promise.all([
        Note.find(query)
          .populate("userId", "name email")
          .populate("topicId", "name")
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Note.countDocuments(query),
      ]);

      logger.info(`Retrieved ${notes.length} notes`);
      return {
        notes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      logger.error("Error retrieving notes:", error);
      throw new ApiError(500, "Failed to retrieve notes");
    }
  }

  async updateNote(id, data) {
    try {
      const note = await Note.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      )
        .populate("userId", "name email")
        .populate("topicId", "name");
      if (!note) throw new ApiError(404, "Note not found");
      logger.info(`Updated note: ${id}`);
      return note;
    } catch (error) {
      logger.error("Error updating note:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to update note");
    }
  }

  async deleteNote(id) {
    try {
      const note = await Note.findByIdAndDelete(id);
      if (!note) throw new ApiError(404, "Note not found");
      logger.info(`Deleted note: ${id}`);
      return { message: "Note deleted successfully" };
    } catch (error) {
      logger.error("Error deleting note:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to delete note");
    }
  }
}

module.exports = new NoteService();