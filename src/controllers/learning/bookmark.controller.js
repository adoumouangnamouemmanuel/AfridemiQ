const { StatusCodes } = require("http-status-codes");
const bookmarkService = require("../../services/learning/bookmark/bookmark.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("BookmarkController");

const createBookmark = async (req, res) => {
  try {
    const bookmark = await bookmarkService.createBookmark(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Marque-page créé avec succès",
      data: bookmark,
    });
  } catch (error) {
    logger.error("Error creating bookmark:", error);
    throw error;
  }
};

const getBookmarkById = async (req, res) => {
  try {
    const bookmark = await bookmarkService.getBookmarkById(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Marque-page récupéré avec succès",
      data: bookmark,
    });
  } catch (error) {
    logger.error("Error retrieving bookmark:", error);
    throw error;
  }
};

const getBookmarks = async (req, res) => {
  try {
    const result = await bookmarkService.getBookmarks(req.query, req.query);
    res.status(StatusCodes.OK).json({
      message: "Marques-pages récupérés avec succès",
      data: result.bookmarks,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error retrieving bookmarks:", error);
    throw error;
  }
};

const deleteBookmark = async (req, res) => {
  try {
    const result = await bookmarkService.deleteBookmark(req.params.id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    logger.error("Error deleting bookmark:", error);
    throw error;
  }
};

module.exports = {
  createBookmark,
  getBookmarkById,
  getBookmarks,
  deleteBookmark,
};