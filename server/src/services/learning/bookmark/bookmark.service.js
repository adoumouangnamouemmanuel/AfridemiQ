const { Bookmark } = require("../../../models/learning/bookmark.model");
const { ApiError } = require("../../../utils/ApiError");
const createLogger = require("../../logging.service");

const logger = createLogger("BookmarkService");

class BookmarkService {
  async createBookmark(data) {
    try {
      const existingBookmark = await Bookmark.findOne({
        userId: data.userId,
        contentType: data.contentType,
        contentId: data.contentId,
      });
      if (existingBookmark) throw new ApiError(400, "Bookmark already exists");

      const bookmark = new Bookmark(data);
      await bookmark.save();
      logger.info(
        `Created bookmark for user: ${data.userId}, type: ${data.contentType}`
      );
      return await this.getBookmarkById(bookmark._id);
    } catch (error) {
      logger.error("Error creating bookmark:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to create bookmark");
    }
  }

  async getBookmarkById(id) {
    try {
      const bookmark = await Bookmark.findById(id)
        .populate("userId", "name email")
        .populate({
          path: "contentId",
          select: "question title name",
          model: function (doc) {
            return {
              question: "Question",
              resource: "Resource",
              course: "CourseContent",
              topic: "Topic",
              quiz: "Quiz",
            }[doc.contentType];
          },
        });
      if (!bookmark) throw new ApiError(404, "Bookmark not found");
      logger.info(`Retrieved bookmark: ${id}`);
      return bookmark;
    } catch (error) {
      logger.error("Error retrieving bookmark:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to retrieve bookmark");
    }
  }

  async getBookmarks(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;
      const query = {};
      if (filters.userId) query.userId = filters.userId;
      if (filters.contentType) query.contentType = filters.contentType;
      if (filters.contentId) query.contentId = filters.contentId;

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      const [bookmarks, total] = await Promise.all([
        Bookmark.find(query)
          .populate("userId", "name email")
          .populate({
            path: "contentId",
            select: "question title name",
            model: function (doc) {
              return {
                question: "Question",
                resource: "Resource",
                course: "CourseContent",
                topic: "Topic",
                quiz: "Quiz",
              }[doc.contentType];
            },
          })
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Bookmark.countDocuments(query),
      ]);

      logger.info(`Retrieved ${bookmarks.length} bookmarks`);
      return {
        bookmarks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      logger.error("Error retrieving bookmarks:", error);
      throw new ApiError(500, "Failed to retrieve bookmarks");
    }
  }

  async deleteBookmark(id) {
    try {
      const bookmark = await Bookmark.findByIdAndDelete(id);
      if (!bookmark) throw new ApiError(404, "Bookmark not found");
      logger.info(`Deleted bookmark: ${id}`);
      return { message: "Bookmark deleted successfully" };
    } catch (error) {
      logger.error("Error deleting bookmark:", error);
      throw error instanceof ApiError
        ? error
        : new ApiError(500, "Failed to delete bookmark");
    }
  }
}

module.exports = new BookmarkService();