const Reaction = require("../models/Reaction");

const getReactionsByTask = async (taskId) => {
  return await Reaction.find({ taskId });
};

const incrementReaction = async (taskId, emoji) => {
  return await Reaction.findOneAndUpdate(
    { taskId, emoji },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );
};

module.exports = {
  getReactionsByTask,
  incrementReaction,
};