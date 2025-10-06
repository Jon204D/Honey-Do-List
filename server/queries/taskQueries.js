// commonQueries/taskQueries.js

const task = require("../models/Task");

const createTask = async(taskData) => {
    const task = new Task(taskData);
    return await task.save();
};

const findTaskByID = async (taskID) => {
    return await Task.findByID(taskID).populate("author", "email");
};

const getAllTasks = async () => {
    return await Task.find().populate("author", "email");
};

const getUserTasks = async (userID) => {
    return await Task.find({ owner: userID });
};

const updateTask = async (taskID, updateData) => {
    return await Task.findByIDAndUpdate(taskID, updateData, { new: true });
};

const deleteTask = async (taskID) => {
    return await Task.findByIDAndDelete(taskID);
};

module.exports = {
    createTask,
    findTaskByID,
    getAllTasks,
    getUserTasks,
    updateTask,
    deleteTask,
};