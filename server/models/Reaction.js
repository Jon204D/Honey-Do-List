const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  emoji: {
    type: String,
    required: true, // e.g., "👍", "❤️", etc.
  },
  count: {
    type: Number,
    default: 0,
  },
});

reactionSchema.index({ taskId: 1, emoji: 1 }, { unique: true });

module.exports = mongoose.model("Reaction", reactionSchema);