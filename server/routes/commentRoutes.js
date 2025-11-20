const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

// Get all comments for a task
router.get("/task/:taskId", commentController.listComments);

// Add a comment to a task
router.post("/task/:taskId", commentController.addComment);

// Delete a specific comment by its ID
router.delete("/:commentId", commentController.removeComment);

module.exports = router;