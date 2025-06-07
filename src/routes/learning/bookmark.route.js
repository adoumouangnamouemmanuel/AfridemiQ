const express = require("express");
const router = express.Router();
const bookmarkController = require("../../controllers/learning/bookmark.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createBookmarkSchema,
  getBookmarkSchema,
} = require("../../schemas/learning/bookmark.schema");

router.use(apiLimiter);
router.use(authMiddleware);

router.get("/:id", bookmarkController.getBookmarkById);

router.get(
  "/",
  validateMiddleware(getBookmarkSchema),
  bookmarkController.getBookmarks
);

router.post(
  "/",
  validateMiddleware(createBookmarkSchema),
  bookmarkController.createBookmark
);

router.delete("/:id", bookmarkController.deleteBookmark);

module.exports = router;