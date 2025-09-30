// queries/taskQueries.js

const Task = require("../models/Task");
const mongoose = require("mongoose");

const getAllTasksQuery = async () => {
    return await Task.find();
};

const getTaskByIDQuery = async (taskID) => {
    return await Task.findById(taskID);
};

const createTaskQuery = async(taskData) => {
    const task = new Task(taskData);
    return await task.save();
};

const updateTaskQuery = async (taskID, updateData) => {
    return await Task.findByIdAndUpdate(taskID, updateData, { new: true });
};

const deleteTaskQuery = async (taskID) => {
    return await Task.findByIdAndDelete(taskID);
};

const addReactionToTaskQuery = async (taskID, emoji) => {
    return await Task.findByIdAndUpdate(
    taskID,
    { $push: { reactions: emoji } },   // Mongo operator pushes to array
    { new: true }                      // return the updated task
  );
};

// for DASHBOARDING. FINALLY

// for tasks that YOU assign to OTHER
const getUserTasksQuery = async (userId) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return null; // presents no valid queries
    }
    // this should pop 'owner' field w username
    return await Task.find({ owner: userId })
        .populate("owner", "username email") // shows owner info
        .populate("assignedTo", "username email"); // shows assignee info
};

// for tasks that YOU have been ASSIGNED
const getTasksAssignedToUserQuery = async (userID) => {
  if (!mongoose.Types.ObjectId.isValid(userID)) return null;

  return await Task.find({ assignedTo: userID })
    .populate("owner", "username email")
    .populate("assignedTo", "username email");
};

// overall dashboard function, shows BOTH your owned tasks and which you've assigned
const getMyTasksQuery = async (userID, filters = {}) => {
  if (!mongoose.Types.ObjectId.isValid(userID)) return null;

  const query = {
    $or: [{ owner: userID }, {assignedTo: userID }],
  };

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.prority = filters.priority;
  if (filters.dueDate) query.dueDate = { $lte: new Date(filters.dueDate) };

  return await Task.find({
    $or: [{ owner: userID }, { assignedTo: userID }],
  })
    .populate("owner", "username email")
    .populate("assignedTo", "username email")
    .sort({ dueDate: 1 }); // sorts by due date ascnding bc we are royalty
};

module.exports = {
    getAllTasksQuery,
    getTaskByIDQuery,
    createTaskQuery,
    updateTaskQuery,
    deleteTaskQuery,
    addReactionToTaskQuery,
    getUserTasksQuery,
    getTasksAssignedToUserQuery,
    getMyTasksQuery
};





module.exports = {
    
};