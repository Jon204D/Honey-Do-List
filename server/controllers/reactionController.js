const reactionQueries = require("../queries/reactionQueries");

const listReactions = async (req, res) => {
  try {
    const { taskId } = req.params;
    const reactions = await reactionQueries.getReactionsByTask(taskId);
    
    const reactionMap = {};
    reactions.forEach(r => {
        reactionMap[r.emoji] = r.count;
    });
    
    res.json(reactionMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addReaction = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { emoji } = req.body;
    const updatedReaction = await reactionQueries.incrementReaction(taskId, emoji);
    res.json(updatedReaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listReactions,
  addReaction,
};