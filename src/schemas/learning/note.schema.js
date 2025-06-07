const Joi = require("joi");

const createNoteSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  topicId: Joi.string().hex().length(24).required(),
  series: Joi.array().items(Joi.string().trim().min(1)).optional(),
  content: Joi.string().max(5000).required(),
});

const updateNoteSchema = Joi.object({
  series: Joi.array().items(Joi.string().trim().min(1)).optional(),
  content: Joi.string().max(5000).optional(),
}).min(1);

const getNoteSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  topicId: Joi.string().hex().length(24).optional(),
});

module.exports = {
  createNoteSchema,
  updateNoteSchema,
  getNoteSchema,
};