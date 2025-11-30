const Comment = require("../models/Comment");

const getCommentsByTask = async (taskId) => {
  return await Comment.find({ taskId }).sort({ createdAt: 1 }); // Oldest first
};

const createComment = async (taskId, content) => {
  return await Comment.create({ taskId, content });
};

const deleteComment = async (commentId) => {
  return await Comment.findByIdAndDelete(commentId);
};

module.exports = {
  getCommentsByTask,
  createComment,
  deleteComment,
};