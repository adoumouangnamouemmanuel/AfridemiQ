const express = require("express");
const router = express.Router();
const noteController = require("../../controllers/learning/note.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { apiLimiter } = require("../../middlewares/rate.limit.middleware");
const {
  createNoteSchema,
  updateNoteSchema,
  getNoteSchema,
} = require("../../schemas/learning/note.schema");

router.use(apiLimiter);
router.use(authMiddleware);

router.get("/:id", noteController.getNoteById);

router.get("/", validateMiddleware(getNoteSchema), noteController.getNotes);

router.post(
  "/",
  validateMiddleware(createNoteSchema),
  noteController.createNote
);

router.put(
  "/:id",
  validateMiddleware(updateNoteSchema),
  noteController.updateNote
);

router.delete("/:id", noteController.deleteNote);

module.exports = router;