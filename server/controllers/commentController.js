const commentQueries = require("../queries/commentQueries");

const listComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await commentQueries.getCommentsByTask(taskId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const newComment = await commentQueries.createComment(taskId, content);
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    await commentQueries.deleteComment(commentId);
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listComments,
  addComment,
  removeComment,
};