const express = require("express");
const router = express.Router();
const reactionController = require("../controllers/reactionController");

// Get all reactions for a task
router.get("/task/:taskId", reactionController.listReactions);

// Add (increment) a reaction
router.post("/task/:taskId", reactionController.addReaction);

module.exports = router;