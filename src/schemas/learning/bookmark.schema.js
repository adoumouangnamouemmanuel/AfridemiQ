const Joi = require("joi");

const createBookmarkSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  contentType: Joi.string()
    .valid("question", "resource", "course", "topic", "quiz")
    .required(),
  contentId: Joi.string().hex().length(24).required(),
});

const getBookmarkSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  contentType: Joi.string()
    .valid("question", "resource", "course", "topic", "quiz")
    .optional(),
  contentId: Joi.string().hex().length(24).optional(),
});

module.exports = {
  createBookmarkSchema,
  getBookmarkSchema,
};