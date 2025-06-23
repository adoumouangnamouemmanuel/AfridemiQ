const { StatusCodes } = require("http-status-codes");
const noteService = require("../../services/learning/note/note.service");
const createLogger = require("../../services/logging.service");

const logger = createLogger("NoteController");

const createNote = async (req, res) => {
  try {
    const note = await noteService.createNote(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Note créée avec succès",
      data: note,
    });
  } catch (error) {
    logger.error("Error creating note:", error);
    throw error;
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await noteService.getNoteById(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Note récupérée avec succès",
      data: note,
    });
  } catch (error) {
    logger.error("Error retrieving note:", error);
    throw error;
  }
};

const getNotes = async (req, res) => {
  try {
    const result = await noteService.getNotes(req.query, req.query);
    res.status(StatusCodes.OK).json({
      message: "Notes récupérées avec succès",
      data: result.notes,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Error retrieving notes:", error);
    throw error;
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await noteService.updateNote(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      message: "Note mise à jour avec succès",
      data: note,
    });
  } catch (error) {
    logger.error("Error updating note:", error);
    throw error;
  }
};

const deleteNote = async (req, res) => {
  try {
    const result = await noteService.deleteNote(req.params.id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    logger.error("Error deleting note:", error);
    throw error;
  }
};

module.exports = {
  createNote,
  getNoteById,
  getNotes,
  updateNote,
  deleteNote,
};